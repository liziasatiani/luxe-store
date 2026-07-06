import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    // Explicitly check for userId to satisfy TypeScript
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json() as {
      items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
    };

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      
      const product = await prisma.product.findUnique({ 
        where: { id: item.productId }, 
        select: { id: true } 
      });
      
      if (!product) continue;

      // Ensure variantId is treated as a string (or empty string) if your schema requires it
      const variantId = item.variantId || "";

      await prisma.cartItem.upsert({
        where: {
          userId_productId_variantId: { 
            userId: userId, 
            productId: item.productId, 
            variantId: variantId 
          },
        },
        update: { quantity: item.quantity },
        create: { 
          userId: userId, 
          productId: item.productId, 
          variantId: variantId, 
          quantity: item.quantity 
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cart/sync]", err);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}