"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import type { Product } from "@/lib/products/schema";
import { move } from "@/components/admin/fields";

type Img = Product["images"][number];

export function ImageManager({ images, onChange, error }: { images: Img[]; onChange: (images: Img[]) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (list.length === 0) return;
    setMessage("");
    setUploading(list.length);
    try {
      const form = new FormData();
      list.forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onChange([...images, ...data.urls.map((url: string) => ({ url, alt: "" }))].slice(0, 12));
      if (data.failed?.length) setMessage(`Couldn't read: ${data.failed.join(", ")}`);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setUploading(0);
    }
  }

  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.url} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative aspect-[4/3] bg-leaf-50">
                <Image src={img.url} alt={img.alt} fill sizes="300px" className="object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-leaf-700 px-2 py-0.5 text-xs font-semibold text-white">Main photo</span>}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button type="button" className="grid size-8 place-items-center rounded-full bg-white/90 shadow disabled:opacity-40" disabled={i === 0} onClick={() => onChange(move(images, i, i - 1))} aria-label={`Move photo ${i + 1} earlier`}>
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <button type="button" className="grid size-8 place-items-center rounded-full bg-white/90 shadow disabled:opacity-40" disabled={i === images.length - 1} onClick={() => onChange(move(images, i, i + 1))} aria-label={`Move photo ${i + 1} later`}>
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                  <button type="button" className="grid size-8 place-items-center rounded-full bg-white/90 text-red-700 shadow" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <input
                className="w-full border-t border-line px-3 py-2 text-sm focus:outline-none focus-visible:bg-leaf-50"
                placeholder="Describe the photo (for accessibility & SEO)"
                aria-label={`Description of photo ${i + 1}`}
                value={img.alt}
                maxLength={200}
                onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
              />
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${dragging ? "border-leaf-500 bg-leaf-50" : "border-line"}`}
      >
        {uploading ? (
          <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin" aria-hidden /> Uploading {uploading} photo{uploading > 1 ? "s" : ""}…</p>
        ) : (
          <>
            <ImagePlus className="size-8 text-leaf-500" aria-hidden />
            <p className="mt-2 text-sm">
              Drag photos here or{" "}
              <button type="button" className="font-semibold text-leaf-700 underline" onClick={() => inputRef.current?.click()}>choose files</button>
            </p>
            <p className="mt-1 text-xs text-muted">JPG, PNG, WebP or HEIC · resized automatically · up to 12 photos</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {(message || error) && <p role="alert" className="field-error">{message || error}</p>}
    </div>
  );
}
