"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, X, User, Package, LogOut, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useClickOutside } from "@/hooks";
import { useCartStore, useUIStore, useWishlistStore } from "@/store";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { CurrencySelector } from "@/components/layout/CurrencySelector";

export function Navbar() {
  const { data: session } = useSession();
  const { openSearch, openMobileMenu, mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount } = useCartStore();
  const wishlistIds = useWishlistStore(s => s.ids);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("nav");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? itemCount() : 0;
  const user = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "ADMIN" ||
    (user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  const tc = useTranslations("home.categories");
  const NAV_LINKS = [
    { label: t("beauty"), href: "/beauty", children: [
      { label: tc("skincare"),    href: "/beauty/skincare"     },
      { label: tc("makeup"),      href: "/beauty/makeup"       },
      { label: tc("hairCare"),    href: "/beauty/hair-care"    },
      { label: tc("bodyCare"),    href: "/beauty/body-care"    },
      { label: tc("perfume"),     href: "/beauty/perfume"      },
      { label: tc("beautyTools"), href: "/beauty/beauty-tools" },
      { label: tc("mini"),        href: "/beauty/mini"         },
    ]},
    { label: t("tech"), href: "/tech", children: [
      { label: tc("headphones"),  href: "/tech/headphones" },
      { label: tc("cameras"),     href: "/tech/cameras"    },
      { label: tc("tablets"),     href: "/tech/tablets"    },
      { label: tc("gaming"),      href: "/tech/gaming"     },
      { label: tc("wearables"),   href: "/tech/wearables"  },
      { label: tc("smartHome"),   href: "/tech/smart-home" },
      { label: tc("audio"),       href: "/tech/audio"      },
      { label: tc("accessories"), href: "/tech/accessories"},
    ]},
    { label: t("brands"), href: "/brands",  children: [] },
    { label: t("deals"),  href: "/deals",   children: [] },
    { label: t("new"),    href: "/new",     children: [] },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-400 ease-[cubic-bezier(.4,0,.2,1)] ${
          scrolled
            ? "bg-[rgba(7,9,15,0.88)] backdrop-blur-[24px] border-b border-white/[0.08]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* K-design 3-column grid: [left: currency/lang] [center: logo] [right: icons] */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 md:h-16 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">

          {/* Left: hamburger (mobile) | currency+lang (desktop) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 -ml-2 text-white/80 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden lg:flex items-center gap-0">
              {mounted && <CurrencySelector />}
              <span className="text-white/20 text-xs select-none mx-1">|</span>
              {mounted && <LanguageSelector />}
            </div>
          </div>

          {/* Center: logo */}
          <Link href="/" onClick={closeMobileMenu} className="flex items-center justify-center">
            <span className="font-display text-[20px] font-bold tracking-[0.02em] text-white whitespace-nowrap">
              Everything <em className="not-italic italic font-bold" style={{ color: "#C9A44A" }}>Street</em>
            </span>
          </Link>

          {/* Right: search + wishlist + cart + account */}
          <div className="flex items-center gap-0.5 justify-end">
            <button onClick={openSearch} aria-label="Open search"
              className="p-2.5 text-white/70 hover:text-white transition-colors">
              <Search size={18} />
            </button>

            <Link href="/wishlist" aria-label="Wishlist"
              className="relative hidden md:flex p-2.5 text-white/70 hover:text-white transition-colors">
              <Heart size={18} />
              {mounted && wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-[8px] flex items-center justify-center font-bold text-surface-950">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Link>

            <Link href="/cart" aria-label="Shopping bag"
              className="relative p-2.5 text-white/70 hover:text-white transition-colors">
              <ShoppingBag size={18} />
              {mounted && count > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-[8px] flex items-center justify-center font-bold text-surface-950">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {mounted && (user ? (
              <AccountMenu user={{ name: user.name, image: user.image }} isAdmin={isAdmin} />
            ) : (
              <Link href="/login"
                className="hidden md:block ml-2 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase rounded-full border transition-all hover:bg-brand-500/18"
                style={{ borderColor: "rgba(201,164,74,0.4)", color: "#C9A44A" }}>
                {t("signIn")}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop mega nav — subtle second row on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex justify-center gap-8 pb-2.5 border-t border-white/[0.04] overflow-hidden"
            >
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="relative"
                  onMouseEnter={() => link.children?.length ? setMegaMenu(link.href) : undefined}
                  onMouseLeave={() => setMegaMenu(null)}
                >
                  <Link
                    href={link.href}
                    className="text-[10px] tracking-[0.18em] uppercase font-medium text-white/60 hover:text-white transition-colors pt-2.5 block"
                  >
                    {link.label}
                  </Link>
                  <AnimatePresence>
                    {megaMenu === link.href && link.children?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute top-full left-0 mt-1 w-44 bg-[rgba(7,9,15,0.96)] border border-white/10 py-2 z-50"
                      >
                        {link.children.map((child) => (
                          <Link key={child.href} href={child.href} role="menuitem"
                            className="block px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-white/50 hover:text-white transition-colors"
                            onClick={() => setMegaMenu(null)}>
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed inset-0 z-[199] bg-surface-950 pt-16 overflow-y-auto lg:hidden">
            <div className="px-6 py-4">
              <div className="pb-4 mb-2 flex items-center gap-4 border-b border-white/[0.08]">
                {mounted && <CurrencySelector />}
                {mounted && <LanguageSelector />}
              </div>
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="border-b border-white/[0.06]">
                  <Link href={link.href} onClick={closeMobileMenu}
                    className="flex items-center h-12 text-[12px] tracking-[0.14em] uppercase font-medium text-white">
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link key={child.href} href={child.href} onClick={closeMobileMenu}
                      className="flex items-center h-10 pl-4 text-[10px] tracking-[0.08em] uppercase text-white/40 hover:text-white transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-6">
                {user ? (
                  <button onClick={() => { signOut(); closeMobileMenu(); }}
                    className="flex items-center gap-3 h-11 text-[11px] tracking-[0.1em] uppercase text-red-400 w-full">
                    <LogOut size={16} /> {t("signOut")}
                  </button>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}
                    className="flex items-center justify-center h-11 border border-brand-500 text-brand-500 text-[10px] tracking-[0.18em] uppercase font-medium hover:bg-brand-500/10 transition-colors">
                    {t("signIn")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer so page content doesn't go under fixed nav */}
      <div className="h-14 md:h-16" />
    </>
  );
}

function AccountMenu({ user, isAdmin }: { user: { name?: string | null; image?: string | null }; isAdmin: boolean }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Open account menu" aria-expanded={open}
        className="p-2.5 text-white/70 hover:text-white transition-colors">
        {user.image ? (
          <Image src={user.image} alt={user.name ?? "User avatar"} width={22} height={22} className="rounded-full object-cover" />
        ) : (
          <User size={18} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-[rgba(7,9,15,0.96)] border border-white/10 py-1 z-50">
            <div className="px-4 py-2.5 border-b border-white/[0.08]">
              <p className="text-[10px] tracking-[0.1em] uppercase text-white/40 truncate">{user.name}</p>
            </div>
            {[
              { href: "/account",        icon: User,    label: t("myAccount") },
              { href: "/account/orders", icon: Package, label: t("orders")    },
              { href: "/wishlist",       icon: Heart,   label: t("wishlist")  },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase text-white/70 hover:text-white transition-colors">
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase text-white/70 hover:text-white transition-colors">
                <LayoutDashboard size={14} /> {t("adminPanel")}
              </Link>
            )}
            <div className="border-t border-white/[0.08] mt-1 pt-1">
              <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase text-red-400 w-full hover:text-red-300 transition-colors">
                <LogOut size={14} /> {t("signOut")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
