import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { site } from "@/config/site";
import { categories, getProduct, products, waterSources } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { ProductMedia } from "@/components/ProductMedia";
import { ProductCard } from "@/components/ProductCard";
import { PurchasePanel } from "@/components/PurchasePanel";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
    openGraph: { title: product.name, description: product.summary, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.summary,
    image: product.images.map((src) => new URL(src, site.url).toString()),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: site.currency,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: new URL(`/products/${product.slug}`, site.url).toString(),
    },
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-ink hover:underline">Home</Link></li>
          <li aria-hidden><ChevronRight className="size-4" /></li>
          <li><Link href="/products" className="hover:text-ink hover:underline">Shop</Link></li>
          <li aria-hidden><ChevronRight className="size-4" /></li>
          <li aria-current="page" className="font-medium text-ink">{product.shortName}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <ProductMedia product={product} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </div>

        <div>
          <p className="eyebrow">{categories[product.category].label} · SKU {product.sku}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg text-muted">{product.summary}</p>

          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <s className="text-lg text-muted"><span className="sr-only">Was </span>{formatPrice(product.compareAtPrice)}</s>
                <span className="rounded-full bg-sun-100 px-2.5 py-0.5 text-sm font-semibold text-amber-800">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </p>
          <p className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${product.inStock ? "text-leaf-700" : "text-red-700"}`}>
            <span className={`size-2 rounded-full ${product.inStock ? "bg-leaf-500" : "bg-red-500"}`} aria-hidden />
            {product.inStock ? `In stock · ${site.policies.dispatch}` : "Out of stock"}
          </p>

          <PurchasePanel slug={product.slug} name={product.shortName} inStock={product.inStock} />

          <ul className="mt-6 grid gap-3 rounded-2xl bg-leaf-50 p-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="size-5 text-leaf-600" aria-hidden /> Free over {formatPrice(site.freeShippingThreshold)}</li>
            <li className="flex items-center gap-2"><RotateCcw className="size-5 text-leaf-600" aria-hidden /> {site.policies.returnDays}-day returns</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-5 text-leaf-600" aria-hidden /> {site.policies.warrantyMonths}-mo warranty</li>
          </ul>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">Best for</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              <li className="rounded-full bg-water-50 px-3 py-1.5 text-sm font-medium text-water-600">{waterSources[product.waterSource]}</li>
              {product.bestFor.map((b) => (
                <li key={b} className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-line">{b}</li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-4 text-muted">
            {product.description.map((para) => <p key={para}>{para}</p>)}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <div key={h.title} className="card p-4">
                <h3 className="flex items-center gap-2 font-semibold"><Check className="size-4 text-leaf-500" aria-hidden />{h.title}</h3>
                <p className="mt-1 text-sm text-muted">{h.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <dl className="card mt-3 divide-y divide-line">
              {product.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted">{s.label}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><PackageCheck className="size-5 text-leaf-600" aria-hidden /> What’s in the box</h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {product.inTheBox.map((item) => (
                <li key={item} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />{item}</li>
              ))}
            </ul>
          </div>

          <p className="mt-10 rounded-2xl border border-line bg-white p-5 text-sm">
            <strong>Have a question about this product?</strong>{" "}
            Ask Sprout, our assistant (bottom-right), or <Link href="/contact" className="font-medium text-leaf-700 underline">send us a message</Link>.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <h2 id="related-title" className="font-display text-2xl font-semibold">You might also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
