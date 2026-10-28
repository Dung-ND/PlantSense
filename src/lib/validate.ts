/** Client-side checks that mirror the server's zod schemas, with friendly messages. */
export type Rules = Record<string, (value: string) => string | undefined>;

export const required = (label: string, min = 2) => (v: string) =>
  v.trim().length === 0 ? `Please enter your ${label}.` : v.trim().length < min ? `That ${label} looks too short.` : undefined;

export const email = (v: string) =>
  v.trim().length === 0 ? "Please enter your email." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : "Please enter a valid email, like name@example.com.";

export const phone = (v: string) =>
  v.trim().length === 0 ? "Please enter your phone number." : /^[+()\d\s.-]{6,}$/.test(v.trim()) ? undefined : "Please enter a valid phone number.";

export function validate(form: FormData, rules: Rules) {
  const errors: Record<string, string> = {};
  for (const [name, rule] of Object.entries(rules)) {
    const message = rule(String(form.get(name) ?? ""));
    if (message) errors[name] = message;
  }
  return errors;
}

/** Moves focus to the first invalid field so keyboard and screen-reader users land on it. */
export function focusFirstError(formEl: HTMLFormElement, errors: Record<string, string>) {
  const first = Object.keys(errors)[0];
  if (first) (formEl.elements.namedItem(first) as HTMLElement | null)?.focus();
}
