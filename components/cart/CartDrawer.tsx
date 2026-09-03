"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store";
import { getProductImageUrl, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/Button";
import type { ProductCard } from "@/types";

const SWIPE_CLOSE_THRESHOLD = 72;

const S: Record<string, React.CSSProperties> = {
  drawer:    { background: "var(--s1)" },
  border:    { borderColor: "var(--border)" },
  chalk:     { color: "var(--chalk)" },
  chalk2:    { color: "var(--chalk2)" },
  chalk3:    { color: "var(--chalk3)" },
  s2bg:      { background: "var(--s2)" },
  borderg:   { borderColor: "var(--borderg)" },
};

export function CartDrawer() {
  const t = useTranslations("cart");
  const { format } = useCurrency();
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem, discount, shipping, total, coupon, setCoupon } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const touchStartX = useRef(0);
  const subtotalValue = items.reduce((s, i) => s + Number(i.variant?.price ?? i.product.price) * i.quantity, 0);
  const amountToFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalValue);
  const freeShipProgress = Math.min(100, (subtotalValue / FREE_SHIPPING_THRESHOLD) * 100);
  const [suggestions, setSuggestions] = useState<ProductCard[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const couponRef = useRef<HTMLInputElement>(null);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal: items.reduce((s, i) => s + Number(i.variant?.price ?? i.product.price) * i.quantity, 0) }),
      });
      const data = await res.json();
      if (!res.ok || !data.data?.coupon) {
        setCouponError(data.error ?? t("invalidCoupon"));
      } else {
        setCoupon(data.data.coupon);
        setCouponInput("");
      }
    } catch {
      setCouponError(t("invalidCoupon"));
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || items.length === 0) { setSuggestions([]); return; }
    const categorySlug = items[0]?.product?.category?.slug ?? "";
    const inCart = new Set(items.map(i => i.productId));
    const url = `/api/products?limit=8&category=${categorySlug}&sort=best-selling`;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        const all: ProductCard[] = d.data?.products ?? [];
        setSuggestions(all.filter(p => !inCart.has(p.id)).slice(0, 3));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [isOpen, items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          <FocusTrap active={isOpen} focusTrapOptions={{ escapeDeactivates: false, allowOutsideClick: true, initialFocus: false }}>
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("shoppingCart")}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => { if (e.changedTouches[0].clientX - touchStartX.current > SWIPE_CLOSE_THRESHOLD) closeCart(); }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-[210] flex flex-col shadow-2xl"
            style={S.drawer}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} style={S.chalk2} />
                <span className="font-semibold" style={S.chalk}>
                  {t("title")}
                  {count > 0 && (
                    <span className="ml-2 text-sm font-normal" style={S.chalk3}>({count} {count === 1 ? t("item") : t("items")})</span>
                  )}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={S.chalk2}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--chalk)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk2)")}
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping bar */}
            {items.length > 0 && (
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                {amountToFreeShip === 0 ? (
                  <p className="text-[10px] tracking-[0.12em] uppercase font-medium text-center text-green-500">
                    ✓ {t("freeShippingUnlocked")}
                  </p>
                ) : (
                  <p className="text-[10px] tracking-[0.08em] uppercase mb-2" style={S.chalk3}>
                    {t("addMoreForFreeShip", { amount: format(amountToFreeShip) })}
                  </p>
                )}
                <div className="h-px overflow-hidden" style={{ background: "var(--border)" }}>
                  <motion.div
                    className="h-full"
                    style={{ background: "var(--chalk)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShipProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <ShoppingBag size={48} style={{ color: "var(--border)" }} />
                  <p className="font-medium" style={S.chalk2}>{t("empty")}</p>
                  <p className="text-sm" style={S.chalk3}>{t("emptyDesc")}</p>
                  <Button variant="gold" size="sm" onClick={closeCart} asChild>
                    <Link href="/beauty">{t("continueShopping")}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="px-5 py-2" style={{ borderBottom: "1px solid transparent" }}>
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const img = getProductImageUrl(item.product.images, 200, 75);
                      const price = Number(item.variant?.price ?? item.product.price);
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="py-4 flex gap-3"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="relative w-16 h-16 overflow-hidden shrink-0" style={{ background: "var(--s2)" }}>
                            <Image src={img} alt={item.product.name} fill className="object-cover" sizes="64px" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={closeCart}
                              className="text-sm font-medium line-clamp-2 leading-snug transition-colors"
                              style={{ color: "var(--chalk)", textDecoration: "none" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk)")}
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <p className="text-xs mt-0.5" style={S.chalk3}>{item.variant.name}: {item.variant.value}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-0.5 overflow-hidden" style={{ border: "1px solid var(--borderg)" }}>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-sm transition-colors"
                                  style={{ color: "var(--chalk2)" }}
                                  onMouseEnter={e => (e.currentTarget.style.background = "var(--s2)")}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >−</button>
                                <span className="w-7 text-center text-xs font-medium" style={S.chalk}>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-sm transition-colors"
                                  style={{ color: "var(--chalk2)" }}
                                  onMouseEnter={e => (e.currentTarget.style.background = "var(--s2)")}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >+</button>
                              </div>
                              <span className="text-sm font-semibold" style={S.chalk}>
                                {format(price * item.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="self-start mt-0.5 transition-colors"
                            style={{ color: "var(--chalk3)", background: "none", border: "none", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--crimson)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk3)")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Suggestions */}
            {items.length > 0 && suggestions.length > 0 && (
              <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-[9px] tracking-[0.16em] uppercase mb-3" style={S.chalk3}>{t("youMightAlsoLike")}</p>
                <div className="space-y-3">
                  {suggestions.map((p) => {
                    const img = getProductImageUrl(p.images, 200, 75);
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <Link href={`/products/${p.slug}`} onClick={closeCart} className="relative w-12 h-12 shrink-0 overflow-hidden" style={{ background: "var(--s2)" }}>
                          <Image src={img} alt={p.name} fill className="object-cover" sizes="48px" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1" style={S.chalk}>{p.name}</p>
                          <p className="text-xs" style={S.chalk3}>{format(Number(p.price))}</p>
                        </div>
                        <button
                          onClick={() => { addItem(p); }}
                          disabled={p.stockStatus === "OUT_OF_STOCK"}
                          className="shrink-0 h-7 px-3 text-[9px] tracking-[0.1em] uppercase transition-colors disabled:opacity-40"
                          style={{ border: "1px solid var(--borderg)", color: "var(--chalk)", background: "transparent" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--chalk)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bg)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--chalk)"; }}
                        >
                          {t("add")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer — totals + checkout */}
            {items.length > 0 && (
              <div className="px-5 py-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                {coupon ? (
                  <div className="flex items-center justify-between text-sm px-3 py-2" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <span className="flex items-center gap-1.5 text-green-500">
                      <Check size={12} />
                      <span className="font-mono font-bold">{coupon.code}</span>
                      <span>−{format(discount())}</span>
                    </span>
                    <button onClick={() => setCoupon(null)} className="text-green-500 hover:text-red-500 transition-colors" style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={S.chalk3} />
                        <input
                          ref={couponRef}
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                          aria-label={t("couponCode")}
                          placeholder={t("coupon")}
                          className="w-full pl-7 pr-2 h-8 text-[11px] tracking-[0.06em] uppercase bg-transparent focus:outline-none transition-colors"
                          style={{ border: "1px solid var(--borderg)", color: "var(--chalk)" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="h-8 px-3 text-[9px] tracking-[0.1em] uppercase transition-colors disabled:opacity-40"
                        style={{ border: "1px solid var(--borderg)", color: "var(--chalk)", background: "transparent" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--chalk)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bg)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--chalk)"; }}
                      >
                        {couponLoading ? "…" : t("apply")}
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>{t("discount")}</span>
                    <span>−{format(discount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm" style={S.chalk2}>
                  <span>{t("shipping")}</span>
                  <span>{shipping() === 0 ? <span className="text-green-500 font-medium">{t("free")}</span> : format(shipping())}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1" style={{ borderTop: "1px solid var(--border)", ...S.chalk }}>
                  <span>{t("total")}</span>
                  <span>{format(total())}</span>
                </div>
                <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight size={16} />} asChild>
                  <Link href="/checkout" onClick={closeCart}>{t("checkout")}</Link>
                </Button>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm transition-colors"
                  style={{ color: "var(--chalk2)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk2)")}
                >
                  {t("viewFullCart")}
                </Link>
              </div>
            )}
          </motion.div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );
}
