import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const faqs: { q: string; a: string }[] = [
  {
    q: "Which product is right for me?",
    a: "If you have an outdoor tap, the HCT-322 timer is the simplest choice. No tap — for example on a balcony or indoors? Choose a reservoir kit: the BSV-IC305 for a handful of pots, or the BSV-IC006 for larger collections and raised beds. Not sure? Ask our assistant in the bottom corner.",
  },
  {
    q: "Is installation difficult?",
    a: "Not at all. Everything push-fits or screws on by hand — most customers are set up in 10–15 minutes without tools. Each kit includes an illustrated manual.",
  },
  {
    q: "How long can I leave my plants?",
    a: "With a tap timer, as long as the batteries last. With a reservoir kit it depends on reservoir size, number of plants and the schedule — a bigger reservoir means a longer trip. Our assistant can help you estimate.",
  },
  {
    q: "How much does shipping cost?",
    a: site.freeShippingThreshold > 0
      ? `Shipping is free on orders over ${formatPrice(site.freeShippingThreshold)}; otherwise it's a flat ${formatPrice(site.shippingFee)}. ${site.policies.dispatch}`
      : `Shipping is always free. ${site.policies.dispatch}`,
  },
  {
    q: "What if it doesn't work for me?",
    a: `You have ${site.policies.returnDays} days to return it, and every device comes with a ${site.policies.warrantyMonths}-month warranty.`,
  },
  {
    q: "How do I pay?",
    a: `We currently accept ${site.paymentMethods.map((m) => m.label.toLowerCase()).join(" and ")}.`,
  },
];
