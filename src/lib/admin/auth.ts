import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

const COOKIE = "ps_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  // Changing ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) logs every session out.
  return createHash("sha256").update(`${process.env.ADMIN_SESSION_SECRET ?? ""}:${password}`).digest();
}

const sign = (value: string, key: Buffer) => createHmac("sha256", key).update(value).digest("base64url");

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(input, password!);
}

export async function startSession() {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  (await cookies()).set(COOKIE, `${expires}.${sign(String(expires), key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  await connection(); // always checked per request, never prerendered
  const key = secret();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!key || !value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(expires, key));
}

/** For pages and server actions: sends visitors without a session to the login page. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For route handlers: returns a 401 response to send back, or null when allowed. */
export async function adminGuard() {
  return (await isAdmin()) ? null : Response.json({ error: "Please log in again." }, { status: 401 });
}
