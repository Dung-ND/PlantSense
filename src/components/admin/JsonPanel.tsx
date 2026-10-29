"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ClipboardCopy, FileJson } from "lucide-react";
import { productSchema } from "@/lib/products/schema";
import type { Draft } from "@/components/admin/ProductEditor";

/** Paste a filled-in product template (e.g. produced by ChatGPT/Claude elsewhere) or copy the current one. */
export function JsonPanel({ draft, onImport }: { draft: Draft; onImport: (d: Partial<Draft>) => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function apply() {
    let data: unknown;
    try {
      data = JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
    } catch {
      setMessage({ tone: "error", text: "That isn’t valid JSON. Paste exactly what the template looks like." });
      return;
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      setMessage({ tone: "error", text: "Expected one product object { … }." });
      return;
    }
    // Images can only come from uploads; keep the current ones.
    const rest = { ...(data as Record<string, unknown>) };
    delete rest.images;
    const merged = { ...draft, ...rest };
    const check = productSchema.safeParse(merged);
    onImport(merged as Partial<Draft>);
    setText("");
    setMessage(
      check.success
        ? { tone: "ok", text: "Imported into the form. Review and save." }
        : { tone: "error", text: `Imported, but ${check.error.issues.length} field(s) need fixing — see the form.` },
    );
  }

  return (
    <details className="card group">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-semibold">
        <FileJson className="size-4 text-leaf-600" aria-hidden /> Import / export template
      </summary>
      <div className="space-y-3 border-t border-line p-5">
        <p className="text-sm text-muted">
          Paste a product in the <Link href="/admin/template" target="_blank" className="font-medium text-leaf-700 underline">template format</Link> — for example one written by ChatGPT or Claude.
        </p>
        <label htmlFor="json-import" className="sr-only">Product JSON</label>
        <textarea id="json-import" className="field-input min-h-32 font-mono text-xs" placeholder='{ "name": "…", "price": 29.9, … }' value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary min-h-9 px-4" disabled={!text.trim()} onClick={apply}>Apply to form</button>
          <button
            type="button"
            className="btn-ghost min-h-9 px-3"
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-4" aria-hidden /> : <ClipboardCopy className="size-4" aria-hidden />} {copied ? "Copied" : "Copy this product"}
          </button>
        </div>
        {message && <p role="status" className={`text-sm ${message.tone === "ok" ? "text-leaf-700" : "text-red-700"}`}>{message.text}</p>}
      </div>
    </details>
  );
}
