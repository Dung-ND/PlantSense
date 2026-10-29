import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import { getProductBySku, getProducts } from "@/lib/products/catalog";
import { assistantTools, buildSystemPrompt } from "@/lib/assistant";
import { saveSubmission } from "@/lib/leads";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const bodySchema = z.object({
  sessionId: z.string().max(64).optional(),
  page: z.string().max(200).optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(40),
});

const leadSchema = z.object({
  name: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  garden: z.string().max(1000).optional(),
  interested_products: z.array(z.string().max(40)).max(10).optional(),
  request: z.string().max(1000).optional(),
  consent: z.boolean(),
});

/** Events streamed to the browser, one JSON object per line. */
export type ChatEvent =
  | { type: "delta"; text: string }
  | { type: "lead_saved" }
  | { type: "add_to_cart"; slug: string; quantity: number }
  | { type: "error"; message: string }
  | { type: "done" };

const MAX_TOOL_ROUNDS = 4;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "The assistant isn't configured yet." }, { status: 503 });
  }

  const limit = rateLimit(`chat:${clientKey(req)}`, Number(process.env.CHAT_RATE_LIMIT ?? 20), 60_000);
  if (!limit.ok) {
    return Response.json(
      { error: "You're sending messages quickly — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { messages, page, sessionId } = parsed.data;

  const client = new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL || undefined });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const products = await getProducts();
  const tools = assistantTools(products);
  const conversation: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(products, page) },
    // Keep the most recent turns only, to bound cost.
    ...messages.slice(-20),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const completion = await client.chat.completions.create(
            { model, messages: conversation, tools, stream: true, max_completion_tokens: 600 },
            { signal: req.signal },
          );

          let text = "";
          const toolCalls: { id: string; name: string; args: string }[] = [];
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;
            if (delta.content) {
              text += delta.content;
              send({ type: "delta", text: delta.content });
            }
            for (const call of delta.tool_calls ?? []) {
              const slot = (toolCalls[call.index] ??= { id: "", name: "", args: "" });
              if (call.id) slot.id = call.id;
              if (call.function?.name) slot.name += call.function.name;
              if (call.function?.arguments) slot.args += call.function.arguments;
            }
          }

          if (toolCalls.length === 0) break;

          conversation.push({
            role: "assistant",
            content: text || null,
            tool_calls: toolCalls.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args } })),
          });
          for (const call of toolCalls) {
            const result = await runTool(call.name, call.args, { send, sessionId, page, messages });
            conversation.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
          }
        }
        send({ type: "done" });
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("[chat] OpenAI request failed", err);
          send({ type: "error", message: "Sorry, I'm having trouble right now. Please try again in a moment." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function runTool(
  name: string,
  rawArgs: string,
  ctx: { send: (e: ChatEvent) => void; sessionId?: string; page?: string; messages: { role: string; content: string }[] },
) {
  let args: unknown;
  try {
    args = JSON.parse(rawArgs || "{}");
  } catch {
    return { ok: false, error: "Arguments were not valid JSON." };
  }

  if (name === "save_customer_info") {
    const lead = leadSchema.safeParse(args);
    if (!lead.success) return { ok: false, error: "Invalid fields." };
    if (!lead.data.consent) return { ok: false, error: "The visitor has not agreed yet. Ask for consent first." };
    if (!lead.data.phone && !lead.data.email) return { ok: false, error: "Need a phone number or email address." };
    try {
      const saved = await saveSubmission("chat-lead", {
        ...lead.data,
        sessionId: ctx.sessionId,
        page: ctx.page,
        transcript: ctx.messages.slice(-12),
      });
      ctx.send({ type: "lead_saved" });
      return { ok: true, reference: saved.id };
    } catch {
      return { ok: false, error: "Saving failed. Apologise and give the shop's contact email/phone instead." };
    }
  }

  if (name === "add_to_cart") {
    const input = z.object({ sku: z.string(), quantity: z.number().int().min(1).max(20) }).safeParse(args);
    const product = input.success ? await getProductBySku(input.data.sku) : null;
    if (!input.success || !product) return { ok: false, error: "Unknown product." };
    if (!product.inStock) return { ok: false, error: "That product is out of stock." };
    ctx.send({ type: "add_to_cart", slug: product.slug, quantity: input.data.quantity });
    return { ok: true, added: product.name, quantity: input.data.quantity, cart_page: "/cart" };
  }

  return { ok: false, error: `Unknown tool ${name}` };
}
