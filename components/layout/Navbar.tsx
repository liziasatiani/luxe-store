"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Menu, X, User, Package, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useClickOutside } from "@/hooks";
import { useCartStore, useUIStore, useWishlistStore } from "@/store";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { CurrencySelector } from "@/components/layout/CurrencySelector";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { openSearch, openMobileMenu, mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount } = useCartStore();
  const wishlistIds = useWishlistStore(s => s.ids);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [annVisible, setAnnVisible] = useState(false);
  const t = useTranslations("nav");
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setAnnVisible(y > 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const count = mounted ? itemCount() : 0;
  const user = session?.user;
  // temp fix, revisit before launch — session typing doesn't extend properly with NextAuth v5
  const isAdmin = (user as { role?: string } | undefined)?.role === "ADMIN" ||
    (user as { role?: string } | undefined)?.role === "SUPER_ADMIN";
  const NAV_LINKS = [
    { label: t("brands"), href: "/brands" },
  ];

  const ANN_ITEMS = [
    "Free 48h Delivery in Tbilisi",
    "100% Authentic Products",
    "30-Day Returns",
    "Secure Checkout",
    "New Arrivals Weekly",
    "Exclusive Brand Drops",
  ];

  return (
    <>
      <div className={`ann-bar${annVisible ? " visible" : ""}`} id="annBar">
        <div className="ann-track" id="annTrack">
          {[...ANN_ITEMS, ...ANN_ITEMS].flatMap((item, i) => [
            <span key={`item-${i}`} className="ann-item">{item}</span>,
            <span key={`sep-${i}`} className="ann-sep">·</span>,
          ])}
        </div>
      </div>

      <header
        id="nav"
        className={[scrolled && "solid", annVisible && "ann-shown"].filter(Boolean).join(" ") || undefined}
      >
          <div className="nav-left">
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="nav-icon lg:hidden"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <nav className="nav-links" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center" style={{ gap: "16px", marginLeft: "16px" }}>
              {mounted && <CurrencySelector />}
              <span className="nav-sep" />
              {mounted && <LanguageSelector />}
            </div>
          </div>

          <Link href="/" onClick={closeMobileMenu} className="nav-logo">
            Everything <em>Street</em>
          </Link>

          <div className="nav-right">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="nav-icon">
                {theme === "dark" ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
              </button>
            )}
            <button onClick={openSearch} aria-label="Open search" className="nav-icon">
              <Search size={16} />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="nav-icon nav-icon-desktop">
              <Heart size={16} />
              {mounted && wishlistIds.length > 0 && (
                <span style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
              )}
            </Link>
            <Link href="/cart" aria-label="Shopping cart" className="nav-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 2h1.5l2 7h7l1.5-5H4.5" />
                <circle cx="6.5" cy="13" r="1" />
                <circle cx="11.5" cy="13" r="1" />
              </svg>
              {mounted && count > 0 && (
                <span style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
              )}
            </Link>
            {mounted && user && <span className="nav-sep" />}
            {mounted && (user ? (
              <AccountMenu user={{ name: user.name, image: user.image }} isAdmin={isAdmin} />
            ) : (
              <>
                <Link href="/login" className="signin-btn nav-icon-desktop">{t("signIn")}</Link>
                <Link href="/login" className="nav-icon nav-icon-mobile" aria-label={t("signIn")}><User size={17} /></Link>
              </>
            ))}
          </div>

      </header>

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
                </div>
              ))}
              <div className="pt-6 flex flex-col gap-1">
                {user ? (
                  <>
                    {[
                      { href: "/account",        icon: User,            label: t("myAccount") },
                      { href: "/account/orders", icon: Package,         label: t("orders")    },
                      { href: "/wishlist",        icon: Heart,           label: t("wishlist")  },
                      ...(isAdmin ? [{ href: "/admin", icon: LayoutDashboard, label: t("adminPanel") }] : []),
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={closeMobileMenu}
                        className="flex items-center gap-3 h-11 text-[11px] tracking-[0.1em] uppercase text-white/70">
                        <item.icon size={15} /> {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { signOut(); closeMobileMenu(); }}
                      className="flex items-center gap-3 h-11 text-[11px] tracking-[0.1em] uppercase text-red-400 w-full mt-2 border-t border-white/[0.08] pt-4">
                      <LogOut size={15} /> {t("signOut")}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}
                    className="flex items-center justify-center h-11 border border-white/20 text-white text-[10px] tracking-[0.18em] uppercase font-medium">
                    {t("signIn")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
