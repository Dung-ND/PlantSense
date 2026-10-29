import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { CopyBlock } from "@/components/admin/CopyBlock";

export const metadata: Metadata = { title: "Product template" };

const example = {
  name: "BSV-IC007 Solar Drip Kit",
  shortName: "BSV-IC007 Solar Kit",
  sku: "BSV-IC007",
  slug: "bsv-ic007-solar-drip-kit",
  category: "reservoir-kit",
  waterSource: "reservoir",
  price: 79,
  compareAtPrice: 89,
  inStock: true,
  badge: "New",
  summary: "A solar-powered drip kit that waters up to 20 pots from a bucket — no tap, no power socket.",
  description: ["First paragraph for customers…", "Second paragraph…"],
  bestFor: ["Balconies without a tap", "Greenhouses"],
  highlights: [{ title: "Solar powered", text: "Charges in daylight, waters on schedule." }],
  specs: [
    { label: "Battery", value: "1000 mAh" },
    { label: "Tubing", value: "15 m" },
  ],
  inTheBox: ["Control unit with solar panel", "15 m tubing", "20 drippers"],
  videos: [{ url: "https://www.youtube.com/watch?v=VIDEO_ID", title: "How to install" }],
  assistantNotes: "Needs about 6 hours of sun per day. Max lift height not confirmed yet.",
  status: "draft",
};

const fields: [string, string][] = [
  ["name", "Full product name"],
  ["shortName", "Short name for cart and menus (max 40 characters)"],
  ["sku", "Model / SKU code (must be unique)"],
  ["slug", "URL name: lowercase-words-with-dashes (must be unique)"],
  ["category", "Category slug, e.g. timer, reservoir-kit — a new one creates a new filter"],
  ["waterSource", "\"tap\", \"reservoir\" or \"other\""],
  ["price / compareAtPrice", "Numbers. compareAtPrice is the old, crossed-out price (or null)"],
  ["inStock", "true or false"],
  ["badge", "Short label like \"New\" — or empty"],
  ["summary", "One sentence, max 300 characters"],
  ["description", "List of paragraphs"],
  ["bestFor", "List of short phrases"],
  ["highlights", "List of { title, text }"],
  ["specs", "List of { label, value }"],
  ["inTheBox", "List of items"],
  ["videos", "List of { url, title } — YouTube links"],
  ["assistantNotes", "Private notes for the customer chatbot"],
  ["status", "\"draft\" (hidden) or \"published\" (live)"],
];

const prompt = `Convert my product notes into JSON for my shop, using exactly this format. Use English for customer-facing text. Don't invent specs or prices: leave unknown values empty ("" or [] or null) and tell me what's missing. Reply with only the JSON.

FORMAT EXAMPLE:
${JSON.stringify(example, null, 2)}

MY NOTES:
`;

export default async function TemplatePage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin" className="btn-ghost -ml-3"><ArrowLeft className="size-4" aria-hidden /> Products</Link>
      <h1 className="mt-2 text-3xl font-semibold">Product template</h1>
      <p className="mt-2 text-muted">
        Every product follows this format. The form, “Fill with AI” and JSON import all produce it, and the server checks it before saving.
        Photos are always added by uploading in the form.
      </p>

      <div className="mt-8 grid gap-8">
        <section>
          <h2 className="text-lg font-semibold">Use any AI (ChatGPT, Claude, Gemini…)</h2>
          <p className="mt-1 text-sm text-muted">
            Copy this prompt into any AI chat, add your notes at the end, then paste its answer into <strong>Import / export template</strong> on the product form.
          </p>
          <CopyBlock text={prompt} label="Copy prompt" />
        </section>

        <section>
          <h2 className="text-lg font-semibold">Fields</h2>
          <dl className="card mt-3 divide-y divide-line text-sm">
            {fields.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]">
                <dt className="font-mono text-leaf-800">{k}</dt>
                <dd className="text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Example</h2>
          <CopyBlock text={JSON.stringify(example, null, 2)} label="Copy example" />
        </section>
      </div>
    </div>
  );
}
