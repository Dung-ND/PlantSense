"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Loader2, Send } from "lucide-react";
import { email, focusFirstError, required, validate, type Rules } from "@/lib/validate";
import { Field, TextArea } from "@/components/Field";

const topics = ["Choosing a product", "An existing order", "Installation help", "Bulk / wholesale", "Something else"];

const rules: Rules = {
  name: required("name"),
  email,
  message: (v) => (v.trim().length < 10 ? "Please tell us a bit more (at least 10 characters)." : undefined),
};

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  if (status === "sent") {
    return (
      <div className="card animate-fade-up p-8 text-center" role="status">
        <CircleCheck className="mx-auto size-12 text-leaf-500" aria-hidden />
        <h2 className="mt-3 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-muted">Thanks for reaching out — we’ll get back to you within one working day.</p>
        <button type="button" className="btn-secondary mt-6" onClick={() => setStatus("idle")}>Send another message</button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const found = validate(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError(e.currentTarget, found);

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(form),
          phone: String(form.get("phone") ?? "") || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setServerError((err as Error).message);
      setStatus("error");
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" error={errors.name} required />
        <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" optional />
        <div>
          <label htmlFor="topic" className="field-label">Topic</label>
          <select id="topic" name="topic" className="field-input">
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <TextArea label="Message" name="message" error={errors.message} rows={5} maxLength={3000} required />
      {/* Honeypot for spam bots — hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {status === "error" && (
        <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert className="size-4 shrink-0" aria-hidden /> {serverError}
        </p>
      )}
      <button type="submit" className="btn-primary h-12 px-8 text-base" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
