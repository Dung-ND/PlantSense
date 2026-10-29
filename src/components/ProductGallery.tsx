"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products/schema";
import { ProductMedia } from "@/components/ProductMedia";

export function ProductGallery({ name, images, illustration }: { name: string; images: Product["images"]; illustration: Product["illustration"] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? null;

  return (
    <div>
      <div className="card overflow-hidden">
        <ProductMedia product={{ name, image: current, illustration }} priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Product photos">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}${img.alt ? `: ${img.alt}` : ""}`}
                aria-current={i === active}
                className="relative block aspect-square w-full overflow-hidden rounded-xl border-2 border-transparent bg-leaf-50 transition aria-[current=true]:border-leaf-600 hover:border-leaf-300"
              >
                <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
