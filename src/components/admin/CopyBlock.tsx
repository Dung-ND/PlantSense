"use client";

import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";

export function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-3">
      <pre className="max-h-96 overflow-auto rounded-2xl bg-ink p-4 pr-28 text-xs leading-relaxed text-leaf-100">{text}</pre>
      <button
        type="button"
        className="btn absolute top-3 right-3 min-h-9 bg-white px-3 text-ink hover:bg-leaf-50"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <ClipboardCopy className="size-4" aria-hidden />} {copied ? "Copied" : label}
      </button>
    </div>
  );
}
