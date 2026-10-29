import Link from "next/link";
import { Check } from "lucide-react";
import { categoryLabel, type Product } from "@/lib/products/schema";
import { formatPrice } from "@/lib/format";
import { ProductMedia, mediaOf } from "@/components/ProductMedia";
import { AddToCartButton } from "@/components/AddToCartButton";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-leaf-900/5">
      <div className="relative">
        <ProductMedia product={mediaOf(product)} priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-leaf-700 shadow-sm">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{categoryLabel(product.category)}</p>
        <h3 className="mt-1 font-display text-xl font-semibold">
          {/* Stretched link: the whole card is clickable, the button stays separate */}
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted">{product.summary}</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {product.bestFor.slice(0, 2).map((b) => (
            <li key={b} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p>
            <span className="text-xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <s className="ml-2 text-sm text-muted">
                <span className="sr-only">Was </span>
                {formatPrice(product.compareAtPrice)}
              </s>
            )}
          </p>
          <div className="relative z-10">
            <AddToCartButton slug={product.slug} name={product.shortName} disabled={!product.inStock} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
