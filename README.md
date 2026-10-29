# PlantSense — automatic watering shop

An online shop for automatic drip-watering devices, with an AI shopping assistant ("Sprout") powered by OpenAI.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and SQLite.

## Features

- **Shop**: home page, catalog with filters/sorting, product pages (specs, what's in the box, structured data for Google), cart, checkout without an account, contact form, FAQ.
- **Help choosing**: a two-question kit finder and a comparison table.
- **AI assistant**: streams answers, knows your catalog, policies and FAQ, links to products, adds items to the cart on request, and — with the visitor's consent — collects their name, contact and needs and sends them to you as a lead.
- **Admin (`/admin`)**: password-protected product management. Add or edit products in a form, upload photos (auto-resized), add YouTube videos, publish or keep as draft, toggle stock, preview, restore earlier versions.
- **Fill with AI**: paste notes in any language (and upload photos first) — the AI fills the product form in the fixed template; you review and save. You can also paste a template filled in by any other AI (ChatGPT, Claude, Gemini) — see `/admin/template`.
- **UX & accessibility**: mobile-first, keyboard and screen-reader friendly (skip link, labelled controls, focus management, live regions), inline form validation, reduced-motion support, free-shipping progress bar, add-to-cart confirmation.
- **Safe with your API key**: the key stays on the server; chat is rate-limited per visitor and request sizes are capped. Prices are always recalculated on the server.

## Getting started

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY and ADMIN_PASSWORD
npm run dev                  # shop: http://localhost:3000 · admin: http://localhost:3000/admin
```

## Managing products

Log in at `/admin` with `ADMIN_PASSWORD`. Products live in a SQLite database in `DATA_DIR` (default `./data`); photos in `DATA_DIR/uploads`. On first start the database is filled with the starter products from `src/data/seed-products.ts`.

**The product template** is defined once in `src/lib/products/schema.ts`. The admin form, "Fill with AI" and JSON import all produce it, and the server validates it before saving. Every save is kept in a version history.

All reads and writes go through `src/lib/products/repo.ts`, so other tools (for example an MCP server for Claude Desktop/ChatGPT) can be added later on top of the same rules.

## Customising

| What | Where |
| --- | --- |
| Shop name, currency, shipping, contact details, policies, payment methods | `src/config/site.ts` |
| Products | `/admin` |
| Product template (fields & rules) | `src/lib/products/schema.ts` |
| AI fill instructions | `src/lib/admin/ai-fill.ts` |
| FAQ | `src/data/faqs.ts` |
| Customer assistant personality and rules | `src/lib/assistant.ts` |
| Colours and fonts | `src/app/globals.css`, `src/app/layout.tsx` |

> ⚠️ Prices and some specs of the starter products are placeholders. Check them in `/admin` before launch.

## Receiving orders and leads

Every order, contact message and chatbot lead is a JSON "submission" (`kind`: `order`, `contact` or `chat-lead`):

- Set `LEAD_WEBHOOK_URL` to forward them, e.g. to a Zapier/Make/n8n flow that emails you, or a Google Apps Script that writes to a Google Sheet.
- Without a webhook they are appended to `DATA_DIR/submissions.jsonl`.

## Deploying

See **[docs/DEPLOY.md](docs/DEPLOY.md)**: a VPS running Node.js behind Cloudflare Tunnel, with a systemd service, update script and daily backups (`npm run backup`).
