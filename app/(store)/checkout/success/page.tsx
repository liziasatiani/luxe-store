import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowRight, CheckCircle, UserPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, getProductImageUrl } from "@/lib/utils";
import { auth } from "@/lib/auth";

interface OrderItem { id: string; productName: string; quantity: number; totalPrice: number }
interface SerializedOrder { id: string; orderNumber: string; total: number; items: OrderItem[] }
interface Props { searchParams: Promise<{ orderId?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const session = await auth();
  const t = await getTranslations("orderSuccess");
  const tProduct = await getTranslations("product");
  let order: SerializedOrder | null = null;

  if (orderId) {
    const userId = session?.user?.id;
    const found = userId
      ? await prisma.order.findFirst({ where: { id: orderId, userId }, include: { items: true } })
      : null;
    if (found) order = serializeDecimal(found) as SerializedOrder;
  }

  const upsellProducts = await prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: { select: { url: true, isPrimary: true } }, brand: { select: { name: true } } },
    orderBy: { ratingAvg: "desc" },
    take: 4,
  }).then(rows => rows.map(r => serializeDecimal(r)));

  return (
    <div style={{ paddingTop: 80, paddingBottom: 96 }}>
      <div className="wrap" style={{ maxWidth: 560, textAlign: "center" }}>
        {/* Success icon */}
        <div style={{ width: 64, height: 64, border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <CheckCircle size={28} style={{ color: "var(--gold)" }} />
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, color: "var(--chalk)", marginBottom: 16 }}>{t("title")}</h1>
        {order && (
          <p style={{ fontSize: 13, color: "var(--chalk2)", marginBottom: 6 }}>
            Order <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--chalk)" }}>#{order.orderNumber}</span>
          </p>
        )}
        <p style={{ fontSize: 13, color: "var(--chalk3)", marginBottom: 40 }}>{t("subtitle")}</p>

        {order && (
          <div style={{ textAlign: "left", border: "1px solid var(--border)", padding: 24, marginBottom: 32, background: "var(--s1)" }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 16 }}>{t("orderSummary")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--chalk2)" }}>{item.productName} ×{item.quantity}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--chalk)" }}>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{t("total")}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--chalk)" }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {order && (
            <Link
              href={`/account/orders/${order.id}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, border: "1px solid var(--borderg)", color: "var(--chalk)", textDecoration: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", transition: "border-color 0.2s" }}
            >
              <Package size={15} /> {t("trackOrder")}
            </Link>
          )}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, background: "var(--gold)", color: "#000", textDecoration: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            {t("continueShopping")} <ArrowRight size={14} />
          </Link>
        </div>

        {!session && order && (
          <div style={{ marginTop: 40, border: "1px solid var(--border)", padding: 24, textAlign: "left", background: "var(--s1)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 36, height: 36, border: "1px solid var(--borderg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UserPlus size={15} style={{ color: "var(--chalk2)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)", marginBottom: 6 }}>{t("saveHistory")}</h3>
                <p style={{ fontSize: 12, color: "var(--chalk2)", lineHeight: 1.6, marginBottom: 16 }}>{t("saveHistoryDesc")}</p>
                <Link
                  href={`/register?orderId=${order.id}`}
                  style={{ display: "inline-block", padding: "9px 18px", border: "1px solid var(--borderg)", color: "var(--chalk)", textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  {t("createAccount")}
                </Link>
              </div>
            </div>
          </div>
        )}

        {upsellProducts.length > 0 && (
          <div style={{ marginTop: 64, textAlign: "left", borderTop: "1px solid var(--border)", paddingTop: 48 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>{t("completeCollection")}</p>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--chalk)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{tProduct("youMayAlsoLike")}</h2>
              </div>
              <Link href="/best" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk)", textDecoration: "none" }}>
                {t("viewAll")} <ArrowRight size={11} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="sm-grid-4">
              <style>{`@media(min-width:640px){.sm-grid-4{grid-template-columns:repeat(4,1fr);}}`}</style>
              {upsellProducts.map((p) => {
                const img = getProductImageUrl((p as { images?: { url: string; isPrimary?: boolean }[] }).images ?? []);
                const price = formatPrice(Number((p as { price: number }).price));
                return (
                  <Link key={(p as { id: string }).id} href={`/products/${(p as { slug: string }).slug}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ position: "relative", aspectRatio: "1", background: "var(--s2)", overflow: "hidden", marginBottom: 12 }}>
                      {img && <Image src={img} alt={(p as { name: string }).name} fill className="object-cover" sizes="200px" />}
                    </div>
                    <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk3)", marginBottom: 4 }}>{(p as { brand?: { name: string } }).brand?.name}</p>
                    <p style={{ fontSize: 12, color: "var(--chalk)", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{(p as { name: string }).name}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--chalk)" }}>{price}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
