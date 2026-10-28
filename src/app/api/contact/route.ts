import { z } from "zod";
import { saveSubmission } from "@/lib/leads";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional(),
  topic: z.string().max(60),
  message: z.string().trim().min(10).max(3000),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientKey(req)}`, 5, 60_000).ok) {
    return Response.json({ error: "Too many messages — please wait a minute." }, { status: 429 });
  }
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the highlighted fields." }, { status: 400 });

  const { website, ...data } = parsed.data;
  if (website) return Response.json({ ok: true }); // bot — pretend success, store nothing
  try {
    await saveSubmission("contact", data);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Something went wrong. Please email us instead." }, { status: 500 });
  }
}
