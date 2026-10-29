import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listProducts } from "@/lib/products/repo";
import { emptyProduct } from "@/lib/products/schema";
import { aiConfigured } from "@/lib/admin/ai-fill";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  const all = listProducts({ includeDrafts: true });
  const blank = { ...emptyProduct(), slug: "", sku: "", name: "", shortName: "", summary: "", sortOrder: (all.length + 1) * 10 };
  return (
    <ProductEditor
      initial={blank}
      originalSlug={null}
      categories={[...new Set(all.map((p) => p.category))]}
      aiEnabled={aiConfigured()}
    />
  );
}
