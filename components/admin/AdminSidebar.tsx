"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Upload, Settings,
  ChevronRight, ArrowLeft, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products",   icon: Package,         label: "Products"  },
  { href: "/admin/orders",     icon: ShoppingCart,    label: "Orders"    },
  { href: "/admin/customers",  icon: Users,           label: "Customers" },
  { href: "/admin/coupons",    icon: Tag,             label: "Coupons"   },
  { href: "/admin/import",     icon: Upload,          label: "Import"    },
  { href: "/admin/settings",   icon: Settings,        label: "Settings"  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <div className="space-y-0.5">
        {NAV.map(item => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-3 text-sm transition-colors group ${
                active
                  ? "bg-white/10 text-white"
                  : "text-surface-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              {item.label}
              <ChevronRight
                size={13}
                className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const SidebarHeader = ({ onClose }: { onClose?: () => void }) => (
  <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
    <Link href="/" className="font-display text-white leading-tight">
      Everything Street
      <span className="text-xs text-surface-400 ml-2 font-sans">Admin</span>
    </Link>
    {onClose && (
      <button onClick={onClose} className="text-surface-400 hover:text-white p-1 -mr-1">
        <X size={17} />
      </button>
    )}
  </div>
);

const SidebarFooter = () => (
  <div className="p-3 border-t border-white/10 shrink-0">
    <Link
      href="/"
      className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <ArrowLeft size={14} className="shrink-0" />
      Back to Store
    </Link>
  </div>
);

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-surface-950 text-white flex-col">
        <SidebarHeader />
        <NavLinks pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-surface-950 border-b border-white/10 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          className="text-surface-300 hover:text-white p-1 -ml-1"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
        <Link href="/admin" className="font-display text-white text-base leading-none">
          Everything Street
          <span className="text-[11px] text-surface-400 ml-1.5 font-sans">Admin</span>
        </Link>
      </header>

      {/* ── Mobile backdrop ─────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/70 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface-950 text-white flex flex-col transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarHeader onClose={() => setOpen(false)} />
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </aside>
    </>
  );
}
