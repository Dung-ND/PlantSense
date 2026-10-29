import Link from "next/link";
import { Clock, Mail, Phone, Sprout } from "lucide-react";
import { site } from "@/config/site";
import { getProducts } from "@/lib/products/catalog";

export async function Footer() {
  const products = (await getProducts()).slice(0, 6);
  return (
    <footer className="mt-24 border-t border-line bg-leaf-900 text-leaf-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <Sprout className="size-5" aria-hidden /> {site.name}
          </p>
          <p className="mt-3 text-sm text-leaf-200">{site.description}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="hover:text-white hover:underline">
                  {p.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="hover:text-white hover:underline">All products</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Help</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-white hover:underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white hover:underline">Contact us</Link></li>
            <li><Link href="/cart" className="hover:text-white hover:underline">Your cart</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden />
              <a href={`mailto:${site.contact.email}`} className="hover:text-white hover:underline">{site.contact.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden />
              <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white hover:underline">{site.contact.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden /> {site.contact.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-leaf-800">
        <p className="container-page py-5 text-xs text-leaf-300">
          © {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
