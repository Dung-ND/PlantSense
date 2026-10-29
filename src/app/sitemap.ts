import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getProducts } from "@/lib/products/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/products", "/faq", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}` })),
  ];
}
