import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to resolve the Promise for Next.js 15+
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: id, 
        // Admins can see all orders; users only their own
        ...((session.user as { role?: string }).role !== "ADMIN" &&
          (session.user as { role?: string }).role !== "SUPER_ADMIN"
          ? { userId: session.user.id }
          : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true, slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        address: true,
        coupon: { select: { code: true, type: true, value: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { order: serializeDecimal(order) } 
    });
  } catch (err) {
    console.error("[Order GET Error]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}