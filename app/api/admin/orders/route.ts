import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { requireAdmin } from "@/lib/adminAuth";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const orderUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().max(200).optional(),
  trackingUrl: z.string().url("Invalid tracking URL").max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20") || 20));
    const status = req.nextUrl.searchParams.get("status") ?? "";
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const validStatus = ORDER_STATUSES.includes(status as typeof ORDER_STATUSES[number]) ? status as typeof ORDER_STATUSES[number] : undefined;
    const where = {
      ...(validStatus && { status: validStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { guestEmail: { contains: search, mode: "insensitive" as const } },
          { guestName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        select: {
          id: true, orderNumber: true, status: true, total: true, createdAt: true,
          guestName: true, guestEmail: true,
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
  } catch {
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

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });

    if (status === "SHIPPED") {
      const recipientEmail = (order as { user?: { email: string } | null }).user?.email ?? order.guestEmail;
      const recipientName = (order as { user?: { name: string | null } | null }).user?.name ?? order.guestName ?? "Customer";
      if (recipientEmail) {
        const { sendShippingNotification } = await import("@/lib/email");
        sendShippingNotification({
          recipientName,
          recipientEmail,
          orderNumber: order.orderNumber,
          orderId: order.id,
          trackingNumber: trackingNumber ?? null,
          trackingUrl: trackingUrl ?? null,
        }).catch((err) => console.error("[admin/orders] shipping email failed", err));
      }
    }

    const NOTIFY_STATUSES = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
    if (order.userId && NOTIFY_STATUSES.includes(status as typeof NOTIFY_STATUSES[number])) {
      const notifType = status === "SHIPPED" ? "ORDER_SHIPPED" : status === "DELIVERED" ? "ORDER_DELIVERED" : status === "CANCELLED" ? "ORDER_CANCELLED" : "ORDER_PLACED";
      const TITLES: Record<string, string> = { CONFIRMED: "Order Confirmed", SHIPPED: "Order Shipped", DELIVERED: "Order Delivered", CANCELLED: "Order Cancelled" };
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: notifType,
          title: TITLES[status] ?? `Order ${status}`,
          message: `Your order #${order.orderNumber} has been ${status.toLowerCase()}.`,
          link: `/account/orders/${order.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: { order: serializeDecimal(order) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
