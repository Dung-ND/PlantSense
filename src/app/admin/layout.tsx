import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, Loader2, Sprout } from "lucide-react";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · ${site.name} admin` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f3ee]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-leaf-800">
            <span className="grid size-8 place-items-center rounded-lg bg-leaf-600 text-white">
              <Sprout className="size-4" aria-hidden />
            </span>
            {site.name} <span className="font-normal text-muted">admin</span>
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            View shop <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Admin pages read the login cookie, so they render per request inside this boundary. */}
        <Suspense
          fallback={
            <div className="grid place-items-center py-24 text-muted">
              <Loader2 className="size-6 animate-spin" aria-label="Loading" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
