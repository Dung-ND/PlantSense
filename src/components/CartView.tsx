"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { MAX_QTY } from "@/lib/pricing";
import { ProductMedia } from "@/components/ProductMedia";
import { QuantityStepper } from "@/components/QuantityStepper";
import { OrderSummary } from "@/components/OrderSummary";

export function CartView() {
  const { totals, ready, setQuantity, remove } = useCart();

  if (!ready) {
    return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" aria-label="Loading cart" />;
  }

  if (totals.items.length === 0) {
    return (
      <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-leaf-50 text-leaf-600">
          <ShoppingCart className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-muted">Find the right watering kit for your garden — it only takes a minute.</p>
        <Link href="/products" className="btn-primary mt-6">Browse products <ArrowRight className="size-4" aria-hidden /></Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <ul className="card divide-y divide-line" aria-label="Items in your cart">
        {totals.items.map(({ product, quantity, lineTotal }) => (
          <li key={product.slug} className="flex gap-4 p-4 sm:p-5">
            <Link href={`/products/${product.slug}`} className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-32" tabIndex={-1} aria-hidden>
              <ProductMedia product={product} sizes="128px" />
            </Link>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex justify-between gap-4">
                <div>
                  <Link href={`/products/${product.slug}`} className="font-semibold hover:underline">{product.name}</Link>
                  <p className="text-sm text-muted">{formatPrice(product.price)} each</p>
                </div>
                <p className="font-semibold">{formatPrice(lineTotal)}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <QuantityStepper value={quantity} onChange={(n) => setQuantity(product.slug, n)} max={MAX_QTY} label={`Quantity of ${product.shortName}`} />
                <button type="button" onClick={() => remove(product.slug)} className="btn-ghost px-3 text-red-700 hover:bg-red-50">
                  <Trash2 className="size-4" aria-hidden /> Remove<span className="sr-only"> {product.shortName}</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary>
          <Link href="/checkout" className="btn-primary mt-5 h-12 w-full text-base">
            Checkout <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/products" className="btn-ghost mt-2 w-full">Continue shopping</Link>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-4" aria-hidden /> No account needed · {site.policies.returnDays}-day returns
          </p>
        </OrderSummary>
      </div>
    </div>
  );
}
