import Image from "next/image";
import { Sprout } from "lucide-react";
import type { Product } from "@/lib/products/schema";
import { ProductIllustration } from "@/components/ProductIllustration";

interface MediaSource {
  name: string;
  image: Product["images"][number] | null;
  illustration: Product["illustration"];
}

/** Main product picture: uploaded photo → built-in illustration → neutral placeholder. */
export function ProductMedia({ product, priority, sizes, className = "" }: { product: MediaSource; priority?: boolean; sizes: string; className?: string }) {
  const { image, illustration } = product;
  return (
    <div className={`relative aspect-[6/5] overflow-hidden bg-leaf-50 ${className}`}>
      {image ? (
        <Image src={image.url} alt={image.alt || product.name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : illustration ? (
        <ProductIllustration kind={illustration} className="h-full w-full" />
      ) : (
        <div className="grid h-full place-items-center text-leaf-300">
          <Sprout className="size-16" aria-hidden />
        </div>
      )}
    </div>
  );
}

export const mediaOf = (p: Product): MediaSource => ({ name: p.name, image: p.images[0] ?? null, illustration: p.illustration });
