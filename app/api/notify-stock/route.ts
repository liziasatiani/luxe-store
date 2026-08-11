import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

const schema = z.object({
  productId: z.string().min(1),
  email: z.string().email(),
});

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "stock_notifications" (
      "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
      "productId"  TEXT        NOT NULL,
      "email"      TEXT        NOT NULL,
      "notifiedAt" TIMESTAMPTZ,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "stock_notifications_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "stock_notifications_product_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "stock_notifications_product_email_key"
    ON "stock_notifications"("productId", "email")
  `);
  tableReady = true;
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`notify-stock:${getIP(req)}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });

    const { productId, email } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { stockStatus: true },
    });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (product.stockStatus !== "OUT_OF_STOCK") {
      return NextResponse.json({ success: false, error: "Product is currently in stock" }, { status: 400 });
    }

    await ensureTable();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "stock_notifications" ("id", "productId", "email")
       VALUES (gen_random_uuid()::text, $1, $2)
       ON CONFLICT ("productId", "email") DO NOTHING`,
      productId, email
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[notify-stock/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
