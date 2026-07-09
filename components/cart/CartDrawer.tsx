"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store";
import { getProductImageUrl } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/Button";
import type { ProductCard } from "@/types";

export function CartDrawer() {
  const t = useTranslations("cart");
  const { format } = useCurrency();
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem, discount, shipping, total, coupon, setCoupon } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const touchStartX = useRef(0);
  const FREE_THRESHOLD = 75;
  const subtotalValue = items.reduce((s, i) => s + Number(i.variant?.price ?? i.product.price) * i.quantity, 0);
  const amountToFreeShip = Math.max(0, FREE_THRESHOLD - subtotalValue);
  const freeShipProgress = Math.min(100, (subtotalValue / FREE_THRESHOLD) * 100);
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
      setCouponError("Something went wrong");
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || items.length === 0) { setSuggestions([]); return; }
    const categorySlug = items[0]?.product?.category?.slug ?? "";
    const inCart = new Set(items.map(i => i.productId));
    const url = `/api/products?limit=8&category=${categorySlug}&sort=best-selling`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const all: ProductCard[] = d.data?.products ?? [];
        setSuggestions(all.filter(p => !inCart.has(p.id)).slice(0, 3));
      })
      .catch(() => {});
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
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
            aria-label="Shopping cart"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => { if (e.changedTouches[0].clientX - touchStartX.current > 72) closeCart(); }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-white dark:bg-surface-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-surface-700 dark:text-surface-300" />
                <span className="font-semibold text-surface-900 dark:text-white">
                  {t("title")}
                  {count > 0 && (
                    <span className="ml-2 text-sm font-normal text-surface-400">({count} {count === 1 ? t("item") : t("items")})</span>
                  )}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && (
              <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800">
                {amountToFreeShip === 0 ? (
                  <p className="text-[10px] tracking-[0.12em] uppercase text-green-600 dark:text-green-400 font-medium text-center">
                    ✓ You&apos;ve unlocked free shipping
                  </p>
                ) : (
                  <p className="text-[10px] tracking-[0.08em] uppercase text-black/50 dark:text-white/50 mb-2">
                    Add <span className="text-black dark:text-white font-semibold">{format(amountToFreeShip)}</span> more for free shipping
                  </p>
                )}
                <div className="h-px bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-black dark:bg-white"
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
                  <ShoppingBag size={48} className="text-surface-200 dark:text-surface-700" />
                  <p className="font-medium text-surface-700 dark:text-surface-300">{t("empty")}</p>
                  <p className="text-sm text-surface-400">{t("emptyDesc")}</p>
                  <Button variant="gold" size="sm" onClick={closeCart} asChild>
                    <Link href="/">{t("continueShopping")}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-surface-100 dark:divide-surface-800 px-5 py-2">
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
                        >
                          <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 shrink-0">
                            <Image src={img} alt={item.product.name} fill className="object-cover" sizes="64px" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={closeCart}
                              className="text-sm font-medium text-surface-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-2 leading-snug"
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <p className="text-xs text-surface-400 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-0.5 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-sm"
                                >−</button>
                                <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-sm"
                                >+</button>
                              </div>
                              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                                {format(price * item.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="self-start mt-0.5 text-surface-300 hover:text-red-500 dark:text-surface-600 dark:hover:text-red-400 transition-colors"
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

            {/* Cross-sell */}
            {items.length > 0 && suggestions.length > 0 && (
              <div className="border-t border-surface-100 dark:border-surface-800 px-5 py-4">
                <p className="text-[9px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40 mb-3">You might also like</p>
                <div className="space-y-3">
                  {suggestions.map((p) => {
                    const img = getProductImageUrl(p.images, 200, 75);
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <Link href={`/products/${p.slug}`} onClick={closeCart} className="relative w-12 h-12 shrink-0 overflow-hidden bg-surface-100 dark:bg-surface-800">
                          <Image src={img} alt={p.name} fill className="object-cover" sizes="48px" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-black dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-black/40 dark:text-white/40">{format(Number(p.price))}</p>
                        </div>
                        <button
                          onClick={() => { addItem(p); }}
                          disabled={p.stockStatus === "OUT_OF_STOCK"}
                          className="shrink-0 h-7 px-3 border border-black dark:border-white text-black dark:text-white text-[9px] tracking-[0.1em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-surface-100 dark:border-surface-800 px-5 py-4 space-y-3">
                {/* Coupon field */}
                {coupon ? (
                  <div className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
                    <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                      <Check size={12} />
                      <span className="font-mono font-bold">{coupon.code}</span>
                      <span className="text-green-600 dark:text-green-500">−{format(discount())}</span>
                    </span>
                    <button onClick={() => setCoupon(null)} className="text-green-600 dark:text-green-400 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                        <input
                          ref={couponRef}
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                          placeholder={t("coupon")}
                          className="w-full pl-7 pr-2 h-8 text-[11px] tracking-[0.06em] uppercase border border-surface-200 dark:border-surface-700 bg-transparent text-black dark:text-white placeholder-black/35 dark:placeholder-white/35 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="h-8 px-3 border border-black dark:border-white text-black dark:text-white text-[9px] tracking-[0.1em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40"
                      >
                        {couponLoading ? "…" : t("apply")}
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>{t("discount")}</span>
                    <span>−{format(discount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-surface-500 dark:text-surface-400">
                  <span>{t("shipping")}</span>
                  <span>{shipping() === 0 ? <span className="text-green-600 dark:text-green-400 font-medium">{t("free")}</span> : format(shipping())}</span>
                </div>
                <div className="flex justify-between font-semibold text-base text-surface-900 dark:text-white pt-1 border-t border-surface-100 dark:border-surface-800">
                  <span>{t("total")}</span>
                  <span>{format(total())}</span>
                </div>
                <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight size={16} />} asChild>
                  <Link href="/checkout" onClick={closeCart}>{t("checkout")}</Link>
                </Button>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm text-surface-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  View full cart
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
