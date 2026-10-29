/** Shown while a product page that wasn't pre-built (e.g. just added in admin) renders for the first time. */
export default function Loading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading product">
      <div className="h-4 w-48 animate-pulse rounded bg-line" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-[6/5] animate-pulse rounded-2xl bg-white" />
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-line" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-line" />
          <div className="h-20 animate-pulse rounded bg-line/60" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-line" />
        </div>
      </div>
    </div>
  );
}
