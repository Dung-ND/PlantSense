"use client";

import { useState } from "react";
import { CircleAlert, Info, Loader2, Sparkles, Undo2 } from "lucide-react";
import type { Draft } from "@/components/admin/ProductEditor";

const EXAMPLE = `BSV-IC007 solar drip kit, 79 usd (was 89). Solar panel + 1000mAh battery, waters up to 20 pots, 15m tubing, 20 drippers. Good for balconies and greenhouses.
Video: https://youtu.be/xxxxxxxxxxx`;

export function AiFillPanel({ enabled, draft, onFill }: { enabled: boolean; draft: Draft; onFill: (d: Partial<Draft>) => void }) {
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [undo, setUndo] = useState<Draft | null>(null);

  async function run() {
    setBusy(true);
    setError("");
    setNotes([]);
    setIssues([]);
    try {
      const res = await fetch("/api/admin/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions, current: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "AI fill failed.");
      setUndo(draft);
      onFill((data.product ?? data.draft) as Partial<Draft>);
      setNotes(data.notes ?? []);
      setIssues(data.issues ?? []);
      setInstructions("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card overflow-hidden" aria-labelledby="ai-title">
      <div className="bg-gradient-to-br from-leaf-700 to-leaf-900 px-5 py-4 text-white">
        <h2 id="ai-title" className="flex items-center gap-2 font-semibold"><Sparkles className="size-4" aria-hidden /> Fill with AI</h2>
        <p className="mt-1 text-sm text-leaf-100">Paste notes in any language — price, specs, YouTube links. Upload photos first so the AI can see them. It fills the form; you check and save.</p>
      </div>
      <div className="space-y-3 p-5">
        {enabled ? (
          <>
            <label htmlFor="ai-notes" className="sr-only">Notes for the AI</label>
            <textarea
              id="ai-notes"
              className="field-input min-h-36 text-sm"
              placeholder={draft.name ? `What should change? e.g. "price 25, add video https://youtu.be/…, out of stock"` : EXAMPLE}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && instructions.trim()) run();
              }}
            />
            <button type="button" className="btn-primary w-full" disabled={busy || instructions.trim().length < 3} onClick={run}>
              {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Reading your notes…</> : <><Sparkles className="size-4" aria-hidden /> {draft.name ? "Update form" : "Fill form"}</>}
            </button>
          </>
        ) : (
          <p className="rounded-xl bg-sun-100 p-3 text-sm">Set <code>OPENAI_API_KEY</code> on the server to enable this. You can still fill the form by hand or paste template JSON below.</p>
        )}

        {error && <p role="alert" className="flex gap-2 text-sm text-red-700"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}</p>}

        {(notes.length > 0 || issues.length > 0 || undo) && (
          <div role="status" className="space-y-2 rounded-xl bg-leaf-50 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-leaf-800"><Info className="size-4" aria-hidden /> Form updated — please review before saving.</p>
            {notes.length > 0 && <ul className="list-disc space-y-1 pl-5 text-ink">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
            {issues.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-red-800">{issues.map((n, i) => <li key={i}>{n}</li>)}</ul>
            )}
            {undo && (
              <button type="button" className="btn-ghost min-h-8 px-2 text-sm" onClick={() => { onFill(undo); setUndo(null); setNotes([]); setIssues([]); }}>
                <Undo2 className="size-4" aria-hidden /> Undo AI changes
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
