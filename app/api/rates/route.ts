import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FALLBACK = { USD_GEL: 2.77, EUR_GEL: 3.00, USD_EUR: 0.92 };

type Rates = typeof FALLBACK;

async function fetchLiveRates(): Promise<Rates | null> {
  try {
    const res = await fetch(
      "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const USD_GEL: number = data.usd?.gel;
    const USD_EUR: number = data.usd?.eur;
    if (!USD_GEL || !USD_EUR) return null;
    return {
      USD_GEL: parseFloat(USD_GEL.toFixed(4)),
      EUR_GEL: parseFloat((USD_GEL / USD_EUR).toFixed(4)),
      USD_EUR: parseFloat(USD_EUR.toFixed(4)),
    };
  } catch {
    return null;
  }
}

async function readCachedRates() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["rate_usd_gel", "rate_eur_gel", "rate_usd_eur", "rates_updated_at"] } },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function writeRates(rates: Rates) {
  const now = new Date().toISOString();
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: "rate_usd_gel" }, create: { key: "rate_usd_gel", value: String(rates.USD_GEL), type: "number" }, update: { value: String(rates.USD_GEL) } }),
    prisma.siteSetting.upsert({ where: { key: "rate_eur_gel" }, create: { key: "rate_eur_gel", value: String(rates.EUR_GEL), type: "number" }, update: { value: String(rates.EUR_GEL) } }),
    prisma.siteSetting.upsert({ where: { key: "rate_usd_eur" }, create: { key: "rate_usd_eur", value: String(rates.USD_EUR), type: "number" }, update: { value: String(rates.USD_EUR) } }),
    prisma.siteSetting.upsert({ where: { key: "rates_updated_at" }, create: { key: "rates_updated_at", value: now, type: "string" }, update: { value: now } }),
  ]);
}

function parseRates(byKey: Record<string, string>): Rates & { updatedAt: string | null } {
  return {
    USD_GEL: parseFloat(byKey["rate_usd_gel"] ?? String(FALLBACK.USD_GEL)),
    EUR_GEL: parseFloat(byKey["rate_eur_gel"] ?? String(FALLBACK.EUR_GEL)),
    USD_EUR: parseFloat(byKey["rate_usd_eur"] ?? String(FALLBACK.USD_EUR)),
    updatedAt: byKey["rates_updated_at"] ?? null,
  };
}

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "true";

  if (!force) {
    const byKey = await readCachedRates();
    const updatedAt = byKey["rates_updated_at"] ? new Date(byKey["rates_updated_at"]) : null;
    const fresh = updatedAt && Date.now() - updatedAt.getTime() < CACHE_TTL_MS;
    if (fresh && byKey["rate_usd_gel"]) {
      return NextResponse.json(
        { success: true, data: { ...parseRates(byKey), source: "cache" } },
        { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
      );
    }
  }

  const live = await fetchLiveRates();
  if (live) {
    await writeRates(live);
    return NextResponse.json(
      { success: true, data: { ...live, updatedAt: new Date().toISOString(), source: "live" } },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
    );
  }

  // API down — return stale cache or hardcoded fallback
  const byKey = await readCachedRates();
  if (byKey["rate_usd_gel"]) {
    return NextResponse.json(
      { success: true, data: { ...parseRates(byKey), source: "stale" } },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } }
    );
  }

  return NextResponse.json(
    { success: true, data: { ...FALLBACK, updatedAt: null, source: "fallback" } },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}

// Admin-only: manual rate override
export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.USD_GEL !== "number" || typeof body.EUR_GEL !== "number") {
    return NextResponse.json({ success: false, error: "Invalid rates" }, { status: 400 });
  }

  const rates: Rates = {
    USD_GEL: parseFloat(Number(body.USD_GEL).toFixed(4)),
    EUR_GEL: parseFloat(Number(body.EUR_GEL).toFixed(4)),
    USD_EUR: parseFloat((Number(body.EUR_GEL) / Number(body.USD_GEL)).toFixed(4)),
  };

  await writeRates(rates);
  return NextResponse.json({ success: true, data: { ...rates, updatedAt: new Date().toISOString(), source: "manual" } });
}
