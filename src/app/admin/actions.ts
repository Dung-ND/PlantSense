"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/admin/auth";
import { rateLimit } from "@/lib/rate-limit";
import { PRODUCTS_TAG } from "@/lib/products/catalog";
import { ProductConflictError, deleteProduct, getRevision, saveProduct, updateProductFields } from "@/lib/products/repo";

export async function login(_prev: { error?: string } | undefined, form: FormData) {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60_000).ok) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }
  if (!process.env.ADMIN_PASSWORD) return { error: "Set ADMIN_PASSWORD on the server first." };
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Wrong password." };
  await startSession();
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export type SaveResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Validates against the product template and saves. Used by the form, AI fill and JSON import alike. */
export async function saveProductAction(input: unknown, originalSlug: string | null): Promise<SaveResult> {
  await requireAdmin();
  try {
    const saved = saveProduct(input, originalSlug ?? undefined);
    updateTag(PRODUCTS_TAG);
    return { ok: true, slug: saved.slug };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of err.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
      return { ok: false, error: "Some fields need attention.", fieldErrors };
    }
    if (err instanceof ProductConflictError) {
      return { ok: false, error: err.message, fieldErrors: { [err.field]: err.message } };
    }
    console.error("[admin] save failed", err);
    return { ok: false, error: "Saving failed. Please try again." };
  }
}

export async function setStatusAction(slug: string, status: "draft" | "published") {
  await requireAdmin();
  updateProductFields(slug, { status });
  updateTag(PRODUCTS_TAG);
}

export async function setStockAction(slug: string, inStock: boolean) {
  await requireAdmin();
  updateProductFields(slug, { inStock });
  updateTag(PRODUCTS_TAG);
}

export async function deleteProductAction(slug: string) {
  await requireAdmin();
  deleteProduct(slug);
  updateTag(PRODUCTS_TAG);
  redirect("/admin");
}

/** Puts an earlier version back (as a draft, so you can check it before publishing). */
export async function restoreRevisionAction(revisionId: number, currentSlug: string) {
  await requireAdmin();
  const old = getRevision(revisionId);
  if (!old) return { ok: false as const, error: "That version no longer exists." };
  const restored = { ...old, slug: currentSlug, status: "draft" as const };
  const result = await saveProductAction(restored, currentSlug);
  return result.ok ? { ...result, product: restored } : result;
}
