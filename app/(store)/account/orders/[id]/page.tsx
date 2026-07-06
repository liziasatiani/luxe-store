import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge, Divider } from "@/components/ui";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true } },
            },
          },
        },
      },
      address: true,
    },
  });

  if (!order) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = serializeDecimal(order) as any;

  const STEPS = [
    { key: "PENDING",   icon: Clock,       label: "Order Placed" },
    { key: "CONFIRMED", icon: CheckCircle, label: "Confirmed"    },
    { key: "SHIPPED",   icon: Truck,       label: "Shipped"      },
    { key: "DELIVERED", icon: Package,     label: "Delivered"    },
  ];
  const statusOrder = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentIdx = statusOrder.indexOf(o.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white">Order #{o.orderNumber}</h1>
          <p className="text-surface-500 text-sm mt-1">Placed {formatDate(o.createdAt)}</p>
        </div>
        <Badge variant={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "error" : "gold"}>
          {o.status}
        </Badge>
      </div>

      {!["CANCELLED", "REFUNDED"].includes(o.status) && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-surface-100 dark:bg-surface-800" />
            <div
              className="absolute top-5 left-10 h-0.5 bg-brand-500 transition-all"
              style={{ width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 80)}%` }}
            />
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-brand-500 text-white" : "bg-surface-100 dark:bg-surface-800 text-surface-400"}`}>
                    <step.icon size={18} />
                  </div>
                  <p className={`text-xs font-medium ${done ? "text-brand-500" : "text-surface-400"}`}>{step.label}</p>
                </div>
              );
            })}
          </div>
          {o.trackingNumber && (
            <p className="mt-4 text-sm text-surface-500">
              Tracking: <a href={o.trackingUrl ?? "#"} className="text-brand-500 font-mono">{o.trackingNumber}</a>
            </p>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-4">
        <h2 className="font-semibold text-surface-900 dark:text-white">Items</h2>
        {o.items.map((item: any) => (
          <div key={item.id} className="flex gap-4">
            <Link
              href={`/products/${item.product?.slug ?? ""}`}
              className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-800 shrink-0"
            >
              {item.product?.images?.[0]?.url && (
                <Image src={item.product.images[0].url} alt={item.productName} fill className="object-cover" sizes="64px" />
              )}
            </Link>
            <div className="flex-1">
              <p className="font-medium text-sm text-surface-900 dark:text-white">{item.productName}</p>
              {item.variantName && <p className="text-xs text-surface-400">{item.variantName}</p>}
              <p className="text-xs text-surface-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
            </div>
            <p className="font-semibold text-sm shrink-0">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-3">
          <h2 className="font-semibold text-surface-900 dark:text-white">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span>{formatPrice(o.subtotal)}</span></div>
            {o.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(o.discountAmount)}</span></div>}
            <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span>{o.shippingAmount === 0 ? "FREE" : formatPrice(o.shippingAmount)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Tax</span><span>{formatPrice(o.taxAmount)}</span></div>
          </div>
          <Divider />
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(o.total)}</span></div>
        </div>

        {o.address && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-2">
            <h2 className="font-semibold text-surface-900 dark:text-white">Shipping Address</h2>
            <p className="text-sm text-surface-600 dark:text-surface-400">{o.address.firstName} {o.address.lastName}</p>
            <p className="text-sm text-surface-500">{o.address.line1}</p>
            {o.address.line2 && <p className="text-sm text-surface-500">{o.address.line2}</p>}
            <p className="text-sm text-surface-500">{o.address.city}, {o.address.state} {o.address.postalCode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
