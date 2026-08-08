import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { ReorderButton } from "@/components/account/ReorderButton";
import { getTranslations } from "next-intl/server";

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "#b8962e",
  PROCESSING: "var(--chalk3)",
  CONFIRMED:  "#4a9d6f",
  SHIPPED:    "var(--gold)",
  DELIVERED:  "#4a9d6f",
  CANCELLED:  "var(--crimson)",
  REFUNDED:   "var(--crimson)",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, color: "var(--chalk)", marginBottom: 4 }}>{t("ordersPage.myOrders")}</h1>
        <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("ordersPage.ordersTotal", { count: orders.length })}</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
          <Package size={48} strokeWidth={1} style={{ color: "var(--border)", marginBottom: 24 }} />
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--chalk3)", marginBottom: 12 }}>{t("ordersPage.orderHistory")}</p>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--chalk)", letterSpacing: "0.04em" }}>{t("ordersPage.noOrdersTitle")}</h3>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--chalk3)", maxWidth: 280, lineHeight: 1.6 }}>{t("ordersPage.noOrdersDesc")}</p>
          <Link
            href="/"
            style={{ marginTop: 28, display: "inline-flex", alignItems: "center", height: 44, padding: "0 32px", background: "var(--gold)", color: "#000", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}
          >
            {t("ordersPage.browseProducts")}
          </Link>
        </div>
      ) : (
        <>
        <style>{`.order-row-link:hover { background: var(--s2) !important; }`}</style>
        <div style={{ border: "1px solid var(--border)" }}>
          {o.map((order, idx) => {
            const statusColor = STATUS_COLOR[order.status] ?? "var(--chalk3)";
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="order-row-link"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  padding: "16px 20px", textDecoration: "none", background: "var(--s1)",
                  borderBottom: idx < o.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--mono, monospace)", fontSize: 12, fontWeight: 700, color: "var(--chalk)", letterSpacing: "0.04em" }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 2 }}>{formatDate(order.createdAt)}</p>
                </div>
                <p style={{ fontSize: 11, color: "var(--chalk2)" }}>{order.items.length !== 1 ? t("ordersPage.itemsPlural", { count: order.items.length }) : t("ordersPage.items", { count: order.items.length })}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: statusColor, padding: "3px 8px", border: `1px solid ${statusColor}`, opacity: 0.9 }}>
                    {tStatus(order.status)}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{formatPrice(order.total)}</p>
                  <ReorderButton orderId={order.id} />
                  <ChevronRight size={14} style={{ color: "var(--chalk3)" }} />
                </div>
              </Link>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
