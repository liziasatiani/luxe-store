import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Order Details", robots: { index: false, follow: false } };
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props { params: Promise<{ id: string }> }

const STATUS_COLOR: Record<string, string> = {
  DELIVERED:  "#4a9d6f",
  CANCELLED:  "var(--crimson)",
  REFUNDED:   "var(--crimson)",
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
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

  const t = await getTranslations("account");
  const o = serializeDecimal(order);

  const STEPS = [
    { key: "PENDING",   icon: Clock,       label: t("status.pending")   },
    { key: "CONFIRMED", icon: CheckCircle, label: t("status.confirmed") },
    { key: "SHIPPED",   icon: Truck,       label: t("status.shipped")   },
    { key: "DELIVERED", icon: Package,     label: t("status.delivered") },
  ];
  const statusOrder = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentIdx = statusOrder.indexOf(o.status);
  const statusColor = STATUS_COLOR[o.status] ?? "var(--gold)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, color: "var(--chalk)" }}>{t("orderDetail.orderNumber", { number: o.orderNumber })}</h1>
          <p style={{ fontSize: 12, color: "var(--chalk3)", marginTop: 4 }}>{t("orderDetail.placed", { date: formatDate(o.createdAt) })}</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: statusColor, padding: "4px 10px", border: `1px solid ${statusColor}`, flexShrink: 0, marginTop: 4 }}>
          {o.status}
        </span>
      </div>

      {!["CANCELLED", "REFUNDED"].includes(o.status) && (
        <div style={{ border: "1px solid var(--border)", padding: "28px 24px", background: "var(--s1)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ position: "absolute", top: 18, left: "6%", right: "6%", height: 1, background: "var(--border)" }} />
            <div
              style={{ position: "absolute", top: 18, left: "6%", height: 1, background: "var(--gold)", transition: "width 0.4s", width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 88)}%` }}
            />
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 36, height: 36, border: `1px solid ${done ? "var(--gold)" : "var(--border)"}`, background: done ? "var(--gold)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                    <step.icon size={16} style={{ color: done ? "#000" : "var(--chalk3)" }} />
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: done ? "var(--gold)" : "var(--chalk3)" }}>{step.label}</p>
                </div>
              );
            })}
          </div>
          {o.trackingNumber && (
            <p style={{ marginTop: 20, fontSize: 12, color: "var(--chalk2)", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              {t("orderDetail.tracking")}{" "}
              {o.trackingUrl
                ? <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontFamily: "monospace" }}>{o.trackingNumber}</a>
                : <span style={{ color: "var(--gold)", fontFamily: "monospace" }}>{o.trackingNumber}</span>
              }
            </p>
          )}
        </div>
      )}

      <div style={{ border: "1px solid var(--border)", background: "var(--s1)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)" }}>{t("orderDetail.items")}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {o.items.map((item, idx) => (
            <div key={item.id} style={{ display: "flex", gap: 16, padding: "16px 20px", borderBottom: idx < o.items.length - 1 ? "1px solid var(--border)" : "none" }}>
              <Link href={`/products/${item.product?.slug ?? ""}`} style={{ position: "relative", width: 60, height: 60, background: "var(--s2)", flexShrink: 0, overflow: "hidden", display: "block" }}>
                {item.product?.images?.[0]?.url && (
                  <Image src={item.product.images[0].url} alt={item.productName} fill className="object-cover" sizes="60px" />
                )}
              </Link>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--chalk)" }}>{item.productName}</p>
                {item.variantName && <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 2 }}>{item.variantName}</p>}
                <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 4 }}>{t("orderDetail.qty", { qty: item.quantity, price: formatPrice(item.unitPrice) })}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)", flexShrink: 0 }}>{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid var(--border)", padding: "20px", background: "var(--s1)" }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 16 }}>{t("orderDetail.paymentSummary")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("orderDetail.subtotal")}</span>
              <span style={{ fontSize: 12, color: "var(--chalk)" }}>{formatPrice(o.subtotal)}</span>
            </div>
            {o.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#4a9d6f" }}>{t("orderDetail.discount")}</span>
                <span style={{ fontSize: 12, color: "#4a9d6f" }}>−{formatPrice(o.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("orderDetail.shipping")}</span>
              <span style={{ fontSize: 12, color: "var(--chalk)" }}>{o.shippingAmount === 0 ? t("orderDetail.free") : formatPrice(o.shippingAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("orderDetail.tax")}</span>
              <span style={{ fontSize: 12, color: "var(--chalk)" }}>{formatPrice(o.taxAmount)}</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{t("orderDetail.total")}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--chalk)" }}>{formatPrice(o.total)}</span>
          </div>
        </div>

        {o.address && (
          <div style={{ border: "1px solid var(--border)", padding: "20px", background: "var(--s1)" }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 16 }}>{t("orderDetail.shippingAddress")}</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--chalk)" }}>{o.address.firstName} {o.address.lastName}</p>
            <p style={{ fontSize: 12, color: "var(--chalk2)", marginTop: 6 }}>{o.address.line1}</p>
            {o.address.line2 && <p style={{ fontSize: 12, color: "var(--chalk2)" }}>{o.address.line2}</p>}
            <p style={{ fontSize: 12, color: "var(--chalk2)" }}>{o.address.city}, {o.address.state} {o.address.postalCode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
