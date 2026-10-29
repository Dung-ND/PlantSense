"use client";

import { createContext, useContext, useMemo } from "react";
import type { CatalogItem } from "@/lib/products/schema";

const CatalogContext = createContext<{ items: CatalogItem[]; bySlug: Map<string, CatalogItem> } | null>(null);

/** Gives client components (cart, chat, toasts) the published product list without bundling the database. */
export function CatalogProvider({ items, children }: { items: CatalogItem[]; children: React.ReactNode }) {
  const value = useMemo(() => ({ items, bySlug: new Map(items.map((i) => [i.slug, i])) }), [items]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
