"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories, products, type Category } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

const sorts = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
type Sort = keyof typeof sorts;

export function ProductBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = (params.get("category") as Category | null) ?? null;
  const sort = (params.get("sort") as Sort | null) ?? "featured";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const list = products
    .filter((p) => !category || p.category === category)
    .toSorted((a, b) => (sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0));

  const filters: { value: Category | null; label: string }[] = [
    { value: null, label: "All" },
    ...(Object.keys(categories) as Category[]).map((c) => ({ value: c, label: categories[c].label })),
  ];

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={category === f.value}
              onClick={() => update("category", f.value)}
              className="min-h-10 rounded-full border border-line bg-white px-4 text-sm font-medium transition hover:border-leaf-300 aria-pressed:border-leaf-600 aria-pressed:bg-leaf-600 aria-pressed:text-white"
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{products.filter((p) => !f.value || p.category === f.value).length}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value === "featured" ? null : e.target.value)}
            className="min-h-10 rounded-full border border-line bg-white px-3 font-medium"
          >
            {Object.entries(sorts).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {category && <p className="mt-4 text-sm text-muted">{categories[category]?.description}</p>}
      <p className="sr-only" aria-live="polite">{list.length} products shown</p>

      {list.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 3} />)}
        </div>
      ) : (
        <div className="mt-12 text-center text-muted">
          <p>No products in this category yet.</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => update("category", null)}>Show all products</button>
        </div>
      )}
    </>
  );
}
