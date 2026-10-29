import { adminGuard } from "@/lib/admin/auth";
import { storeImage } from "@/lib/media";

/** Accepts one or more images (field "files"), returns their public URLs. */
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return Response.json({ error: "No image received." }, { status: 400 });
  if (files.length > 12) return Response.json({ error: "Upload at most 12 images at a time." }, { status: 400 });

  const results = await Promise.allSettled(files.map((f) => storeImage(f)));
  const urls = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  const failed = results.flatMap((r, i) => (r.status === "rejected" ? [files[i].name] : []));
  if (urls.length === 0) {
    return Response.json({ error: "Those files couldn't be read as images. Use JPG, PNG, WebP, HEIC or GIF." }, { status: 400 });
  }
  return Response.json({ urls, failed });
}
