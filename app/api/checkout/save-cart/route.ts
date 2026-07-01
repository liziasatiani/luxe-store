import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, name, cartItems } = await req.json();

    if (!email || !cartItems?.length) {
      return NextResponse.json({ error: "Missing email or cart items" }, { status: 400 });
    }

    await prisma.abandonedCart.create({
      data: { email, name: name ?? null, cartData: cartItems },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
