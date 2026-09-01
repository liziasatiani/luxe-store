"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Tag, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store";
import { getProductImageUrl } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function CartPage() {
  const t = useTranslations("cart");
  const tp = useTranslations("product");
  const { items, removeItem, updateQuantity, coupon, setCoupon, subtotal, discount, shipping, tax, total, itemCount } = useCartStore();
  const { format } = useCurrency();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: subtotal() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupon(data.data.coupon);
      toast.success(t("couponApplied"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("invalidCoupon"));
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 20 }}>{t("title")}</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,3vw,44px)", fontWeight: 700, color: "var(--chalk)", marginBottom: 12 }}>{t("empty")}</h2>
          <p style={{ fontSize: 13, color: "var(--chalk2)", marginBottom: 36 }}>{t("emptyDesc")}</p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid var(--gold)", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", transition: "0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}>
            {t("continueShopping")} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">{itemCount()} {itemCount() === 1 ? t("item") : t("items")}</h1>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
        <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

          {/* Items — rounded glass cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const img = getProductImageUrl(item.product.images);
                const price = Number(item.variant?.price ?? item.product.price);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-card"
                    style={{ display: "flex", gap: 20, padding: "20px 18px" }}
                  >
                    <Link href={`/products/${item.product.slug}`} style={{ position: "relative", width: 88, height: 108, flexShrink: 0, overflow: "hidden", background: "var(--s1)", display: "block", borderRadius: 10 }}>
                      <Image src={img} alt={item.product.name} fill className="object-cover" sizes="88px" />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          {item.product.brand && <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 4 }}>{item.product.brand.name}</p>}
                          <Link href={`/products/${item.product.slug}`} style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--chalk)", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.product.name}
                          </Link>
                          {item.variant && <p style={{ fontSize: 11, color: "var(--chalk2)", marginTop: 3 }}>{item.variant.name}: {item.variant.value}</p>}
                        </div>
                        <button onClick={() => { removeItem(item.id); toast.success(tp("removed")); }} style={{ color: "var(--chalk3)", background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                        <div style={{ display: "flex", border: "1px solid var(--border)", alignItems: "center", borderRadius: 8 }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--chalk2)", cursor: "pointer", fontSize: 15 }}>−</button>
                          <span style={{ width: 32, textAlign: "center", fontSize: 12, color: "var(--chalk)" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--chalk2)", cursor: "pointer", fontSize: 15 }}>+</button>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 500, color: "var(--chalk)" }}>{format(price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Coupon — below items */}
            <div className="glass-card" style={{ padding: "16px 18px" }}>
              {coupon ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4ade80" }}>
                    <Tag size={12} />
                    <span style={{ fontWeight: 600, letterSpacing: "0.05em" }}>{coupon.code}</span>
                  </div>
                  <button onClick={() => { setCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#4ade80", display: "flex" }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder={t("coupon")}
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    style={{ flex: 1, padding: "9px 14px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 12, outline: "none", letterSpacing: "0.06em", borderRadius: 8 }}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading}
                    style={{ padding: "9px 16px", border: "1px solid var(--borderg)", color: "var(--gold)", background: "transparent", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", opacity: couponLoading ? 0.5 : 1, borderRadius: 8 }}>
                    {t("apply")}
                  </button>
                </div>
              )}
            </div>

            <div style={{ paddingTop: 8 }}>
              <Link href="/" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--borderg)", paddingBottom: 3 }}>
                ← {t("continueShopping")}
              </Link>
            </div>
          </div>

          {/* Your Order — totals summary */}
          <div className="glass-card" style={{ padding: 32, position: "sticky", top: "calc(var(--nav-h) + 24px)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, fontStyle: "italic", color: "var(--chalk)", marginBottom: 6 }}>{t("yourOrder")}</p>
            <p style={{ fontSize: 11, color: "var(--chalk2)", marginBottom: 28 }}>{itemCount()} {itemCount() === 1 ? t("item") : t("items")}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {[
                { label: t("subtotal"), value: format(subtotal()) },
                ...(discount() > 0 ? [{ label: t("discount"), value: `−${format(discount())}`, gold: true }] : []),
                { label: t("shipping"), value: shipping() === 0 ? t("free") : format(shipping()), green: shipping() === 0 },
                { label: t("tax"), value: format(tax()) },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--chalk2)" }}>{row.label}</span>
                  <span style={{ color: (row as { gold?: boolean; green?: boolean }).gold ? "var(--gold)" : (row as { green?: boolean }).green ? "#4ade80" : "var(--chalk)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: "var(--chalk)" }}>{t("total")}</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--gold)" }}>{format(total())}</span>
            </div>

            <Link href="/checkout"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "15px 24px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", transition: "0.2s", borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              {t("checkout")} <ArrowRight size={14} />
            </Link>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 18 }}>
              {["🔒 " + t("secure"), "↩ " + t("freeReturns"), "🚚 48h"].map(badge => (
                <span key={badge} style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk3)" }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
