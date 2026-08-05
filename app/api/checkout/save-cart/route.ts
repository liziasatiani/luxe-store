import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

const saveCartSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(200).optional(),
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string().max(500),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive().max(100),
    image: z.string().url().optional(),
  })).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`save-cart:${getIP(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = saveCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, name, cartItems } = parsed.data;

    const existing = await prisma.abandonedCart.findFirst({ where: { email }, select: { id: true } });
    if (existing) {
      await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: { name: name ?? null, cartData: cartItems, notifiedAt: null, orderedAt: null },
      });
    } else {
      await prisma.abandonedCart.create({ data: { email, name: name ?? null, cartData: cartItems } });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
