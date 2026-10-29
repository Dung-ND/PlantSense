import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { findProduct, listProducts, listRevisions } from "@/lib/products/repo";
import { aiConfigured } from "@/lib/admin/ai-fill";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  return (
    <ProductEditor
      initial={product}
      originalSlug={product.slug}
      categories={[...new Set(listProducts({ includeDrafts: true }).map((p) => p.category))]}
      aiEnabled={aiConfigured()}
      revisions={listRevisions(slug)}
    />
  );
}
