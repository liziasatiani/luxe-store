"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, discount, shipping, total, coupon } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);

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

          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-white dark:bg-surface-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-surface-700 dark:text-surface-300" />
                <span className="font-semibold text-surface-900 dark:text-white">
                  Cart
                  {count > 0 && (
                    <span className="ml-2 text-sm font-normal text-surface-400">({count} {count === 1 ? "item" : "items"})</span>
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

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <ShoppingBag size={48} className="text-surface-200 dark:text-surface-700" />
                  <p className="font-medium text-surface-700 dark:text-surface-300">Your cart is empty</p>
                  <p className="text-sm text-surface-400">Add something from the store to get started.</p>
                  <Button variant="gold" size="sm" onClick={closeCart} asChild>
                    <Link href="/">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-surface-100 dark:divide-surface-800 px-5 py-2">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const img = getProductImageUrl(item.product.images);
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
                                {formatPrice(price * item.quantity)}
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-surface-100 dark:border-surface-800 px-5 py-4 space-y-3">
                {coupon && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Coupon ({coupon.code})</span>
                    <span>−{formatPrice(discount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-surface-500 dark:text-surface-400">
                  <span>Shipping</span>
                  <span>{shipping() === 0 ? <span className="text-green-600 dark:text-green-400 font-medium">FREE</span> : formatPrice(shipping())}</span>
                </div>
                <div className="flex justify-between font-semibold text-base text-surface-900 dark:text-white pt-1 border-t border-surface-100 dark:border-surface-800">
                  <span>Total</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight size={16} />} asChild>
                  <Link href="/checkout" onClick={closeCart}>Checkout</Link>
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
        </>
      )}
    </AnimatePresence>
  );
}
