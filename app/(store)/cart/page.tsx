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
        <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>

          {/* Items */}
          <div>
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
                    style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: "1px solid var(--border)" }}
                  >
                    <Link href={`/products/${item.product.slug}`} style={{ position: "relative", width: 100, height: 120, flexShrink: 0, overflow: "hidden", background: "var(--s1)", display: "block" }}>
                      <Image src={img} alt={item.product.name} fill className="object-cover" sizes="100px" />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          {item.product.brand && <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 5 }}>{item.product.brand.name}</p>}
                          <Link href={`/products/${item.product.slug}`} style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--chalk)", textDecoration: "none", display: "block" }}>
                            {item.product.name}
                          </Link>
                          {item.variant && <p style={{ fontSize: 12, color: "var(--chalk2)", marginTop: 4 }}>{item.variant.name}: {item.variant.value}</p>}
                        </div>
                        <button onClick={() => { removeItem(item.id); toast.success("Removed"); }} style={{ color: "var(--chalk2)", background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                        <div style={{ display: "flex", border: "1px solid var(--border)", alignItems: "center" }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--chalk2)", cursor: "pointer", fontSize: 16 }}>−</button>
                          <span style={{ width: 36, textAlign: "center", fontSize: 13, color: "var(--chalk)" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--chalk2)", cursor: "pointer", fontSize: 16 }}>+</button>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 500, color: "var(--chalk)" }}>{format(price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div style={{ paddingTop: 28 }}>
              <Link href="/" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--borderg)", paddingBottom: 3 }}>
                ← {t("continueShopping")}
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ border: "1px solid var(--border)", padding: 32, position: "sticky", top: "calc(var(--nav-h) + 24px)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 28 }}>{t("secureCheckout")}</p>

            {/* Coupon */}
            {coupon ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.06)", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4ade80" }}>
                  <Tag size={12} />
                  <span style={{ fontWeight: 600, letterSpacing: "0.05em" }}>{coupon.code}</span>
                </div>
                <button onClick={() => { setCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#4ade80", display: "flex" }}>
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <input
                  placeholder={t("coupon")}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  style={{ flex: 1, padding: "10px 14px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 12, outline: "none", letterSpacing: "0.06em" }}
                />
                <button onClick={applyCoupon} disabled={couponLoading}
                  style={{ padding: "10px 16px", border: "1px solid var(--borderg)", color: "var(--gold)", background: "transparent", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", opacity: couponLoading ? 0.5 : 1 }}>
                  {t("apply")}
                </button>
              </div>
            )}

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: t("subtotal"), value: format(subtotal()) },
                ...(discount() > 0 ? [{ label: t("discount"), value: `−${format(discount())}`, green: true }] : []),
                { label: t("shipping"), value: shipping() === 0 ? t("free") : format(shipping()), green: shipping() === 0 },
                { label: t("tax"), value: format(tax()) },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--chalk2)" }}>{row.label}</span>
                  <span style={{ color: (row as { green?: boolean }).green ? "#4ade80" : "var(--chalk)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--chalk)" }}>{t("total")}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--chalk)" }}>{format(total())}</span>
            </div>

            <Link href="/checkout"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px 24px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", transition: "0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              {t("checkout")} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile stack override */}
      <style>{`
        @media (max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
