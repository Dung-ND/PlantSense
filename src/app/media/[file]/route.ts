import { readFile } from "node:fs/promises";
import { mediaPath } from "@/lib/media";

/** Serves images uploaded through the admin (stored outside the build, in DATA_DIR/uploads). */
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const file = mediaPath((await ctx.params).file);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
        // File names are unique per upload, so they never change.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
