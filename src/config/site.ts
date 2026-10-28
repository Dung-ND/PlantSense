/**
 * Shop-wide settings. Edit these values to match your business —
 * every page, the checkout and the chatbot read from here.
 */
export const site = {
  name: "PlantSense",
  tagline: "Automatic watering for happy plants",
  description:
    "Automatic drip watering kits and timers for balconies, gardens and greenhouses. Set it once, go on holiday, come back to thriving plants.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // Money
  currency: "USD",
  locale: "en-US",
  freeShippingThreshold: 60, // set to 0 to always ship free
  shippingFee: 6,

  // Contact — shown in the footer, contact page and given to the chatbot
  contact: {
    email: "hello@plantsense.example",
    phone: "+1 (555) 010-2030",
    hours: "Mon–Sat, 8:00–18:00",
    address: "Your city, your country",
  },

  // Policies — make sure these match what you actually offer
  policies: {
    returnDays: 30,
    warrantyMonths: 12,
    dispatch: "Orders placed before 2 pm ship the same working day.",
  },

  paymentMethods: [
    { id: "cod", label: "Cash on delivery", hint: "Pay the courier when your order arrives." },
    { id: "bank", label: "Bank transfer", hint: "We'll send transfer details by email after you order." },
  ],
} as const;

export type PaymentMethodId = (typeof site.paymentMethods)[number]["id"];
