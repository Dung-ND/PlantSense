import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/products/catalog";
import { ProductBrowser } from "@/components/ProductBrowser";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop automatic watering kits",
  description: "Tap timers and reservoir-fed drip kits for balconies, gardens and greenhouses.",
};

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Automatic watering</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Tap timers for gardens with a water supply, and reservoir-fed drip kits for everywhere else.
      </p>
      {/* Filters read the URL, so they render on the client; the fallback shows the full list. */}
      <Suspense
        fallback={
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        }
      >
        <ProductBrowser products={products} />
      </Suspense>
    </div>
  );
}
