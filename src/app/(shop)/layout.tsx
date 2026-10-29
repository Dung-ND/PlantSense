import { Suspense } from "react";
import { getCatalogItems } from "@/lib/products/catalog";
import { CatalogProvider } from "@/lib/catalog-context";
import { CartProvider } from "@/lib/cart";
import { Header, HeaderView } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartToast } from "@/components/CartToast";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const catalog = await getCatalogItems();
  return (
    <CatalogProvider items={catalog}>
      <CartProvider>
        {/* Header and chat read the current URL; the boundary lets new product pages render on demand. */}
        <Suspense fallback={<HeaderView pathname="" />}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartToast />
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </CartProvider>
    </CatalogProvider>
  );
}
