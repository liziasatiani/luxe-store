import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { ReorderButton } from "@/components/account/ReorderButton";

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" | "gold" }> = {
  PENDING:    { label: "Pending",    variant: "warning" },
  PROCESSING: { label: "Processing", variant: "default" },
  CONFIRMED:  { label: "Confirmed",  variant: "success" },
  SHIPPED:    { label: "Shipped",    variant: "gold"    },
  DELIVERED:  { label: "Delivered",  variant: "success" },
  CANCELLED:  { label: "Cancelled",  variant: "error"   },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { take: 3 } },
    orderBy: { createdAt: "desc" },
  });

  const o = serializeDecimal(orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white mb-1">My Orders</h1>
        <p className="text-surface-500 text-sm">{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <Package size={56} strokeWidth={1} className="text-black/10 dark:text-white/10 mb-8" />
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">Order history</p>
          <h3 className="font-display text-2xl md:text-3xl uppercase tracking-[0.04em] text-black dark:text-white">No orders yet</h3>
          <p className="mt-4 text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed">Your completed orders will appear here. Browse our collection to get started.</p>
          <Link href="/" className="mt-8 inline-flex items-center h-11 px-8 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {o.map((order: any) => {
            const s = STATUS_BADGE[order.status] ?? { label: order.status, variant: "default" as const };
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-mono text-sm font-bold text-surface-900 dark:text-white">#{order.orderNumber}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    <ChevronRight size={16} className="text-surface-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-surface-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
                    <ReorderButton orderId={order.id} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
