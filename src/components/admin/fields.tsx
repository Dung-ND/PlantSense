"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function FieldShell({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const fmt = (n: number | null) => (n == null || Number.isNaN(n) ? "" : String(n));

/** Number input that lets people clear the box while typing; empty → null, junk → NaN (caught by validation). */
export function NumberInput({ id, value, onChange, error, ...props }: { id: string; value: number | null; onChange: (n: number | null) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [text, setText] = useState(fmt(value));
  const [seen, setSeen] = useState(value);
  // Value replaced from outside (AI fill, JSON import): show it.
  if (!Object.is(value, seen)) {
    setSeen(value);
    setText(fmt(value));
  }
  return (
    <input
      id={id}
      inputMode="decimal"
      className="field-input"
      value={text}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(e) => {
        const t = e.target.value.trim();
        const n = t === "" ? null : Number(t.replace(",", "."));
        setText(e.target.value);
        setSeen(n);
        onChange(n);
      }}
      {...props}
    />
  );
}

function RowControls({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (from: number, to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-start gap-0.5">
      <button type="button" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-leaf-50 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button type="button" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-leaf-50 disabled:opacity-30" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" aria-hidden />
      </button>
      <button type="button" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={onRemove} aria-label={`Remove ${label}`}>
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function StringListEditor({ label, items, onChange, placeholder, multiline, addLabel = "Add", error }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string; multiline?: boolean; addLabel?: string; error?: string }) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            {multiline ? (
              <textarea className="field-input min-h-24" value={item} placeholder={placeholder} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <input className="field-input" value={item} placeholder={placeholder} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <RowControls index={i} count={items.length} label={`${label} ${i + 1}`} onMove={(a, b) => onChange(move(items, a, b))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      {error && <p className="field-error">{error}</p>}
      <button type="button" className="btn-ghost mt-2 min-h-9 px-3" onClick={() => onChange([...items, ""])}>
        <Plus className="size-4" aria-hidden /> {addLabel}
      </button>
    </fieldset>
  );
}

export function PairListEditor<K extends string>({ label, items, keys, onChange, addLabel = "Add", multilineSecond, error }: { label: string; items: Record<K, string>[]; keys: [{ key: K; label: string; placeholder?: string }, { key: K; label: string; placeholder?: string }]; onChange: (items: Record<K, string>[]) => void; addLabel?: string; multilineSecond?: boolean; error?: string }) {
  const [a, b] = keys;
  const update = (i: number, key: K, value: string) => onChange(items.map((row, j) => (j === i ? { ...row, [key]: value } : row)));
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <ul className="space-y-2">
        {items.map((row, i) => (
          <li key={i} className="flex gap-2">
            <div className={`grid flex-1 gap-2 ${multilineSecond ? "" : "sm:grid-cols-[2fr_3fr]"}`}>
              <input className="field-input" value={row[a.key]} placeholder={a.placeholder} aria-label={`${a.label} ${i + 1}`} onChange={(e) => update(i, a.key, e.target.value)} />
              {multilineSecond ? (
                <textarea className="field-input min-h-16" value={row[b.key]} placeholder={b.placeholder} aria-label={`${b.label} ${i + 1}`} onChange={(e) => update(i, b.key, e.target.value)} />
              ) : (
                <input className="field-input" value={row[b.key]} placeholder={b.placeholder} aria-label={`${b.label} ${i + 1}`} onChange={(e) => update(i, b.key, e.target.value)} />
              )}
            </div>
            <RowControls index={i} count={items.length} label={`${label} ${i + 1}`} onMove={(x, y) => onChange(move(items, x, y))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      {error && <p className="field-error">{error}</p>}
      <button type="button" className="btn-ghost mt-2 min-h-9 px-3" onClick={() => onChange([...items, { [a.key]: "", [b.key]: "" } as Record<K, string>])}>
        <Plus className="size-4" aria-hidden /> {addLabel}
      </button>
    </fieldset>
  );
}
