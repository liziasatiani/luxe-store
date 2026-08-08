import { NextRequest, NextResponse } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();
// Hard ceiling to prevent unbounded memory growth under IP-spoofing or high traffic.
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

function inProcessRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const upstashConfigured =
  UPSTASH_URL.length > 0 &&
  !UPSTASH_URL.startsWith("[") &&
  UPSTASH_TOKEN.length > 0 &&
  !UPSTASH_TOKEN.startsWith("[");

// Fixed-window limiter via Upstash Redis REST pipeline (SET NX + INCR + PTTL).
async function upstashRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
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
    return inProcessRateLimit(key, limit, windowMs);
  }

  if (!res.ok) return inProcessRateLimit(key, limit, windowMs);

  const body = (await res.json()) as [unknown, { result: number }, { result: number }];
  const count = body[1]?.result ?? 1;
  const pttl = body[2]?.result ?? windowMs;
  const resetAt = Date.now() + Math.max(pttl, 0);

  if (count > limit) return { allowed: false, remaining: 0, resetAt };
  return { allowed: true, remaining: Math.max(0, limit - count), resetAt };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (upstashConfigured) return upstashRateLimit(key, limit, windowMs);
  return inProcessRateLimit(key, limit, windowMs);
}

// x-forwarded-for is attacker-controlled without a trusted proxy — use as a speed bump only.
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
