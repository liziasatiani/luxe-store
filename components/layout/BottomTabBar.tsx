"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home",   href: "/",        icon: Home },
  { label: "Shop",   href: "/beauty",  icon: LayoutGrid },
  { label: "Search", href: null,       icon: Search },
  { label: "Cart",   href: null,       icon: ShoppingBag },
  { label: "Account",href: "/account", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, isOpen: cartOpen, openCart } = useCartStore();
  const { mobileMenuOpen, openSearch } = useUIStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // Hide when cart drawer or mobile menu is open (avoids z-index conflicts)
  if (cartOpen || mobileMenuOpen) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-black border-t border-black/8 dark:border-white/8 safe-area-inset-bottom"
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ label, href, icon: Icon }) => {
          const isCart   = label === "Cart";
          const isSearch = label === "Search";
          const isActive = href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

          const inner = (
            <span className="flex flex-col items-center justify-center gap-0.5 relative">
              <span className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-black dark:text-white" : "text-black/35 dark:text-white/35"
                  )}
                />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] bg-black dark:bg-white text-white dark:text-black text-[8px] font-medium rounded-full flex items-center justify-center px-0.5">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
              <span className={cn(
                "text-[9px] tracking-[0.06em] uppercase transition-colors",
                isActive ? "text-black dark:text-white" : "text-black/35 dark:text-white/35"
              )}>
                {label}
              </span>
            </span>
          );

          const btnClass = "flex-1 flex items-center justify-center h-full tap-highlight-none active:opacity-60 transition-opacity";

          if (isCart) {
            return (
              <button key={label} onClick={openCart} aria-label="Open cart" className={btnClass}>
                {inner}
              </button>
            );
          }
          if (isSearch) {
            return (
              <button key={label} onClick={openSearch} aria-label="Open search" className={btnClass}>
                {inner}
              </button>
            );
          }
          const dest = label === "Account" && !session ? "/login" : href!;
          return (
            <Link key={label} href={dest} className={btnClass} aria-label={label}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
