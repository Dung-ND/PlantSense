"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, Eye, History, Loader2, Plus, Trash2 } from "lucide-react";
import { categoryLabel, productSchema, slugify, youtubeIdFrom, type Product } from "@/lib/products/schema";
import { deleteProductAction, restoreRevisionAction, saveProductAction } from "@/app/admin/actions";
import { FieldShell, NumberInput, PairListEditor, Section, StringListEditor } from "@/components/admin/fields";
import { ImageManager } from "@/components/admin/ImageManager";
import { AiFillPanel } from "@/components/admin/AiFillPanel";
import { JsonPanel } from "@/components/admin/JsonPanel";

export type Draft = Omit<Product, "price"> & { price: number | null };

interface Props {
  initial: Draft;
  originalSlug: string | null;
  categories: string[];
  aiEnabled: boolean;
  revisions?: { id: number; action: string; created_at: string }[];
}

export function ProductEditor({ initial, originalSlug, categories, aiEnabled, revisions = [] }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState<Draft>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(originalSlug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // A brand-new product moves to its own URL after the first save; show the confirmation there.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("saved") !== "1") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off message carried over from the previous URL
    setBanner({ tone: "success", text: initial.status === "published" ? "Saved and live in the shop." : "Saved as a draft (not visible in the shop)." });
    url.searchParams.delete("saved");
    window.history.replaceState(null, "", url);
  }, [initial.status]);
  const [pending, startTransition] = useTransition();
  const isNew = originalSlug === null;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      // New products: keep the URL name in sync with the name until it's edited by hand
      if (key === "name" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  /** Replace the whole form (AI fill / JSON import), keeping the URL name of saved products. */
  const replace = (incoming: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...incoming, slug: originalSlug ?? incoming.slug ?? d.slug }));
    setErrors({});
  };

  function save(status: Draft["status"]) {
    const candidate = { ...draft, status };
    const check = productSchema.safeParse(candidate);
    if (!check.success) {
      const found: Record<string, string> = {};
      for (const issue of check.error.issues) found[issue.path.join(".")] ??= issue.message;
      setErrors(found);
      setBanner({ tone: "error", text: `Please fix ${Object.keys(found).length} field${Object.keys(found).length > 1 ? "s" : ""} before saving.` });
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true], .field-error")?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    startTransition(async () => {
      const result = await saveProductAction(check.data, originalSlug);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setBanner({ tone: "error", text: result.error });
        return;
      }
      setDraft(check.data);
      setSaved(check.data);
      setErrors({});
      setBanner({ tone: "success", text: status === "published" ? "Saved and live in the shop." : "Saved as a draft (not visible in the shop)." });
      if (result.slug !== originalSlug) router.replace(`/admin/products/${result.slug}?saved=1`);
      else router.refresh();
    });
  }

  const nestedErrors = Object.entries(errors).filter(([k]) => k.includes("."));
  const id = (name: string) => `product-${name}`;
  const err = (name: string) => errors[name];
  const aria = (name: string) => ({ id: id(name), "aria-invalid": !!err(name), "aria-describedby": err(name) ? `${id(name)}-error` : undefined });

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-line bg-[#f4f3ee]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white" aria-label="Back to products">
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{draft.name || (isNew ? "New product" : "Untitled")}</h1>
              <p className="text-xs text-muted">
                {saved.status === "published" && !isNew ? "● Live in shop" : isNew ? "Not saved yet" : "○ Draft"}
                {dirty && " · unsaved changes"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isNew && (
              <Link href={`/admin/products/${originalSlug}/preview`} className="btn-ghost" aria-disabled={dirty} title={dirty ? "Save first to preview changes" : undefined}>
                <Eye className="size-4" aria-hidden /> Preview
              </Link>
            )}
            <button type="button" className="btn-secondary" disabled={pending} onClick={() => save("draft")}>
              {saved.status === "published" && !isNew ? "Unpublish & save" : "Save draft"}
            </button>
            <button type="button" className="btn-primary" disabled={pending} onClick={() => save("published")}>
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {saved.status === "published" && !isNew ? "Save changes" : "Publish"}
            </button>
          </div>
        </div>
        {banner && (
          <p role={banner.tone === "error" ? "alert" : "status"} className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${banner.tone === "success" ? "bg-leaf-100 text-leaf-800" : "bg-red-50 text-red-800"}`}>
            {banner.tone === "success" ? <CircleCheck className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
            {banner.text}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 space-y-6 lg:order-1">
          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell id={id("name")} label="Product name" error={err("name")}>
                <input {...aria("name")} className="field-input" value={draft.name} placeholder="HCT-322 Automatic Water Timer" onChange={(e) => set("name", e.target.value)} />
              </FieldShell>
              <FieldShell id={id("shortName")} label="Short name" error={err("shortName")} hint="Used in the cart and menus (max 40)">
                <input {...aria("shortName")} className="field-input" maxLength={40} value={draft.shortName} placeholder="HCT-322 Timer" onChange={(e) => set("shortName", e.target.value)} />
              </FieldShell>
              <FieldShell id={id("sku")} label="SKU / model" error={err("sku")}>
                <input {...aria("sku")} className="field-input" value={draft.sku} placeholder="HCT-322" onChange={(e) => set("sku", e.target.value)} />
              </FieldShell>
              <FieldShell id={id("slug")} label="URL name" error={err("slug")} hint={<>yoursite.com/products/<strong>{draft.slug || "…"}</strong>{!isNew && " · changing it breaks old links"}</>}>
                <input
                  {...aria("slug")}
                  className="field-input font-mono text-sm"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                />
              </FieldShell>
              <FieldShell id={id("category")} label="Category" error={err("category")} hint={draft.category ? `Shown as “${categoryLabel(draft.category)}”` : "Pick one or type a new one"}>
                <input {...aria("category")} className="field-input" list="category-options" value={draft.category} onChange={(e) => set("category", slugify(e.target.value) || e.target.value.toLowerCase())} />
                <datalist id="category-options">
                  {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </datalist>
              </FieldShell>
              <FieldShell id={id("waterSource")} label="Water source">
                <select id={id("waterSource")} className="field-input" value={draft.waterSource} onChange={(e) => set("waterSource", e.target.value as Draft["waterSource"])}>
                  <option value="tap">Connects to a tap</option>
                  <option value="reservoir">Runs from a reservoir</option>
                  <option value="other">Other / not applicable</option>
                </select>
              </FieldShell>
            </div>
          </Section>

          <Section title="Price & stock">
            <div className="grid gap-4 sm:grid-cols-3">
              <FieldShell id={id("price")} label="Price" error={err("price")}>
                <NumberInput id={id("price")} value={draft.price} error={err("price")} placeholder="29.90" onChange={(n) => set("price", n)} />
              </FieldShell>
              <FieldShell id={id("compareAtPrice")} label="Old price (optional)" error={err("compareAtPrice")} hint="Shown crossed out">
                <NumberInput id={id("compareAtPrice")} value={draft.compareAtPrice} error={err("compareAtPrice")} onChange={(n) => set("compareAtPrice", n)} />
              </FieldShell>
              <FieldShell id={id("badge")} label="Badge (optional)" error={err("badge")} hint="e.g. New, Best seller">
                <input {...aria("badge")} className="field-input" maxLength={30} value={draft.badge} onChange={(e) => set("badge", e.target.value)} />
              </FieldShell>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="size-5 accent-leaf-600" checked={draft.inStock} onChange={(e) => set("inStock", e.target.checked)} />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="font-medium">Display order</span>
                <input type="number" className="field-input w-24 py-1.5" min={0} value={draft.sortOrder} onChange={(e) => set("sortOrder", Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
                <span className="text-muted">lower = first</span>
              </label>
            </div>
          </Section>

          <Section title="Photos" description="The first photo is the main one in the shop.">
            <ImageManager images={draft.images} onChange={(images) => set("images", images)} error={err("images")} />
          </Section>

          <Section title="Videos" description="YouTube links — shown on the product page, loaded only when played.">
            <ul className="space-y-3">
              {draft.videos.map((v, i) => {
                const vid = youtubeIdFrom(v.url);
                return (
                  <li key={i} className="flex gap-3">
                    <div className="hidden aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-leaf-50 sm:block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {vid && <img src={`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="grid flex-1 gap-2">
                      <input className="field-input" placeholder="https://youtube.com/watch?v=…" aria-label={`Video ${i + 1} link`} aria-invalid={!!err(`videos.${i}.url`) || (v.url !== "" && !vid)} value={v.url} onChange={(e) => set("videos", draft.videos.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                      <input className="field-input" placeholder="Title (optional), e.g. How to install" aria-label={`Video ${i + 1} title`} value={v.title} onChange={(e) => set("videos", draft.videos.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                      {v.url !== "" && !vid && <p className="field-error mt-0">That doesn’t look like a YouTube link.</p>}
                    </div>
                    <button type="button" className="grid size-10 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => set("videos", draft.videos.filter((_, j) => j !== i))} aria-label={`Remove video ${i + 1}`}>
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="btn-ghost min-h-9 px-3" onClick={() => set("videos", [...draft.videos, { url: "", title: "" }])}>
              <Plus className="size-4" aria-hidden /> Add YouTube video
            </button>
          </Section>

          <Section title="Description">
            <FieldShell id={id("summary")} label="Summary" error={err("summary")} hint={`One sentence shown on product cards · ${draft.summary.length}/300`}>
              <textarea {...aria("summary")} className="field-input min-h-20" maxLength={300} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
            </FieldShell>
            <StringListEditor label="Paragraphs" multiline items={draft.description} onChange={(v) => set("description", v)} addLabel="Add paragraph" error={err("description")} />
            <StringListEditor label="Best for" items={draft.bestFor} placeholder="Balconies without a tap" onChange={(v) => set("bestFor", v)} error={err("bestFor")} />
            <PairListEditor label="Highlights" items={draft.highlights} multilineSecond keys={[{ key: "title", label: "Highlight title", placeholder: "No tap needed" }, { key: "text", label: "Highlight text", placeholder: "One short sentence" }]} onChange={(v) => set("highlights", v)} addLabel="Add highlight" error={err("highlights")} />
          </Section>

          <Section title="Specifications & box contents">
            <PairListEditor label="Specifications" items={draft.specs} keys={[{ key: "label", label: "Spec name", placeholder: "Power" }, { key: "value", label: "Spec value", placeholder: "2 × AA batteries" }]} onChange={(v) => set("specs", v)} addLabel="Add spec" error={err("specs")} />
            <StringListEditor label="What’s in the box" items={draft.inTheBox} onChange={(v) => set("inTheBox", v)} addLabel="Add item" error={err("inTheBox")} />
          </Section>

          <Section title="Notes for the chatbot" description="Only Sprout (the customer assistant) sees this: setup tips, caveats, details still to confirm.">
            <textarea id={id("assistantNotes")} aria-label="Notes for the chatbot" className="field-input min-h-28" maxLength={2000} value={draft.assistantNotes} onChange={(e) => set("assistantNotes", e.target.value)} />
          </Section>

          {nestedErrors.length > 0 && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Please fix:</p>
              <ul className="mt-1 list-disc pl-5">
                {nestedErrors.map(([k, m]) => <li key={k}>{k.replace(/\.(\d+)\./, (_, n) => ` #${Number(n) + 1} `)}: {m}</li>)}
              </ul>
            </div>
          )}

          {!isNew && (
            <Section title="History & danger zone">
              {revisions.length > 0 && (
                <details>
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium"><History className="size-4" aria-hidden /> Previous versions ({revisions.length})</summary>
                  <ul className="mt-3 divide-y divide-line text-sm">
                    {revisions.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                        <span>{new Date(r.created_at + "Z").toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} <span className="text-muted">· {r.action}</span></span>
                        <button
                          type="button"
                          className="btn-ghost min-h-8 px-3"
                          onClick={() => {
                            if (!confirm("Restore this version as a draft? Your current version stays in history.")) return;
                            startTransition(async () => {
                              const res = await restoreRevisionAction(r.id, originalSlug!);
                              if (!res.ok) return setBanner({ tone: "error", text: res.error });
                              setDraft(res.product);
                              setSaved(res.product);
                              setBanner({ tone: "success", text: "Earlier version restored as a draft. Publish when you’re happy with it." });
                              router.refresh();
                            });
                          }}
                        >
                          Restore
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <button
                type="button"
                className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm(`Delete “${saved.name}” permanently? It will disappear from the shop.`)) startTransition(() => deleteProductAction(originalSlug!));
                }}
              >
                <Trash2 className="size-4" aria-hidden /> Delete product
              </button>
            </Section>
          )}
        </div>

        <aside className="order-1 space-y-6 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <AiFillPanel enabled={aiEnabled} draft={draft} onFill={replace} />
          <JsonPanel draft={draft} onImport={replace} />
        </aside>
      </div>
    </div>
  );
}
