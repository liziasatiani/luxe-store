"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CouponInfo, ProductCard } from "@/types";
import { calcShipping, calcTax } from "@/lib/utils";

interface CartStore {
  items: CartItem[];
  coupon: CouponInfo | null;
  isOpen: boolean;
  addItem: (product: ProductCard, quantity?: number, variant?: CartItem["variant"]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: CouponInfo | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  discount: () => number;
  shipping: () => number;
  tax: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,

      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const existingIdx = state.items.findIndex(
            (i) =>
              i.productId === product.id &&
              (variant ? i.variantId === variant?.value : !i.variantId)
          );
          if (existingIdx >= 0) {
            const updated = [...state.items];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + quantity,
            };
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              {
                id: `${product.id}-${variant?.value ?? "default"}-${Date.now()}`,
                productId: product.id,
                variantId: variant?.value,
                quantity,
                product,
                variant,
              },
            ],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set((state) => ({
          items: state.items.map((i) => i.id === id ? { ...i, quantity } : i),
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = Number(i.variant?.price ?? i.product.price);
          return sum + price * i.quantity;
        }, 0),

      discount: () => {
        const { coupon, subtotal } = get();
        const sub = subtotal();
        if (!coupon) return 0;
        if (coupon.minOrderAmount && sub < coupon.minOrderAmount) return 0;
        let disc = 0;
        if (coupon.type === "PERCENTAGE") {
          disc = (sub * coupon.value) / 100;
          if (coupon.maxDiscount) disc = Math.min(disc, coupon.maxDiscount);
        } else if (coupon.type === "FIXED_AMOUNT") {
          disc = coupon.value;
        }
        return Math.min(disc, sub);
      },

      shipping: () => {
        const { coupon, subtotal } = get();
        if (coupon?.type === "FREE_SHIPPING") return 0;
        return calcShipping(subtotal());
      },

      tax: () => {
        const sub = get().subtotal() - get().discount();
        return calcTax(sub + get().shipping());
      },

      total: () => {
        const { subtotal, discount, shipping, tax } = get();
        return subtotal() - discount() + shipping() + tax();
      },
    }),
    {
      name: "luxe-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, coupon: s.coupon }),
    }
  )
);

interface WishlistStore {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((s) => ({
          ids: s.ids.includes(productId)
            ? s.ids.filter((id) => id !== productId)
            : [...s.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: "luxe-wishlist", storage: createJSONStorage(() => localStorage) }
  )
);

interface UIStore {
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  mobileMenuOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
