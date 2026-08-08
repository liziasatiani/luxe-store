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
import { getTranslations } from "next-intl/server";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "default" | "gold"> = {
  PENDING:    "warning",
  PROCESSING: "default",
  CONFIRMED:  "success",
  SHIPPED:    "gold",
  DELIVERED:  "success",
  CANCELLED:  "error",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/account/orders");

  const [orders, t] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { take: 3 } },
      orderBy: { createdAt: "desc" },
    }),
    getTranslations("account"),
  ]);

  const o = serializeDecimal(orders);

  const tStatus = (s: string) => {
    const key = s.toLowerCase() as "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
    try { return t(`status.${key}`); } catch { return s; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white mb-1">{t("ordersPage.myOrders")}</h1>
        <p className="text-surface-500 text-sm">{t("ordersPage.ordersTotal", { count: orders.length })}</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <Package size={56} strokeWidth={1} className="text-black/10 dark:text-white/10 mb-8" />
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">{t("ordersPage.orderHistory")}</p>
          <h3 className="font-display text-2xl md:text-3xl uppercase tracking-[0.04em] text-black dark:text-white">{t("ordersPage.noOrdersTitle")}</h3>
          <p className="mt-4 text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed">{t("ordersPage.noOrdersDesc")}</p>
          <Link href="/" className="mt-8 inline-flex items-center h-11 px-8 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
            {t("ordersPage.browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {o.map((order) => {
            const variant = STATUS_VARIANT[order.status] ?? "default";
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
                    <Badge variant={variant}>{tStatus(order.status)}</Badge>
                    <ChevronRight size={16} className="text-surface-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-surface-500">{order.items.length !== 1 ? t("ordersPage.itemsPlural", { count: order.items.length }) : t("ordersPage.items", { count: order.items.length })}</p>
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
