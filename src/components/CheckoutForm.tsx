"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleAlert, CircleCheck, Loader2, Lock } from "lucide-react";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { email, focusFirstError, phone, required, validate, type Rules } from "@/lib/validate";
import { Field, TextArea } from "@/components/Field";
import { OrderSummary } from "@/components/OrderSummary";

const rules: Rules = {
  name: required("full name"),
  phone,
  email,
  address: required("street address", 5),
  city: required("city"),
};

export function CheckoutForm() {
  const { lines, totals, ready, clear } = useCart();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [placed, setPlaced] = useState<{ orderId: string; total: number; email: string } | null>(null);

  if (placed) {
    return (
      <div className="card mx-auto mt-8 max-w-xl animate-fade-up p-8 text-center" role="status">
        <CircleCheck className="mx-auto size-14 text-leaf-500" aria-hidden />
        <h2 className="mt-4 font-display text-3xl font-semibold">Thank you — order received!</h2>
        <p className="mt-3 text-muted">
          Your order number is <strong className="text-ink">{placed.orderId}</strong>. We’ll contact you at{" "}
          <strong className="text-ink">{placed.email}</strong> to confirm delivery.
        </p>
        <p className="mt-2 text-muted">Total: <strong className="text-ink">{formatPrice(placed.total)}</strong></p>
        <Link href="/products" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" aria-label="Loading" />;

  if (totals.items.length === 0) {
    return (
      <div className="card mt-8 p-8 text-center">
        <p className="text-muted">Your cart is empty, so there’s nothing to check out yet.</p>
        <Link href="/products" className="btn-primary mt-4">Browse products</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const found = validate(form, rules);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return focusFirstError(e.currentTarget, found);

    setSubmitting(true);
    try {
      const customer = Object.fromEntries(["name", "phone", "email", "address", "city", "notes"].map((k) => [k, String(form.get(k) ?? "")]));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines, customer: { ...customer, notes: customer.notes || undefined }, payment: form.get("payment") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setPlaced({ orderId: data.orderId, total: data.total, email: customer.email });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const blurCheck = (e: React.FocusEvent<HTMLInputElement>) => {
    const rule = rules[e.target.name];
    if (!rule || !e.target.value) return;
    const message = rule(e.target.value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[e.target.name] = message;
      else delete next[e.target.name];
      return next;
    });
  };

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {Object.keys(errors).length > 1 && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <CircleAlert className="size-5 shrink-0" aria-hidden />
            Please fix {Object.keys(errors).length} fields below.
          </div>
        )}

        <fieldset className="card space-y-4 p-6">
          <legend className="sr-only">Contact details</legend>
          <h2 className="text-lg font-semibold" aria-hidden>1. Contact</h2>
          <Field label="Full name" name="name" autoComplete="name" error={errors.name} onBlur={blurCheck} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone} onBlur={blurCheck} hint="For the courier, if needed" required />
            <Field label="Email" name="email" type="email" inputMode="email" autoComplete="email" error={errors.email} onBlur={blurCheck} hint="We’ll send your confirmation here" required />
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-6">
          <legend className="sr-only">Delivery address</legend>
          <h2 className="text-lg font-semibold" aria-hidden>2. Delivery</h2>
          <Field label="Street address" name="address" autoComplete="street-address" error={errors.address} onBlur={blurCheck} required />
          <Field label="City / District" name="city" autoComplete="address-level2" error={errors.city} onBlur={blurCheck} required />
          <TextArea label="Delivery notes" name="notes" optional placeholder="Gate code, best time to deliver…" maxLength={1000} />
        </fieldset>

        <fieldset className="card p-6">
          <legend className="sr-only">Payment method</legend>
          <h2 className="text-lg font-semibold" aria-hidden>3. Payment</h2>
          <div className="mt-4 grid gap-3">
            {site.paymentMethods.map((m, i) => (
              <label key={m.id} className="flex cursor-pointer gap-3 rounded-xl border-2 border-line p-4 transition has-checked:border-leaf-500 has-checked:bg-leaf-50 has-focus-visible:ring-2 has-focus-visible:ring-water-400">
                <input type="radio" name="payment" value={m.id} defaultChecked={i === 0} className="mt-1 size-4 accent-leaf-600" />
                <span>
                  <span className="block font-medium">{m.label}</span>
                  <span className="block text-sm text-muted">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary showItems>
          {serverError && (
            <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <CircleAlert className="size-4 shrink-0" aria-hidden /> {serverError}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn-primary mt-5 h-12 w-full text-base">
            {submitting ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Placing order…</> : <>Place order · {formatPrice(totals.total)}</>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Lock className="size-3.5" aria-hidden /> Your details are only used to deliver your order.
          </p>
          <Link href="/cart" className="btn-ghost mt-2 w-full">Back to cart</Link>
        </OrderSummary>
      </div>
    </form>
  );
}
