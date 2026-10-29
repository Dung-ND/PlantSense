"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products/schema";
import { formatPrice } from "@/lib/format";
import { ProductMedia, mediaOf } from "@/components/ProductMedia";
import { AddToCartButton } from "@/components/AddToCartButton";

type Source = "tap" | "no-tap";
type Size = "few" | "many";

/** Tap → cheapest tap product. No tap → cheapest reservoir kit for a few pots, the biggest (priciest) for many. */
function recommend(products: Product[], source: Source, size: Size): Product | undefined {
  const pool = products
    .filter((p) => p.inStock && p.waterSource === (source === "tap" ? "tap" : "reservoir"))
    .toSorted((a, b) => a.price - b.price);
  return source === "no-tap" && size === "many" ? pool.at(-1) : pool[0];
}

export function KitFinder({ products }: { products: Product[] }) {
  const [source, setSource] = useState<Source | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const result = source && (source === "tap" || size) ? recommend(products, source, size ?? "few") : undefined;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Question
          legend="1. Do you have an outdoor tap near your plants?"
          name="source"
          value={source}
          onChange={(v) => setSource(v as Source)}
          options={[
            { value: "tap", label: "Yes, there's a tap", hint: "Garden, yard or terrace with a water tap" },
            { value: "no-tap", label: "No tap nearby", hint: "Balcony, indoors, rooftop or allotment" },
          ]}
        />
        {source === "no-tap" && (
          <Question
            legend="2. How many plants do you want to water?"
            name="size"
            value={size}
            onChange={(v) => setSize(v as Size)}
            options={[
              { value: "few", label: "Up to ~15 pots", hint: "Herbs, a balcony, houseplants" },
              { value: "many", label: "More than that", hint: "Many pots, raised beds or a greenhouse" },
            ]}
          />
        )}
      </div>

      <div aria-live="polite">
        {result ? (
          <div className="card animate-fade-up overflow-hidden sm:flex">
            <ProductMedia product={mediaOf(result)} sizes="(min-width: 640px) 240px, 100vw" className="sm:w-56 sm:shrink-0" />
            <div className="flex flex-col p-6">
              <p className="eyebrow">We recommend</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{result.name}</h3>
              <p className="mt-2 text-sm text-muted">{result.summary}</p>
              <p className="mt-3 text-lg font-bold">{formatPrice(result.price)}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <AddToCartButton slug={result.slug} name={result.shortName} disabled={!result.inStock} />
                <Link href={`/products/${result.slug}`} className="btn-secondary">
                  Details <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-48 place-items-center rounded-2xl border-2 border-dashed border-leaf-200 p-6 text-center text-muted">
            Answer the question{source ? "" : "s"} and we’ll suggest the best fit.
          </div>
        )}
      </div>
    </div>
  );
}

function Question({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string | null;
  onChange: (v: string) => void;
  options: { value: string; label: string; hint: string }[];
}) {
  return (
    <fieldset className="animate-fade-up">
      <legend className="mb-3 font-semibold">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer gap-3 rounded-2xl border-2 border-line bg-white p-4 transition hover:border-leaf-300 has-checked:border-leaf-500 has-checked:bg-leaf-50 has-focus-visible:ring-2 has-focus-visible:ring-water-400"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-1 size-4 accent-leaf-600"
            />
            <span>
              <span className="block font-medium">{o.label}</span>
              <span className="block text-sm text-muted">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
