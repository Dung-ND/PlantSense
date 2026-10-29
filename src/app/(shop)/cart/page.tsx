import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-semibold">Your cart</h1>
      <CartView />
    </div>
  );
}
