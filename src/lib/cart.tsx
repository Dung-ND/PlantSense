"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QTY, priceCart, type CartLine } from "@/lib/pricing";

const STORAGE_KEY = "plantsense-cart-v1";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  ready: boolean;
  totals: ReturnType<typeof priceCart>;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  /** Last product added — drives the "added to cart" toast. */
  lastAdded: { slug: string; at: number } | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue["lastAdded"]>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (Array.isArray(saved)) setLines(priceCart(saved).items.map((i) => ({ slug: i.product.slug, quantity: i.quantity })));
    } catch {
      // storage unavailable (private mode) — start with an empty cart
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(l.quantity + quantity, MAX_QTY) } : l));
      }
      return [...prev, { slug, quantity: Math.min(quantity, MAX_QTY) }];
    });
    setLastAdded({ slug, at: Date.now() });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(quantity, MAX_QTY) } : l)),
    );
  }, []);

  const remove = useCallback((slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      totals: priceCart(lines),
      add,
      setQuantity,
      remove,
      clear,
      lastAdded,
    }),
    [lines, ready, add, setQuantity, remove, clear, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
