import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { listProducts } from "@/lib/products/repo";
import { toCatalogItem } from "@/lib/products/schema";

/** Tag invalidated whenever an admin saves a product. */
export const PRODUCTS_TAG = "products";

/** Published products for the shop, cached until an admin changes something. */
export async function getProducts() {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("weeks");
  return listProducts();
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getProductBySku(sku: string) {
  return (await getProducts()).find((p) => p.sku.toLowerCase() === sku.toLowerCase()) ?? null;
}

export async function getCatalogItems() {
  return (await getProducts()).map(toCatalogItem);
}
