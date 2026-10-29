import "server-only";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { UPLOADS_DIR, db } from "@/lib/db";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const FILE_RE = /^[\w-]+\.webp$/;

/** Resizes, strips metadata and stores an uploaded image as WebP. Returns its public URL. */
export async function storeImage(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 15 MB.");
  db(); // ensures the uploads folder exists
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input, { failOn: "error" })
    .rotate() // respect phone camera orientation
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
  await writeFile(path.join(UPLOADS_DIR, name), output);
  return `/media/${name}`;
}

export function mediaPath(fileName: string) {
  return FILE_RE.test(fileName) ? path.join(UPLOADS_DIR, fileName) : null;
}

/** Small JPEG data URL of an uploaded image, for sending to the AI model. */
export async function imageForAi(url: string) {
  const file = mediaPath(url.replace(/^\/media\//, ""));
  if (!file) return null;
  try {
    const small = await sharp(await readFile(file)).resize({ width: 768, height: 768, fit: "inside" }).jpeg({ quality: 75 }).toBuffer();
    return `data:image/jpeg;base64,${small.toString("base64")}`;
  } catch {
    return null;
  }
}
