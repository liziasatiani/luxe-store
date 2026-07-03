import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const orderUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().max(200).optional(),
  trackingUrl: z.string().url("Invalid tracking URL").max(500).optional(),
});

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["ADMIN", "SUPER_ADMIN"].includes(role ?? "") ? session : null;
}

export async function GET(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
    const status = req.nextUrl.searchParams.get("status") ?? "";
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const validStatus = ORDER_STATUSES.includes(status as typeof ORDER_STATUSES[number]) ? status as typeof ORDER_STATUSES[number] : undefined;
    const where = {
      ...(validStatus && { status: validStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { productName: true, quantity: true, totalPrice: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { orders: serializeDecimal(orders), total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    const { id, status, trackingNumber, trackingUrl } = parsed.data;

    const updateData: Record<string, unknown> = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (status === "SHIPPED") updateData.shippedAt = new Date();
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    const order = await prisma.order.update({ where: { id }, data: updateData });

    // Notification — only for registered users (guest orders have no userId)
    if (order.userId) {
      const notifType = status === "SHIPPED" ? "ORDER_SHIPPED" : status === "DELIVERED" ? "ORDER_DELIVERED" : "ORDER_PLACED";
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: notifType,
          title: `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: `Your order #${order.orderNumber} status updated to ${status}.`,
          link: `/account/orders/${order.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: { order: serializeDecimal(order) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
