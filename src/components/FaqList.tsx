import { ChevronDown } from "lucide-react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="card divide-y divide-line">
      {items.map((f) => (
        <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
            {f.q}
            <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-5 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
