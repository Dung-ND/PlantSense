"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleCheck, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog-context";

/** Confirms "added to cart" without navigating away, with a shortcut to the cart. */
export function CartToast() {
  const { lastAdded, count } = useCart();
  const { bySlug } = useCatalog();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show the toast for each new add
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const product = lastAdded ? bySlug.get(lastAdded.slug) : undefined;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4 sm:top-auto sm:bottom-6 sm:justify-start sm:px-6">
      {visible && product && (
        <div className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-xl shadow-leaf-900/10">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Added to your cart</p>
            <p className="text-muted">{product.name}</p>
            <div className="mt-3 flex gap-2">
              <Link href="/cart" className="btn-primary min-h-9 px-4" onClick={() => setVisible(false)}>
                View cart ({count})
              </Link>
              <button type="button" className="btn-ghost min-h-9 px-3" onClick={() => setVisible(false)}>
                Keep shopping
              </button>
            </div>
          </div>
          <button type="button" aria-label="Dismiss" className="-m-1 rounded-full p-1 text-muted hover:bg-leaf-50" onClick={() => setVisible(false)}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
