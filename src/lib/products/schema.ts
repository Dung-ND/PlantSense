import { z } from "zod";

/**
 * THE PRODUCT TEMPLATE.
 *
 * Every product — typed in the admin form, filled by AI, or pasted as JSON —
 * must pass this schema before it is saved. Change fields here and the
 * form, the AI fill and the import all follow.
 */

const text = (max: number) => z.string().trim().max(max);
const list = <T extends z.ZodType>(item: T, max: number) => z.array(item).max(max).default([]);

export const youtubeIdFrom = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

export const imageSchema = z.object({
  url: z.string().regex(/^\/media\/[\w.-]+$/, "Images must be uploaded through the admin"),
  alt: text(200).default(""),
});

export const videoSchema = z.object({
  url: z.string().trim().refine((u) => youtubeIdFrom(u) !== null, "Must be a YouTube link"),
  title: text(120).default(""),
});

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  sku: text(40).min(1, "Required"),
  name: text(120).min(2, "Required"),
  shortName: text(40).min(2, "Required"),
  status: z.enum(["draft", "published"]).default("draft"),
  category: z
    .string()
    .trim()
    .min(2, "Required")
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  waterSource: z.enum(["tap", "reservoir", "other"]).default("other"),
  price: z.number({ error: "Enter a price" }).min(0).max(1_000_000),
  compareAtPrice: z.number().min(0).max(1_000_000).nullable().default(null),
  inStock: z.boolean().default(true),
  badge: text(30).default(""),
  summary: text(300).min(10, "Write at least a short sentence"),
  description: list(text(2000).min(1), 8),
  bestFor: list(text(80).min(1), 8),
  highlights: list(z.object({ title: text(60).min(1), text: text(300).min(1) }), 8),
  specs: list(z.object({ label: text(60).min(1), value: text(200).min(1) }), 40),
  inTheBox: list(text(120).min(1), 30),
  images: list(imageSchema, 12),
  videos: list(videoSchema, 6),
  /** Built-in drawing used when there are no photos (legacy products). */
  illustration: z.enum(["timer", "kit", "kit-large"]).nullable().default(null),
  /** Facts only the customer chatbot sees: setup tips, caveats, unconfirmed specs. */
  assistantNotes: text(2000).default(""),
  sortOrder: z.number().int().min(0).max(100_000).default(100),
});

export type Product = z.output<typeof productSchema>;
export type ProductInput = z.input<typeof productSchema>;
export type WaterSource = Product["waterSource"];

/** Labels for known categories; any new category slug gets a readable label automatically. */
const categoryInfo: Record<string, { label: string; description: string }> = {
  timer: { label: "Tap timers", description: "Screw onto an outdoor tap and water on a schedule." },
  "reservoir-kit": { label: "Reservoir drip kits", description: "No tap needed — a pump draws from a tank or bucket." },
};

export function categoryLabel(slug: string) {
  return categoryInfo[slug]?.label ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export function categoryDescription(slug: string) {
  return categoryInfo[slug]?.description ?? "";
}

export const waterSourceLabels: Record<WaterSource, string> = {
  tap: "Connects to a tap",
  reservoir: "Runs from a reservoir",
  other: "",
};

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function emptyProduct(): Product {
  return productSchema.parse({
    slug: "new-product",
    sku: "NEW",
    name: "New product",
    shortName: "New product",
    category: "timer",
    price: 0,
    summary: "Short one-line summary of the product.",
  });
}

/** Lightweight product info the browser needs (cart, chat, toasts). */
export interface CatalogItem {
  slug: string;
  sku: string;
  name: string;
  shortName: string;
  price: number;
  inStock: boolean;
  image: Product["images"][number] | null;
  illustration: Product["illustration"];
}

export function toCatalogItem(p: Product): CatalogItem {
  return {
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortName: p.shortName,
    price: p.price,
    inStock: p.inStock,
    image: p.images[0] ?? null,
    illustration: p.illustration,
  };
}
