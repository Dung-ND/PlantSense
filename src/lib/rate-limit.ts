import "server-only";

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple fixed-window limiter, kept in memory per server instance.
 * Good enough to stop casual abuse of your OpenAI token; for multi-instance
 * deployments swap this for Redis/Upstash.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function clientKey(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
}
