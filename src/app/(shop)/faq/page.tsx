import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/data/faqs";
import { FaqList } from "@/components/FaqList";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about choosing, installing and using automatic watering kits, plus shipping, payment and returns.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="container-page max-w-3xl py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="eyebrow">Help centre</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Frequently asked questions</h1>
      <div className="mt-8">
        <FaqList items={faqs} />
      </div>
      <p className="mt-8 text-muted">
        Still have a question? Ask Sprout in the bottom-right corner for an instant answer, or{" "}
        <Link href="/contact" className="font-medium text-leaf-700 underline">contact our team</Link>.
      </p>
    </div>
  );
}
