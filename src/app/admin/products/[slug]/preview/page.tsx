import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { findProduct } from "@/lib/products/repo";
import { ProductDetail } from "@/components/ProductDetail";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({ params }: PageProps<"/admin/products/[slug]/preview">) {
  await requireAdmin();
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white">
        <p>
          <strong>Preview</strong> — this is how customers will see the page.{" "}
          {product.status === "draft" ? "It’s a draft, so it isn’t visible in the shop yet." : "It’s live in the shop."}
        </p>
        <div className="flex gap-2">
          <Link href="/admin" className="btn min-h-9 bg-white/10 px-3 text-white hover:bg-white/20"><ArrowLeft className="size-4" aria-hidden /> All products</Link>
          <Link href={`/admin/products/${product.slug}`} className="btn min-h-9 bg-white px-3 text-ink hover:bg-leaf-50"><Pencil className="size-4" aria-hidden /> Edit</Link>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl bg-cream">
        <ProductDetail product={product} preview />
      </div>
    </div>
  );
}
