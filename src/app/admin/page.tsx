import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileJson, LogOut, Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listProductsWithMeta } from "@/lib/products/repo";
import { categoryLabel } from "@/lib/products/schema";
import { formatPrice } from "@/lib/format";
import { ProductMedia, mediaOf } from "@/components/ProductMedia";
import { logout, setStatusAction, setStockAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Products" };

export default async function AdminHome() {
  await requireAdmin();
  const rows = listProductsWithMeta();
  const published = rows.filter((r) => r.product.status === "published").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} total · {published} live · {rows.length - published} draft
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/template" className="btn-secondary">
            <FileJson className="size-4" aria-hidden /> Product template
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus className="size-4" aria-hidden /> Add product
          </Link>
          <form action={logout}>
            <button type="submit" className="btn-ghost" title="Log out">
              <LogOut className="size-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Log out</span>
            </button>
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-muted">No products yet.</p>
          <Link href="/admin/products/new" className="btn-primary mt-4">Add your first product</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map(({ product: p, updatedAt }) => (
            <li key={p.slug} className="card flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap">
              <Link href={`/admin/products/${p.slug}`} className="w-20 shrink-0 overflow-hidden rounded-xl" tabIndex={-1} aria-hidden>
                <ProductMedia product={mediaOf(p)} sizes="80px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                <p className="truncate text-sm text-muted">
                  {p.sku} · {categoryLabel(p.category)} · <span className="font-medium text-ink">{formatPrice(p.price)}</span>
                </p>
                <p className="text-xs text-muted">Updated {new Date(updatedAt + "Z").toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setStatusAction.bind(null, p.slug, p.status === "published" ? "draft" : "published")}>
                  <button
                    type="submit"
                    title={p.status === "published" ? "Click to hide from the shop" : "Click to publish"}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${p.status === "published" ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-sun-100 text-amber-900 hover:bg-amber-200"}`}
                  >
                    {p.status === "published" ? "● Live" : "○ Draft"}
                  </button>
                </form>
                <form action={setStockAction.bind(null, p.slug, !p.inStock)}>
                  <button
                    type="submit"
                    title="Toggle stock"
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${p.inStock ? "bg-white text-ink ring-1 ring-line hover:bg-leaf-50" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
                  >
                    {p.inStock ? "In stock" : "Out of stock"}
                  </button>
                </form>
                <Link href={`/admin/products/${p.slug}/preview`} className="btn-ghost min-h-9 px-3" title="Preview">
                  <Eye className="size-4" aria-hidden /><span className="sr-only">Preview {p.name}</span>
                </Link>
                <Link href={`/admin/products/${p.slug}`} className="btn-secondary min-h-9 px-4">
                  <Pencil className="size-4" aria-hidden /> Edit<span className="sr-only"> {p.name}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
