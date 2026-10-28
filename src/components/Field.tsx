import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { label: string; name: string; error?: string; hint?: string; optional?: boolean };

export function Field({ label, name, error, hint, optional, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      <input id={name} name={name} className="field-input" aria-invalid={!!error} aria-describedby={describedBy} {...props} />
      {hint && !error && <p id={`${name}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && <p id={`${name}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export function TextArea({ label, name, error, hint, optional, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      <textarea id={name} name={name} className="field-input min-h-28" aria-invalid={!!error} aria-describedby={describedBy} {...props} />
      {hint && !error && <p id={`${name}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && <p id={`${name}-error`} className="field-error">{error}</p>}
    </div>
  );
}
