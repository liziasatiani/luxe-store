import { NextRequest, NextResponse } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Hard ceiling on tracked keys. Without it the map grows once per unique IP and
 * never shrinks, which is a memory leak an attacker can drive by spoofing
 * `x-forwarded-for`.
 *
 * NOTE: this limiter is per-process and therefore only correct on a single
 * instance. Behind multiple serverless instances or replicas it degrades to
 * `limit * instanceCount`. Move to Redis/Upstash before horizontal scaling.
 */
const MAX_KEYS = 10_000;

function evictExpired(now: number): void {
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
  // Still over budget after dropping expired entries: drop oldest insertions.
  if (store.size >= MAX_KEYS) {
    const excess = store.size - MAX_KEYS + 1;
    let i = 0;
    for (const k of store.keys()) {
      if (i++ >= excess) break;
      store.delete(k);
    }
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    if (store.size >= MAX_KEYS) evictExpired(now);
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * WARNING: `x-forwarded-for` and `x-real-ip` are attacker-controlled unless a
 * trusted proxy overwrites them. Any limit keyed on this value can be evaded by
 * rotating the header, so IP keys are a speed bump, not a control. Prefer keying
 * on a stable identity (account email, user id) for anything security-critical —
 * see the login limiter in lib/auth.ts.
 *
 * `x-forwarded-for` is also a client→proxy chain, so the left-most entry is the
 * least trustworthy hop; behind a known proxy depth you want the right-most.
 */
export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  // An empty header yields "" rather than undefined, which would bucket every
  // such request under one shared key.
  if (forwarded) return forwarded;
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      },
    }
  );
}
