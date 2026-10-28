"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function AddToCartButton({
  slug,
  name,
  quantity = 1,
  disabled,
  compact,
  className = "",
}: {
  slug: string;
  name: string;
  quantity?: number;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  if (disabled) {
    return (
      <button type="button" className={`btn-secondary ${className}`} disabled>
        Out of stock
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn-primary ${className}`}
      aria-label={compact ? `Add ${name} to cart` : undefined}
      onClick={() => {
        add(slug, quantity);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
      }}
    >
      {justAdded ? <Check className="size-4" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
      {justAdded ? "Added" : compact ? "Add" : "Add to cart"}
    </button>
  );
}
