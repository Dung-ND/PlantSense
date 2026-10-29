import { site } from "@/config/site";

export interface CartLine {
  slug: string;
  quantity: number;
}

export const MAX_QTY = 20;

interface Priceable {
  slug: string;
  price: number;
}

/** Prices always come from the catalog passed in, never from the client's cart data. */
export function priceCart<P extends Priceable>(lines: CartLine[], catalog: readonly P[]) {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const items = lines.flatMap((line) => {
    const product = bySlug.get(line.slug);
    if (!product) return [];
    const quantity = Math.min(Math.max(1, Math.floor(line.quantity)), MAX_QTY);
    return [{ product, quantity, lineTotal: round(product.price * quantity) }];
  });
  const subtotal = round(items.reduce((sum, i) => sum + i.lineTotal, 0));
  const freeShipping = site.freeShippingThreshold <= 0 || subtotal >= site.freeShippingThreshold;
  const shipping = items.length === 0 || freeShipping ? 0 : site.shippingFee;
  return {
    items,
    subtotal,
    shipping,
    total: round(subtotal + shipping),
    amountToFreeShipping: freeShipping ? 0 : round(site.freeShippingThreshold - subtotal),
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
