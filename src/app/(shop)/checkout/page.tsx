import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <p className="mt-2 text-muted">No account needed — we just need to know where to send your order.</p>
      <CheckoutForm />
    </div>
  );
}
