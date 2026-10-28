import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartToast } from "@/components/CartToast";
import { ChatWidget } from "@/components/chat/ChatWidget";

const body = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin", "vietnamese"] });
const heading = Fraunces({ variable: "--font-heading", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#1c5c30",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only z-[60] rounded-full bg-leaf-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartToast />
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
