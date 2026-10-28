import { site } from "@/config/site";
import { getProduct } from "@/data/products";

export interface CartLine {
  slug: string;
  quantity: number;
}

export const MAX_QTY = 20;

/** Prices always come from the catalog, never from the client. */
export function priceCart(lines: CartLine[]) {
  const items = lines.flatMap((line) => {
    const product = getProduct(line.slug);
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
