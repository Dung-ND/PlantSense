import "server-only";
import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { site } from "@/config/site";
import { imageForAi } from "@/lib/media";
import { productSchema, slugify, type Product } from "@/lib/products/schema";

/**
 * "Fill with AI": turns the admin's free-form notes (and photos) into the
 * product template. The model is forced to answer in exactly this JSON shape,
 * then the result is checked against the same schema the form uses — nothing
 * is saved until the admin reviews it and presses Save.
 *
 * Works with any OpenAI model that supports structured outputs. To use a
 * different provider, only this file needs to change.
 */

export const aiConfigured = () => Boolean(process.env.OPENAI_API_KEY);

const str = { type: "string" } as const;
const strList = { type: "array", items: str } as const;
const nullable = (type: "string" | "number" | "boolean") => ({ type: [type, "null"] });

// Strict structured-output schema: every key is required; "unknown" is expressed as null / [].
const templateJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name", "shortName", "sku", "slug", "category", "waterSource", "price", "compareAtPrice", "inStock", "badge",
    "summary", "description", "bestFor", "highlights", "specs", "inTheBox", "videos", "imageAlts", "assistantNotes", "notesForAdmin",
  ],
  properties: {
    name: { ...str, description: "Full product name, e.g. 'HCT-322 Automatic Water Timer'" },
    shortName: { ...str, description: "Max 40 characters, e.g. 'HCT-322 Timer'" },
    sku: { ...str, description: "Model / SKU code" },
    slug: { ...str, description: "URL name: lowercase words joined by dashes" },
    category: { ...str, description: "Category slug. Prefer one of the existing categories." },
    waterSource: { type: "string", enum: ["tap", "reservoir", "other"] },
    price: { ...nullable("number"), description: "Selling price as a number. null if the admin did not give one." },
    compareAtPrice: { ...nullable("number"), description: "Old/crossed-out price, only if the admin mentions a discount" },
    inStock: nullable("boolean"),
    badge: { ...str, description: "Short label like 'New' or 'Best seller', or empty string" },
    summary: { ...str, description: "One customer-facing sentence, max 300 characters" },
    description: { ...strList, description: "1–3 short paragraphs for customers" },
    bestFor: { ...strList, description: "2–4 short phrases: who/where it suits" },
    highlights: {
      type: "array",
      description: "3–4 key benefits",
      items: { type: "object", additionalProperties: false, required: ["title", "text"], properties: { title: str, text: str } },
    },
    specs: {
      type: "array",
      description: "Only specs stated by the admin or clearly visible in the photos",
      items: { type: "object", additionalProperties: false, required: ["label", "value"], properties: { label: str, value: str } },
    },
    inTheBox: strList,
    videos: {
      type: "array",
      description: "YouTube links the admin provided",
      items: { type: "object", additionalProperties: false, required: ["url", "title"], properties: { url: str, title: str } },
    },
    imageAlts: { ...strList, description: "One short alt text per attached photo, in the same order" },
    assistantNotes: { ...str, description: "Facts for the customer chatbot only: setup tips, caveats, unconfirmed details" },
    notesForAdmin: { ...strList, description: "Short notes to the admin: what you changed, what is missing or uncertain" },
  },
} as const;

export interface AiFillResult {
  product: Product | null;
  draft: Record<string, unknown>;
  notes: string[];
  issues: string[];
}

export async function aiFillProduct(opts: {
  instructions: string;
  current: Partial<Product>;
  categories: string[];
}): Promise<AiFillResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL || undefined });
  const model = process.env.ADMIN_AI_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const images = opts.current.images ?? [];

  const system = `You help the owner of ${site.name}, an online shop for automatic plant-watering devices, manage products.
Convert the admin's notes into the product template (JSON). The shop's language is English and its currency is ${site.currency}.

Rules:
- You are given the CURRENT product. Keep every current value unless the notes ask to change it or it is empty and the notes provide it.
- Never invent facts: prices, specs, capacities, certifications. If unknown, use null / empty and say so in notesForAdmin.
- Admin notes may be in any language (e.g. Vietnamese); write customer-facing text in clear, friendly English.
- Prices: "79", "$79", "79 usd" → 79. Vietnamese "k" means thousand.
- Look at the attached photos: describe each in imageAlts (same order), and use clearly readable model numbers or specs from packaging.
- Existing categories: ${opts.categories.join(", ") || "(none)"}. Reuse one if it fits; otherwise create a short dashed slug.
- waterSource: "tap" if it connects to a tap/hose, "reservoir" if it pumps from a tank/bucket, otherwise "other".
- Put caveats and uncertain details in assistantNotes (the customer chatbot reads them) and notesForAdmin.`;

  const content: ChatCompletionContentPart[] = [
    { type: "text", text: `CURRENT PRODUCT:\n${JSON.stringify({ ...opts.current, images: undefined }, null, 2)}\n\nNumber of attached photos: ${images.length}\n\nADMIN NOTES:\n${opts.instructions}` },
  ];
  for (const img of images) {
    const dataUrl = await imageForAi(img.url);
    if (dataUrl) content.push({ type: "image_url", image_url: { url: dataUrl, detail: "low" } });
  }

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
    response_format: { type: "json_schema", json_schema: { name: "product_template", strict: true, schema: templateJsonSchema } },
    max_completion_tokens: 2500,
  });

  const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}");
  const { imageAlts = [], notesForAdmin = [], ...fields } = raw as Record<string, unknown> & { imageAlts?: string[]; notesForAdmin?: string[] };

  // Drop nulls so the current values / template defaults apply, then merge over the current product.
  const cleaned = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null));
  const draft: Record<string, unknown> = {
    ...opts.current,
    ...cleaned,
    slug: opts.current.slug || slugify(String(cleaned.slug || cleaned.name || "")),
    images: images.map((img, i) => ({ url: img.url, alt: img.alt || imageAlts[i] || "" })),
  };
  if (fields.compareAtPrice === null) draft.compareAtPrice = opts.current.compareAtPrice ?? null;

  const parsed = productSchema.safeParse(draft);
  return {
    product: parsed.success ? parsed.data : null,
    draft,
    notes: notesForAdmin,
    issues: parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".") || "product"}: ${i.message}`),
  };
}
