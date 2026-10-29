import { z } from "zod";
import { adminGuard } from "@/lib/admin/auth";
import { aiConfigured, aiFillProduct } from "@/lib/admin/ai-fill";
import { listProducts } from "@/lib/products/repo";

export const maxDuration = 60;

const bodySchema = z.object({
  instructions: z.string().trim().min(3, "Write a few words about the product.").max(8000),
  // The form's current state; may be incomplete, so it's only loosely checked here.
  current: z.record(z.string(), z.unknown()),
});

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!aiConfigured()) return Response.json({ error: "Set OPENAI_API_KEY on the server to use AI fill." }, { status: 503 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  try {
    const categories = [...new Set(listProducts({ includeDrafts: true }).map((p) => p.category))];
    const result = await aiFillProduct({ instructions: parsed.data.instructions, current: parsed.data.current, categories });
    return Response.json(result);
  } catch (err) {
    console.error("[admin] AI fill failed", err);
    return Response.json({ error: "The AI request failed. Check the API key/model, or try again." }, { status: 502 });
  }
}
