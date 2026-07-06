"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Sun, Moon, Menu, X, User, ChevronDown, Package, LogOut, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useScrolled, useClickOutside } from "@/hooks";
import { useCartStore, useUIStore } from "@/store";
import { Container } from "@/components/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Beauty", href: "/beauty", children: [
    { label: "Skincare",     href: "/beauty/skincare"     },
    { label: "Makeup",       href: "/beauty/makeup"       },
    { label: "Hair Care",    href: "/beauty/hair-care"    },
    { label: "Body Care",    href: "/beauty/body-care"    },
    { label: "Perfume",      href: "/beauty/perfume"      },
    { label: "Beauty Tools", href: "/beauty/beauty-tools" },
  ]},
  { label: "Tech", href: "/tech", children: [
    { label: "Headphones",  href: "/tech/headphones"  },
    { label: "Cameras",     href: "/tech/cameras"     },
    { label: "Tablets",     href: "/tech/tablets"     },
    { label: "Gaming",      href: "/tech/gaming"      },
    { label: "Wearables",   href: "/tech/wearables"   },
    { label: "Smart Home",  href: "/tech/smart-home"  },
    { label: "Audio",       href: "/tech/audio"       },
    { label: "Accessories", href: "/tech/accessories" },
  ]},
  { label: "Brands", href: "/brands",  children: [] },
  { label: "Deals",  href: "/deals",   children: [] },
];

export function Navbar() {
  const scrolled = useScrolled(60);
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { openSearch, openMobileMenu, mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount } = useCartStore();
  const count = itemCount();
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const user = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "ADMIN" ||
    (user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-surface-950/95 backdrop-blur-md shadow-lg border-b border-surface-100/80 dark:border-surface-800/80"
          : "bg-transparent"
      )}>
        <Container>
          <div className="flex items-center h-16 md:h-20 gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeMobileMenu}>
              <span className="font-display text-2xl tracking-tight text-surface-900 dark:text-white">
                Luxe<span className="text-brand-500">.</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children?.length ? setMegaMenu(link.href) : undefined}
                  onMouseLeave={() => setMegaMenu(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-4 h-10 rounded-xl text-sm font-medium transition-colors",
                      "text-surface-700 hover:text-surface-900 hover:bg-surface-50",
                      "dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-800"
                    )}
                  >
                    {link.label}
                    {link.children?.length > 0 && (
                      <ChevronDown size={14} className={cn("transition-transform", megaMenu === link.href && "rotate-180")} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {megaMenu === link.href && link.children?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800 py-2 z-50"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                            onClick={() => setMegaMenu(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-1 ml-auto">
              <button onClick={openSearch} className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Search size={20} />
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              <Link href="/wishlist" className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Heart size={20} />
              </Link>

              <Link href="/cart" className="relative w-10 h-10 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>

              {user ? (
                <AccountMenu
                  user={{ name: user.name, image: user.image }}
                  isAdmin={isAdmin}
                />
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium bg-surface-900 text-white dark:bg-white dark:text-surface-900 hover:opacity-90 transition-opacity">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed inset-0 z-40 bg-white dark:bg-surface-950 pt-20 overflow-y-auto lg:hidden"
          >
            <Container className="py-6 space-y-2">
              {NAV_LINKS.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center h-12 px-4 text-lg font-medium text-surface-900 dark:text-white hover:text-brand-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeMobileMenu}
                      className="flex items-center h-10 pl-8 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-6 border-t border-surface-100 dark:border-surface-800 space-y-2">
                {user ? (
                  <>
                    <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-3 h-12 px-4 text-surface-700 dark:text-surface-300">
                      <User size={18} /> My Account
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 h-12 px-4 text-surface-700 dark:text-surface-300">
                        <LayoutDashboard size={18} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex items-center gap-3 h-12 px-4 text-red-500 w-full">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu} className="flex items-center justify-center h-12 px-4 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-xl font-medium">
                    Sign In
                  </Link>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 md:h-20" />
    </>
  );
}

function AccountMenu({ user, isAdmin }: { user: { name?: string | null; image?: string | null }; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-brand-500 transition-all"
      >
        {user.image ? (
          <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="rounded-xl object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <User size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-800 mb-1">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user.name}</p>
            </div>
            {[
              { href: "/account",        icon: User,    label: "My Account" },
              { href: "/account/orders", icon: Package, label: "Orders"     },
              { href: "/wishlist",        icon: Heart,   label: "Wishlist"   },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-600 dark:text-brand-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <LayoutDashboard size={16} />
                Admin Panel
              </Link>
            )}
            <div className="border-t border-surface-100 dark:border-surface-800 mt-1 pt-1">
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
