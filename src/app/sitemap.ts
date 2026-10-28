import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/products", "/faq", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}` })),
  ];
}
