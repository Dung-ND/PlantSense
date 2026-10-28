# PlantSense — automatic watering shop

An online shop for automatic drip-watering devices, with an AI shopping assistant ("Sprout") powered by OpenAI.

Built with Next.js 16 (App Router), TypeScript and Tailwind CSS 4.

## Features

- **Shop**: home page, catalog with filters/sorting, product pages (specs, what's in the box, structured data for Google), cart, checkout without an account, contact form, FAQ.
- **Help choosing**: a two-question kit finder and a comparison table.
- **AI assistant**: streams answers, knows your catalog, policies and FAQ, links to products, adds items to the cart on request, and — with the visitor's consent — collects their name, contact and needs and sends them to you as a lead.
- **UX & accessibility**: mobile-first, keyboard and screen-reader friendly (skip link, labelled controls, focus management, live regions), inline form validation, reduced-motion support, free-shipping progress bar, add-to-cart confirmation.
- **Safe with your API key**: the key stays on the server; chat is rate-limited per visitor and request sizes are capped. Prices are always recalculated on the server.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

## Customising

| What | Where |
| --- | --- |
| Shop name, currency, shipping, contact details, policies, payment methods | `src/config/site.ts` |
| Products (add new devices here) | `src/data/products.ts` |
| Product photos | `public/products/` + the product's `images` array |
| FAQ | `src/data/faqs.ts` |
| Assistant personality and rules | `src/lib/assistant.ts` |
| Kit finder logic | `src/components/KitFinder.tsx` |
| Colours and fonts | `src/app/globals.css`, `src/app/layout.tsx` |

**Adding a device**: append an object to `products` in `src/data/products.ts`. The catalog, product page, comparison table, sitemap and the assistant pick it up automatically. Use `assistantNotes` for facts only the chatbot should know (setup tips, caveats).

> ⚠️ Prices and some specs in `products.ts` are placeholders. Check them against your supplier's datasheets before launch.

## Receiving orders and leads

Every order, contact message and chatbot lead is a JSON "submission" (`kind`: `order`, `contact` or `chat-lead`):

- Set `LEAD_WEBHOOK_URL` to forward them, e.g. to a Zapier/Make/n8n flow that emails you, or a Google Apps Script that writes to a Google Sheet.
- Without a webhook they are appended to `data/submissions.jsonl` (fine for local development or a VPS, **not** on serverless hosts like Vercel).

## Deploying

The easiest option is [Vercel](https://vercel.com/new): import the repo and add the environment variables from `.env.example`. Any Node.js host works too (`npm run build && npm start`).
