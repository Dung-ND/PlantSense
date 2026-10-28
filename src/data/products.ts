/**
 * Product catalog.
 *
 * To add a new device, append an object to `products` below. Everything else
 * (catalog, filters, product page, comparison table, sitemap, chatbot
 * knowledge) picks it up automatically.
 *
 * Photos: put files in /public/products/ and list them in `images`
 * (e.g. "/products/hct-322-front.jpg"). Without photos an illustration is shown.
 *
 * NOTE: prices and any spec marked "verify" are placeholders — check them
 * against your supplier's datasheet before going live.
 */

export type Category = "timer" | "reservoir-kit";
export type WaterSource = "tap" | "reservoir";

export interface Product {
  slug: string;
  sku: string;
  name: string;
  shortName: string;
  category: Category;
  waterSource: WaterSource;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  badge?: string;
  summary: string;
  description: string[];
  bestFor: string[];
  highlights: { title: string; text: string }[];
  specs: { label: string; value: string }[];
  inTheBox: string[];
  images: string[];
  illustration: "timer" | "kit" | "kit-large";
  /** Extra facts only the chatbot sees (setup tips, caveats). */
  assistantNotes?: string;
}

export const categories: Record<Category, { label: string; description: string }> = {
  timer: {
    label: "Tap timers",
    description: "Screw onto an outdoor tap and water on a schedule.",
  },
  "reservoir-kit": {
    label: "Reservoir drip kits",
    description: "No tap needed — a pump draws from a tank or bucket.",
  },
};

export const waterSources: Record<WaterSource, string> = {
  tap: "Connects to a tap",
  reservoir: "Runs from a reservoir",
};

export const products: Product[] = [
  {
    slug: "hct-322-automatic-water-timer",
    sku: "HCT-322",
    name: "HCT-322 Automatic Water Timer",
    shortName: "HCT-322 Timer",
    category: "timer",
    waterSource: "tap",
    price: 29.9,
    compareAtPrice: 34.9,
    inStock: true,
    badge: "Best seller",
    summary:
      "A battery-powered tap timer that waters your garden on a schedule — no wiring, no app, no guesswork.",
    description: [
      "The HCT-322 screws straight onto an outdoor tap and opens the water flow on the schedule you set. Hook it up to a hose, sprinkler or drip line and your garden waters itself, every day or every few days, while you're at work or away on holiday.",
      "Clear buttons and an LCD screen make programming quick. Two AA batteries keep it running, so there's nothing to plug in.",
    ],
    bestFor: ["Gardens with an outdoor tap", "Lawns and flower beds", "Hose, sprinkler or drip lines"],
    highlights: [
      { title: "Set & forget", text: "Choose how often and how long to water — it handles the rest." },
      { title: "Battery powered", text: "Runs on 2 × AA batteries. No cables, no power outlet needed." },
      { title: "Weather resistant", text: "Splash-proof housing built to live outdoors." },
      { title: "Fits standard taps", text: "Comes with adapters for common 1/2\" and 3/4\" taps." },
    ],
    specs: [
      { label: "Power", value: "2 × AA 1.5 V alkaline batteries (not included)" },
      { label: "Tap connection", value: "1/2\" and 3/4\" threads" },
      { label: "Working pressure", value: "0.05 – 0.8 MPa" },
      { label: "Operating temperature", value: "1 – 45 °C" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Material", value: "ABS plastic" },
      { label: "Dimensions", value: "98 × 49 × 126 mm" },
      { label: "Weight", value: "approx. 366 g" },
    ],
    inTheBox: ["HCT-322 timer", "Tap adapters", "Hose connector", "Rubber washers", "User manual"],
    images: [],
    illustration: "timer",
    assistantNotes:
      "Needs mains water pressure from a tap — not suitable for balconies without a tap (suggest a reservoir kit instead). Bring it indoors before frost; water left inside can freeze and crack it. Replace batteries every season.",
  },
  {
    slug: "bsv-ic305-reservoir-drip-kit",
    sku: "BSV-IC305",
    name: "BSV-IC305 Reservoir-Fed Drip Kit",
    shortName: "BSV-IC305 Kit",
    category: "reservoir-kit",
    waterSource: "reservoir",
    price: 39.9,
    inStock: true,
    badge: "Great for balconies",
    summary:
      "A complete drip system with a built-in pump and timer that draws water from any bucket or tank — perfect where there's no tap.",
    description: [
      "Drop the filtered intake into a bucket, run the tubing to your pots and the BSV-IC305 waters each plant directly at the roots on a timer. No tap, no plumbing — ideal for balconies, patios, indoor plants and greenhouses.",
      "Drip watering puts water exactly where roots need it, so you use less water and avoid soggy leaves.",
    ],
    bestFor: ["Balconies & patios without a tap", "Potted plants & herbs", "Indoor plants while you travel"],
    highlights: [
      { title: "No tap needed", text: "The built-in pump draws from a bucket, tank or rain barrel." },
      { title: "Root-level drip", text: "Emitters deliver water to each pot — less waste, healthier roots." },
      { title: "Built-in timer", text: "Pick how often and how long it waters." },
      { title: "Fits in minutes", text: "Push-fit tubing and stakes, no tools required." },
    ],
    specs: [
      { label: "Water source", value: "Bucket, tank or reservoir (not included)" },
      { label: "Pump", value: "Built-in, with intake filter" },
      { label: "Scheduling", value: "Built-in programmable timer" },
      { label: "Delivery", value: "Drip emitters with ground stakes" },
    ],
    inTheBox: ["Control unit with pump & timer", "Intake hose with filter", "Distribution tubing", "Drip emitters & stakes", "Connectors", "User manual"],
    images: [],
    illustration: "kit",
    assistantNotes:
      "There is no water-level sensor — customers should check the reservoir regularly; an empty reservoir is the most common reason for no flow. Keep the intake filter clean. Exact tubing length, number of drip outlets and power supply: not confirmed yet — offer to have the team confirm.",
  },
  {
    slug: "bsv-ic006-high-capacity-reservoir-kit",
    sku: "BSV-IC006",
    name: "BSV-IC006 Higher-Capacity Reservoir Kit",
    shortName: "BSV-IC006 Kit",
    category: "reservoir-kit",
    waterSource: "reservoir",
    price: 69.9,
    inStock: true,
    badge: "Most capacity",
    summary:
      "Our bigger reservoir-fed system for larger collections of pots, raised beds and longer trips away.",
    description: [
      "The BSV-IC006 brings the convenience of reservoir-fed drip watering to bigger spaces. It's built for gardeners with more plants to look after — rows of pots, raised beds or a small greenhouse.",
      "Like our other reservoir kits it needs no tap: fill the reservoir, set the schedule and let it water at the roots while you're away.",
    ],
    bestFor: ["Larger pot collections", "Raised beds & greenhouses", "Longer holidays"],
    highlights: [
      { title: "Higher capacity", text: "Designed to water more plants than our compact kit." },
      { title: "No tap needed", text: "Runs entirely from a reservoir or rain barrel." },
      { title: "Root-level drip", text: "Even watering across every pot on the line." },
      { title: "Durable build", text: "ABS housing made for outdoor use." },
    ],
    specs: [
      { label: "Water source", value: "Reservoir, tank or rain barrel" },
      { label: "Housing", value: "ABS plastic" },
      { label: "Weight", value: "approx. 2.3 kg" },
      { label: "Delivery", value: "Drip emitters with ground stakes" },
    ],
    inTheBox: ["Control unit", "Intake hose with filter", "Distribution tubing", "Drip emitters & stakes", "Connectors", "User manual"],
    images: [],
    illustration: "kit-large",
    assistantNotes:
      "Recommend over the BSV-IC305 when the customer has many plants (roughly 15+ pots), raised beds, or will be away a long time. Exact capacity, number of outlets and power source (some listings say solar-powered): not confirmed yet — offer to have the team confirm.",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductBySku(sku: string) {
  return products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
}
