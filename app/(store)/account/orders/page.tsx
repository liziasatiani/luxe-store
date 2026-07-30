import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";

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
        <div className="text-center py-16 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700">
          <Package size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <p className="text-surface-500">No orders yet. Start shopping!</p>
          <Link href="/" className="inline-block mt-4 text-brand-500 hover:text-brand-600 text-sm font-medium">
            Browse Products →
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
                  <p className="font-semibold text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
