import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { requireAdmin } from "@/lib/adminAuth";
import { sendShippingNotification, sendOrderStatusEmail } from "@/lib/email";

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    await prisma.couponUsage.updateMany({ where: { orderId: id }, data: { orderId: null } });
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/orders DELETE]", err);
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 });
  }
}

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

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        select: {
          id: true, orderNumber: true, status: true, paymentStatus: true, createdAt: true,
          subtotal: true, discountAmount: true, shippingAmount: true, taxAmount: true, total: true,
          couponCode: true, notes: true, trackingNumber: true, trackingUrl: true, shippedAt: true,
          guestName: true, guestEmail: true, guestPhone: true,
          shippingName: true, shippingLine1: true, shippingLine2: true,
          shippingCity: true, shippingState: true, shippingPostal: true,
          shippingCountry: true, shippingPhone: true,
          user: { select: { name: true, email: true } },
          items: { select: { productName: true, productImage: true, productSku: true, quantity: true, unitPrice: true, totalPrice: true, variantName: true } },
        },
      });
      if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: { order: serializeDecimal(order) } });
    }

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

    const recipientEmail = order.user?.email ?? order.guestEmail;
    const recipientName = order.user?.name ?? order.guestName ?? "Customer";

    const NOTIFY_STATUSES = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
    const TITLES: Record<string, string> = { CONFIRMED: "Order Confirmed", SHIPPED: "Order Shipped", DELIVERED: "Order Delivered", CANCELLED: "Order Cancelled" };
    const NOTIF_TYPES: Record<string, "ORDER_PLACED" | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "ORDER_CANCELLED"> = {
      CONFIRMED: "ORDER_PLACED", SHIPPED: "ORDER_SHIPPED", DELIVERED: "ORDER_DELIVERED", CANCELLED: "ORDER_CANCELLED",
    };

    Promise.all([
      recipientEmail && status === "SHIPPED"
        ? sendShippingNotification({ recipientName, recipientEmail, orderNumber: order.orderNumber, orderId: order.id, trackingNumber: trackingNumber ?? null, trackingUrl: trackingUrl ?? null })
        : recipientEmail && (status === "CONFIRMED" || status === "DELIVERED" || status === "CANCELLED")
        ? sendOrderStatusEmail({ recipientName, recipientEmail, orderNumber: order.orderNumber, orderId: order.id, status: status as "CONFIRMED" | "DELIVERED" | "CANCELLED" })
        : Promise.resolve(),
      order.userId && NOTIFY_STATUSES.includes(status as typeof NOTIFY_STATUSES[number])
        ? prisma.notification.create({ data: { userId: order.userId, type: NOTIF_TYPES[status] ?? "ORDER_PLACED", title: TITLES[status] ?? `Order ${status}`, message: `Your order #${order.orderNumber} has been ${status.toLowerCase()}.`, link: `/account/orders/${order.id}` } })
        : Promise.resolve(),
    ]).catch((err) => console.error("[admin/orders PUT] post-update side effects failed:", err));

    return NextResponse.json({ success: true, data: { order: serializeDecimal(order) } });
  } catch (err) {
    console.error("[admin/orders PUT]", err);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
