import Link from "next/link";
import { Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <Sprout className="size-12 text-leaf-500" aria-hidden />
      <h1 className="mt-4 font-display text-4xl font-semibold">This page hasn’t sprouted</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/products" className="btn-secondary">Browse products</Link>
      </div>
    </div>
  );
}
