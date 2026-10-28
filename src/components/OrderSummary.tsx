"use client";

import { Truck } from "lucide-react";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function OrderSummary({ children, showItems }: { children?: React.ReactNode; showItems?: boolean }) {
  const { totals } = useCart();
  const progress = site.freeShippingThreshold > 0 ? Math.min(100, (totals.subtotal / site.freeShippingThreshold) * 100) : 100;

  return (
    <section aria-labelledby="summary-title" className="card p-6">
      <h2 id="summary-title" className="text-lg font-semibold">Order summary</h2>

      {showItems && (
        <ul className="mt-4 space-y-2 border-b border-line pb-4 text-sm">
          {totals.items.map((i) => (
            <li key={i.product.slug} className="flex justify-between gap-4">
              <span>{i.product.shortName} <span className="text-muted">× {i.quantity}</span></span>
              <span className="font-medium">{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{totals.shipping === 0 ? <span className="font-medium text-leaf-700">Free</span> : formatPrice(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
      </dl>

      {site.freeShippingThreshold > 0 && (
        <div className="mt-5 rounded-xl bg-leaf-50 p-3 text-sm">
          <p className="flex items-center gap-2">
            <Truck className="size-4 text-leaf-600" aria-hidden />
            {totals.amountToFreeShipping > 0 ? (
              <span>Add <strong>{formatPrice(totals.amountToFreeShipping)}</strong> more for free shipping</span>
            ) : (
              <span className="font-medium text-leaf-800">You’ve unlocked free shipping!</span>
            )}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-leaf-100" role="progressbar" aria-label="Progress to free shipping" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
