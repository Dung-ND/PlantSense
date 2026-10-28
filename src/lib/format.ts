import { site } from "@/config/site";

const currency = new Intl.NumberFormat(site.locale, { style: "currency", currency: site.currency });
const wholeCurrency = new Intl.NumberFormat(site.locale, { style: "currency", currency: site.currency, maximumFractionDigits: 0 });

/** "$29.90", but "$60" for whole amounts. */
export function formatPrice(amount: number) {
  return (Number.isInteger(amount) ? wholeCurrency : currency).format(amount);
}
