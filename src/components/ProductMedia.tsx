import Image from "next/image";
import type { Product } from "@/data/products";
import { ProductIllustration } from "@/components/ProductIllustration";

export function ProductMedia({ product, priority, sizes, className = "" }: { product: Product; priority?: boolean; sizes: string; className?: string }) {
  const src = product.images[0];
  return (
    <div className={`relative aspect-[6/5] overflow-hidden ${className}`}>
      {src ? (
        <Image src={src} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <ProductIllustration kind={product.illustration} className="h-full w-full" />
      )}
    </div>
  );
}
