import { z } from "zod";
import { site } from "@/config/site";
import { saveSubmission } from "@/lib/leads";
import { MAX_QTY, priceCart } from "@/lib/pricing";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const orderSchema = z.object({
  items: z.array(z.object({ slug: z.string().max(120), quantity: z.number().int().min(1).max(MAX_QTY) })).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(6).max(40),
    email: z.email().max(200),
    address: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(120),
    notes: z.string().trim().max(1000).optional(),
  }),
  payment: z.enum(site.paymentMethods.map((m) => m.id) as [string, ...string[]]),
});

export async function POST(req: Request) {
  if (!rateLimit(`order:${clientKey(req)}`, 5, 60_000).ok) {
    return Response.json({ error: "Too many attempts — please wait a minute and try again." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the highlighted fields.", issues: parsed.error.issues }, { status: 400 });
  }

  const totals = priceCart(parsed.data.items);
  if (totals.items.length === 0) return Response.json({ error: "Your cart is empty." }, { status: 400 });
  const unavailable = totals.items.find((i) => !i.product.inStock);
  if (unavailable) return Response.json({ error: `${unavailable.product.name} is out of stock.` }, { status: 409 });

  try {
    const order = await saveSubmission("order", {
      customer: parsed.data.customer,
      payment: parsed.data.payment,
      items: totals.items.map((i) => ({ sku: i.product.sku, name: i.product.name, quantity: i.quantity, unitPrice: i.product.price, lineTotal: i.lineTotal })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      currency: site.currency,
    });
    return Response.json({ orderId: order.id, total: totals.total });
  } catch {
    return Response.json(
      { error: `We couldn't place your order. Please try again or contact us at ${site.contact.email}.` },
      { status: 500 },
    );
  }
}
