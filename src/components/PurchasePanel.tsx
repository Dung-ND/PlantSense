"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { QuantityStepper } from "@/components/QuantityStepper";
import { MAX_QTY } from "@/lib/pricing";

export function PurchasePanel({ slug, name, inStock }: { slug: string; name: string; inStock: boolean }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {inStock && <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_QTY} label={`Quantity of ${name}`} />}
      <AddToCartButton slug={slug} name={name} quantity={quantity} disabled={!inStock} className="h-12 flex-1 px-8 text-base sm:flex-none" />
      {!inStock && (
        <Link href="/contact" className="btn-ghost">Notify me when it’s back</Link>
      )}
    </div>
  );
}
