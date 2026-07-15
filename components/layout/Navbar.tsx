"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Sun, Moon, Menu, X, User, Package, LogOut, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useClickOutside } from "@/hooks";
import { useCartStore, useUIStore, useWishlistStore } from "@/store";
import { Container } from "@/components/ui";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { PressBar } from "@/components/home/PressBar";

export function Navbar() {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { openSearch, openMobileMenu, mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount } = useCartStore();
  const wishlistIds = useWishlistStore(s => s.ids);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("nav");

  useEffect(() => setMounted(true), []);

  const count = mounted ? itemCount() : 0;
  const user = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "ADMIN" ||
    (user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  const NAV_LINKS = [
    { label: t("beauty"), href: "/beauty", children: [
      { label: "Skincare",     href: "/beauty/skincare"     },
      { label: "Makeup",       href: "/beauty/makeup"       },
      { label: "Hair Care",    href: "/beauty/hair-care"    },
      { label: "Body Care",    href: "/beauty/body-care"    },
      { label: "Perfume",      href: "/beauty/perfume"      },
      { label: "Beauty Tools", href: "/beauty/beauty-tools" },
      { label: "Mini",         href: "/beauty/mini"         },
    ]},
    { label: t("tech"), href: "/tech", children: [
      { label: "Headphones", href: "/tech/headphones" },
      { label: "Cameras",    href: "/tech/cameras"    },
      { label: "Tablets",    href: "/tech/tablets"    },
      { label: "Gaming",     href: "/tech/gaming"     },
      { label: "Wearables",   href: "/tech/wearables"   },
      { label: "Smart Home",  href: "/tech/smart-home"  },
      { label: "Audio",       href: "/tech/audio"       },
      { label: "Accessories", href: "/tech/accessories" },
    ]},
    { label: t("brands"), href: "/brands",  children: [] },
    { label: t("deals"),  href: "/deals",   children: [] },
    { label: t("new"),    href: "/new",     children: [] },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-black/10 dark:border-white/10 transition-colors duration-300">
        <PressBar />
        <Container>
          <div className="flex items-center h-14 md:h-16">
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-3 -ml-3 text-black dark:text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop: left nav — flex-1 so logo stays truly centered */}
            <nav className="hidden lg:flex items-center gap-6 flex-1">
              {NAV_LINKS.slice(0, 3).map((link) => (
                <div key={link.href} className="relative"
                  onMouseEnter={() => link.children?.length ? setMegaMenu(link.href) : undefined}
                  onMouseLeave={() => setMegaMenu(null)}
                  onFocus={() => link.children?.length ? setMegaMenu(link.href) : undefined}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMegaMenu(null); }}
                >
                  <Link
                    href={link.href}
                    aria-haspopup={link.children?.length ? "true" : undefined}
                    aria-expanded={link.children?.length ? megaMenu === link.href : undefined}
                    onKeyDown={(e) => { if (e.key === "Escape") setMegaMenu(null); }}
                    className="text-[11px] tracking-[0.12em] uppercase font-medium text-black dark:text-white hover:opacity-50 transition-opacity"
                  >
                    {link.label}
                  </Link>
                  <AnimatePresence>
                    {megaMenu === link.href && link.children?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute top-full left-0 mt-3 w-44 bg-white dark:bg-black border border-black/10 dark:border-white/10 py-2 z-50"
                      >
                        {link.children.map((child) => (
                          <Link key={child.href} href={child.href}
                            role="menuitem"
                            onKeyDown={(e) => { if (e.key === "Escape") setMegaMenu(null); }}
                            className="block px-4 py-2 text-[11px] tracking-[0.08em] uppercase text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                            onClick={() => setMegaMenu(null)}>
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
            <Link
              href="/"
              onClick={closeMobileMenu}
              className=""
            >
              <span className="font-display text-sm md:text-base tracking-[0.1em] uppercase text-black dark:text-white whitespace-nowrap">
                Everything Street
              </span>
            </Link>
            <div className="flex items-center gap-1 ml-auto flex-1 justify-end">
              <div className="hidden lg:flex items-center gap-0">
                {mounted && <CurrencySelector />}
                <span className="text-black/20 dark:text-white/20 text-xs select-none">|</span>
                {mounted && <LanguageSelector />}
              </div>

              <button onClick={openSearch} aria-label="Open search" className="p-3 text-black dark:text-white hover:opacity-50 transition-opacity">
                <Search size={18} />
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  className="hidden lg:block p-2.5 text-black dark:text-white hover:opacity-50 transition-opacity"
                >
                  {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}

              <Link href="/wishlist" aria-label="Wishlist" className="relative hidden md:block p-3 text-black dark:text-white hover:opacity-50 transition-opacity">
                <Heart size={18} />
                {mounted && wishlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[9px] flex items-center justify-center font-bold">
                    {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" aria-label="Shopping bag" className="relative p-3 text-black dark:text-white hover:opacity-50 transition-opacity">
                <ShoppingBag size={18} />
                {mounted && count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[9px] flex items-center justify-center font-bold">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {mounted && (user ? (
                <AccountMenu user={{ name: user.name, image: user.image }} isAdmin={isAdmin} />
              ) : (
                <Link href="/login" className="hidden md:block text-[11px] tracking-[0.12em] uppercase font-medium text-black dark:text-white hover:opacity-50 transition-opacity">
                  {t("signIn")}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed inset-0 z-40 bg-white dark:bg-black pt-[104px] overflow-y-auto lg:hidden">
            <Container className="py-4">
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="border-b border-black/8 dark:border-white/8">
                  <Link href={link.href} onClick={closeMobileMenu}
                    className="flex items-center h-12 text-[13px] tracking-[0.1em] uppercase font-medium text-black dark:text-white">
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link key={child.href} href={child.href} onClick={closeMobileMenu}
                      className="flex items-center h-10 pl-4 text-[11px] tracking-[0.06em] uppercase text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-6 space-y-1">
                {user ? (
                  <>
                    <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-3 h-11 text-[12px] tracking-[0.08em] uppercase text-black/60 dark:text-white/60">
                      <User size={16} /> {t("myAccount")}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 h-11 text-[12px] tracking-[0.08em] uppercase text-black/60 dark:text-white/60">
                        <LayoutDashboard size={16} /> {t("adminPanel")}
                      </Link>
                    )}
                    <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex items-center gap-3 h-11 text-[12px] tracking-[0.08em] uppercase text-red-500 w-full">
                      <LogOut size={16} /> {t("signOut")}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}
                    className="flex items-center justify-center h-11 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium">
                    {t("signIn")}
                  </Link>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[104px] md:h-[112px]" />
    </>
  );
}

function AccountMenu({ user, isAdmin }: { user: { name?: string | null; image?: string | null }; isAdmin: boolean }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Open account menu" aria-expanded={open} className="p-2.5 text-black dark:text-white hover:opacity-50 transition-opacity">
        {user.image ? (
          <Image src={user.image} alt={user.name ?? "User avatar"} width={24} height={24} className="rounded-full object-cover" />
        ) : (
          <User size={18} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-48 bg-white dark:bg-black border border-black/10 dark:border-white/10 py-1 z-50">
            <div className="px-4 py-2.5 border-b border-black/8 dark:border-white/8">
              <p className="text-[11px] tracking-[0.08em] uppercase text-black/50 dark:text-white/50 truncate">{user.name}</p>
            </div>
            {[
              { href: "/account",        icon: User,    label: t("myAccount") },
              { href: "/account/orders", icon: Package, label: t("orders")    },
              { href: "/wishlist",       icon: Heart,   label: t("wishlist")  },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase text-black dark:text-white hover:opacity-50 transition-opacity">
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase text-black dark:text-white hover:opacity-50 transition-opacity">
                <LayoutDashboard size={14} /> {t("adminPanel")}
              </Link>
            )}
            <div className="border-t border-black/8 dark:border-white/8 mt-1 pt-1">
              <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase text-red-600 w-full hover:opacity-70 transition-opacity">
                <LogOut size={14} /> {t("signOut")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
