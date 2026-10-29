"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, ShoppingCart, Sprout, X } from "lucide-react";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

const nav = [
  { href: "/products", label: "Shop" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#compare", label: "Compare" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return <HeaderView pathname={usePathname()} />;
}

/** Same header without reading the URL — used while a freshly rendered page streams in. */
const noopSubscribe = () => () => {};

export function HeaderView({ pathname }: { pathname: string }) {
  const cart = useCart();
  // False while hydrating, so the server HTML (empty cart) always matches; the saved count appears right after.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const count = hydrated && cart.ready ? cart.count : 0;
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      {site.freeShippingThreshold > 0 && (
        <p className="bg-leaf-800 px-4 py-1.5 text-center text-xs font-medium text-leaf-50">
          Free shipping on orders over {formatPrice(site.freeShippingThreshold)} · {site.policies.returnDays}-day returns
        </p>
      )}
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-leaf-800">
          <span className="grid size-9 place-items-center rounded-xl bg-leaf-600 text-white">
            <Sprout className="size-5" aria-hidden />
          </span>
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = item.href === pathname || (item.href === "/products" && pathname.startsWith("/products"));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-leaf-50 hover:text-leaf-800 aria-[current=page]:bg-leaf-100 aria-[current=page]:text-leaf-800"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/cart"
            className="relative grid size-11 place-items-center rounded-full text-ink hover:bg-leaf-50"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingCart className="size-5" aria-hidden />
            {count > 0 && (
              <span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-leaf-600 px-1 text-[11px] leading-5 font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full hover:bg-leaf-50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="animate-fade-up border-t border-line bg-cream md:hidden">
          <ul className="container-page py-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-xl px-3 py-3 text-base font-medium hover:bg-leaf-50" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
