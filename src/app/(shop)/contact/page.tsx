import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Questions about watering kits, orders or bulk pricing? Get in touch with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">We’re happy to help</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Questions about which kit to choose, an order, or bulk pricing for your garden club? Send us a message and we’ll reply within one working day.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ContactForm />
        <aside className="card h-fit space-y-5 p-6">
          <h2 className="text-lg font-semibold">Other ways to reach us</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <Mail className="size-5 text-leaf-600" aria-hidden />
              <a href={`mailto:${site.contact.email}`} className="font-medium hover:underline">{site.contact.email}</a>
            </li>
            <li className="flex gap-3">
              <Phone className="size-5 text-leaf-600" aria-hidden />
              <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="font-medium hover:underline">{site.contact.phone}</a>
            </li>
            <li className="flex gap-3"><Clock className="size-5 text-leaf-600" aria-hidden />{site.contact.hours}</li>
            <li className="flex gap-3"><MapPin className="size-5 text-leaf-600" aria-hidden />{site.contact.address}</li>
          </ul>
          <p className="rounded-xl bg-leaf-50 p-4 text-sm">
            <strong>Need an answer now?</strong> Our assistant Sprout replies instantly — open it from the bottom-right corner.
          </p>
        </aside>
      </div>
    </div>
  );
}
