"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Divider, Input, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, coupon, setCoupon, subtotal, discount, shipping, tax, total, itemCount } = useCartStore();
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
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<ShoppingBag size={64} />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Button variant="gold" size="lg" asChild><Link href="/">Start Shopping</Link></Button>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-8">
        Shopping Cart <span className="text-surface-400 text-2xl">({itemCount()} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const img = getProductImageUrl(item.product.images);
              const price = Number(item.variant?.price ?? item.product.price);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900"
                >
                  <Link href={`/products/${item.product.slug}`} className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-800 shrink-0">
                    <Image src={img} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-surface-400 mb-0.5">{item.product.brand?.name}</p>
                        <Link href={`/products/${item.product.slug}`} className="font-medium text-surface-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-2 text-sm">
                          {item.product.name}
                        </Link>
                        {item.variant && <p className="text-xs text-surface-400 mt-1">{item.variant.name}: {item.variant.value}</p>}
                      </div>
                      <button onClick={() => { removeItem(item.id); toast.success("Item removed"); }} className="text-surface-400 hover:text-error transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800">−</button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800">+</button>
                      </div>
                      <span className="font-semibold text-surface-900 dark:text-white">{formatPrice(price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Order Summary</h2>

            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Tag size={14} />
                  <span className="text-sm font-medium">{coupon.code}</span>
                </div>
                <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-green-600 dark:text-green-400 hover:text-green-800">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  className="h-10 text-sm"
                />
                <Button onClick={applyCoupon} loading={couponLoading} variant="outline" size="sm" className="shrink-0 h-10">
                  Apply
                </Button>
              </div>
            )}

            <Divider />

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal())}</span>
              </div>
              {discount() > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>−{formatPrice(discount())}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Shipping</span>
                <span className={shipping() === 0 ? "text-green-600 dark:text-green-400 font-medium" : "font-medium"}>
                  {shipping() === 0 ? "FREE" : formatPrice(shipping())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax (8.5%)</span>
                <span className="font-medium">{formatPrice(tax())}</span>
              </div>
            </div>

            <Divider />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-surface-900 dark:text-white">{formatPrice(total())}</span>
            </div>

            <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight size={18} />} asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Link href="/" className="block text-center text-sm text-brand-500 hover:text-brand-600">
              ← Continue Shopping
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex justify-center gap-6 text-xs text-surface-400">
            <span>🔒 Secure</span>
            <span>↩️ Free returns</span>
            <span>✓ Authentic</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
