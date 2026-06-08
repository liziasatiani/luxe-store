import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: true, data: { items: [] } });

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            stock: true, stockStatus: true, isActive: true,
            images: { where: { isPrimary: true }, take: 1 },
            brand: { select: { name: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: { items: serializeDecimal(items) } });
  } catch (err) {
    console.error("[cart/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { productId, variantId, quantity = 1 } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { stock: true, stockStatus: true, trackStock: true },
    });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (product.stockStatus === "OUT_OF_STOCK") {
      return NextResponse.json({ success: false, error: "Product is out of stock" }, { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_variantId: { userId: session.user.id, productId, variantId: variantId ?? null } },
    });

    let item;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.trackStock && newQty > product.stock) {
        return NextResponse.json({ success: false, error: `Only ${product.stock} in stock` }, { status: 400 });
      }
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId: session.user.id, productId, variantId: variantId ?? null, quantity },
      });
    }

    return NextResponse.json({ success: true, data: { item } });
  } catch (err) {
    console.error("[cart/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { itemId, clearAll } = await req.json();

    if (clearAll) {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    } else {
      await prisma.cartItem.deleteMany({ where: { id: itemId, userId: session.user.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cart/DELETE]", err);
    return NextResponse.json({ success: false, error: "Failed to remove item" }, { status: 500 });
  }
}
