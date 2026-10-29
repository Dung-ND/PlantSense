import Link from "next/link";
import { ArrowRight, Check, Droplets, Leaf, Plane, RotateCcw, ShieldCheck, Timer, Truck, Wrench } from "lucide-react";
import { site } from "@/config/site";
import { getProducts } from "@/lib/products/catalog";
import { faqs } from "@/data/faqs";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { ProductIllustration } from "@/components/ProductIllustration";
import { KitFinder } from "@/components/KitFinder";
import { FaqList } from "@/components/FaqList";

export default async function HomePage() {
  const products = await getProducts();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1 text-sm font-medium text-leaf-800">
              <Droplets className="size-4" aria-hidden /> Automatic drip watering
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-6xl">
              Your plants, watered.
              <span className="block text-leaf-600">Even when you’re away.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Simple, reliable watering kits for balconies, gardens and greenhouses. Set a schedule in minutes — no plumber, no app, no wilted plants.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary h-12 px-6 text-base">
                Shop watering kits <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="#find-your-kit" className="btn-secondary h-12 px-6 text-base">
                Help me choose
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-1.5"><Truck className="size-4 text-leaf-600" aria-hidden /> Free shipping over {formatPrice(site.freeShippingThreshold)}</li>
              <li className="flex items-center gap-1.5"><RotateCcw className="size-4 text-leaf-600" aria-hidden /> {site.policies.returnDays}-day returns</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-leaf-600" aria-hidden /> {site.policies.warrantyMonths}-month warranty</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-leaf-100 via-water-50 to-transparent blur-2xl" aria-hidden />
            <div className="grid grid-cols-2 gap-4">
              <div className="card col-span-2 overflow-hidden">
                <ProductIllustration kind="kit-large" className="h-auto w-full" />
              </div>
              <div className="card overflow-hidden">
                <ProductIllustration kind="timer" className="h-auto w-full" />
              </div>
              <div className="card flex flex-col justify-center gap-1 p-5">
                <p className="font-display text-3xl font-semibold text-leaf-700">10 min</p>
                <p className="text-sm text-muted">typical setup, no tools needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-title" className="border-y border-line bg-white">
        <h2 id="benefits-title" className="sr-only">Why automatic watering</h2>
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Plane, title: "Go away worry-free", text: "Holidays and busy weeks no longer mean thirsty plants." },
            { icon: Droplets, title: "Save water", text: "Drip watering goes straight to the roots, with less run-off." },
            { icon: Leaf, title: "Healthier plants", text: "Consistent watering beats forgetting, then flooding." },
            { icon: Wrench, title: "DIY in minutes", text: "Push-fit parts and clear instructions. No plumber needed." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section aria-labelledby="products-title" className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The range</p>
            <h2 id="products-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Pick your watering helper</h2>
          </div>
          <Link href="/products" className="btn-ghost">
            View all products <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i === 0} />
          ))}
        </div>
      </section>

      {/* Kit finder */}
      <section id="find-your-kit" aria-labelledby="finder-title" className="scroll-mt-28 bg-leaf-50 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Not sure?</p>
            <h2 id="finder-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Find your kit in two questions</h2>
          </div>
          <KitFinder products={products} />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" aria-labelledby="how-title" className="container-page scroll-mt-28 py-20">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Set up once. Relax all season.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Wrench, title: "Connect", text: "Screw the timer onto your tap — or drop the pump intake into a bucket or tank." },
            { icon: Droplets, title: "Lay the lines", text: "Run the tubing to your pots or beds and push a drip stake in beside each plant." },
            { icon: Timer, title: "Set the schedule", text: "Choose how often and how long to water. That's it — it runs on its own." },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card relative p-6">
              <span className="absolute top-5 right-6 font-display text-5xl font-semibold text-leaf-100" aria-hidden>{i + 1}</span>
              <span className="grid size-12 place-items-center rounded-xl bg-water-50 text-water-600">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Compare */}
      <section id="compare" aria-labelledby="compare-title" className="container-page scroll-mt-28 pb-20">
        <p className="eyebrow">Side by side</p>
        <h2 id="compare-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Compare at a glance</h2>
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Comparison of {site.name} products</caption>
            <thead className="border-b border-line bg-leaf-50/60">
              <tr>
                <th scope="col" className="p-4 font-semibold">Product</th>
                <th scope="col" className="p-4 font-semibold">Water source</th>
                <th scope="col" className="p-4 font-semibold">Best for</th>
                <th scope="col" className="p-4 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-semibold">
                    <Link href={`/products/${p.slug}`} className="text-leaf-700 hover:underline">{p.shortName}</Link>
                  </th>
                  <td className="p-4">{p.waterSource === "tap" ? "Outdoor tap" : p.waterSource === "reservoir" ? "Bucket, tank or barrel" : "—"}</td>
                  <td className="p-4">
                    <ul className="space-y-1">
                      {p.bestFor.map((b) => (
                        <li key={b} className="flex gap-1.5"><Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />{b}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 font-semibold whitespace-nowrap">{formatPrice(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="container-page grid gap-10 pb-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 id="faq-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Good to know</h2>
          <p className="mt-4 text-muted">
            Can’t find your answer? Ask Sprout, our assistant, in the corner — or <Link href="/contact" className="font-medium text-leaf-700 underline">contact us</Link>.
          </p>
        </div>
        <FaqList items={faqs.slice(0, 4)} />
      </section>
    </>
  );
}
