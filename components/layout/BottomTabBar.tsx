"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function BottomTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, isOpen: cartOpen, openCart } = useCartStore();
  const { mobileMenuOpen, openSearch } = useUIStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const TABS = [
    { label: t("home"),    key: "home",    href: "/",        icon: Home },
    { label: t("shop"),    key: "shop",    href: "/beauty",  icon: LayoutGrid },
    { label: t("search"),  key: "search",  href: null,       icon: Search },
    { label: t("cart"),    key: "cart",    href: null,       icon: ShoppingBag },
    { label: t("account"), key: "account", href: "/account", icon: User },
  ];

  // Hide when cart drawer or mobile menu is open (avoids z-index conflicts)
  if (cartOpen || mobileMenuOpen) return null;

  return (
    <nav
      aria-label={t("mainNav")}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-inset-bottom"
      style={{ background: "var(--s1)", borderTop: "1px solid var(--border)" }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ label, key, href, icon: Icon }) => {
          const isCart   = key === "cart";
          const isSearch = key === "search";
          const isActive = href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

          const inner = (
            <span className="flex flex-col items-center justify-center gap-0.5 relative">
              <span className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-[var(--chalk)]" : "text-[var(--chalk2)]"
                  )}
                />
                {isCart && cartCount > 0 && (
                  <span aria-live="polite" className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] text-[8px] font-medium rounded-full flex items-center justify-center px-0.5" style={{ background: "var(--chalk)", color: "var(--bg)" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
              <span className={cn(
                "text-[9px] tracking-[0.06em] uppercase transition-colors",
                isActive ? "text-[var(--chalk)]" : "text-[var(--chalk2)]"
              )}>
                {label}
              </span>
            </span>
          );

          const btnClass = "flex-1 flex items-center justify-center h-full tap-highlight-none active:opacity-60 transition-opacity";

          if (isCart) {
            return (
              <button key={key} onClick={openCart} aria-label={label} className={btnClass}>
                {inner}
              </button>
            );
          }
          if (isSearch) {
            return (
              <button key={key} onClick={openSearch} aria-label={label} className={btnClass}>
                {inner}
              </button>
            );
          }
          const dest = key === "account" && !session ? "/login" : href!;
          return (
            <Link key={key} href={dest} className={btnClass} aria-label={label}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
