import { NextRequest, NextResponse } from "next/server";

// ─── In-process store (single-instance fallback) ─────────────────────────────

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Hard ceiling on tracked keys — prevents unbounded memory growth under
 * sustained IP-spoofing or high organic traffic.
 *
 * NOTE: this limiter is per-process. Behind multiple serverless instances or
 * replicas it degrades to `limit × instanceCount`. Configure UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN to switch to the distributed implementation.
 */
const MAX_KEYS = 10_000;

function evictExpired(now: number): void {
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
  if (store.size >= MAX_KEYS) {
    const excess = store.size - MAX_KEYS + 1;
    let i = 0;
    for (const k of store.keys()) {
      if (i++ >= excess) break;
      store.delete(k);
    }
  }
}

function inProcessRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
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

// ─── Upstash Redis (distributed, used when env vars are present) ──────────────

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

/**
 * Returns true when both Upstash env vars are set to non-placeholder values.
 * Placeholder values look like "[YOUR-UPSTASH-URL]" — we check for the bracket.
 */
const upstashConfigured =
  UPSTASH_URL.length > 0 &&
  !UPSTASH_URL.startsWith("[") &&
  UPSTASH_TOKEN.length > 0 &&
  !UPSTASH_TOKEN.startsWith("[");

/**
 * Fixed-window rate limiter backed by Upstash Redis REST API.
 *
 * Uses a three-command pipeline:
 *   1. SET key 0 NX PX windowMs — initialise counter only if key is new
 *   2. INCR key                 — atomic increment (safe under concurrency)
 *   3. PTTL key                 — remaining TTL for accurate Retry-After header
 *
 * The SET NX establishes the TTL exactly once at window start, so the window
 * is fixed (not sliding). INCR is atomic, so two concurrent requests never
 * read the same stale count.
 */
async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const pipeline: unknown[] = [
    ["SET", key, "0", "NX", "PX", String(windowMs)],
    ["INCR", key],
    ["PTTL", key],
  ];

  let res: Response;
  try {
    res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });
  } catch {
    // Network failure — fall back to in-process rather than blocking all requests.
    return inProcessRateLimit(key, limit, windowMs);
  }

  if (!res.ok) {
    return inProcessRateLimit(key, limit, windowMs);
  }

  const body = (await res.json()) as [unknown, { result: number }, { result: number }];
  const count = body[1]?.result ?? 1;
  const pttl = body[2]?.result ?? windowMs;
  const resetAt = Date.now() + Math.max(pttl, 0);

  if (count > limit) {
    return { allowed: false, remaining: 0, resetAt };
  }
  return { allowed: true, remaining: Math.max(0, limit - count), resetAt };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (upstashConfigured) {
    return upstashRateLimit(key, limit, windowMs);
  }
  return inProcessRateLimit(key, limit, windowMs);
}

/**
 * WARNING: `x-forwarded-for` and `x-real-ip` are attacker-controlled unless a
 * trusted proxy overwrites them. IP keys are a speed bump, not a hard control —
 * see the login limiter in lib/auth.ts for an example of keying on a stable
 * identity (account email) instead.
 */
export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
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
