import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Upload, BarChart2, Settings, ChevronRight } from "lucide-react";

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/admin/products",  icon: Package,         label: "Products"    },
  { href: "/admin/orders",    icon: ShoppingCart,    label: "Orders"      },
  { href: "/admin/customers", icon: Users,           label: "Customers"   },
  { href: "/admin/coupons",   icon: Tag,             label: "Coupons"     },
  { href: "/admin/import",    icon: Upload,          label: "Import"      },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface-950 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-surface-800">
          <Link href="/" className="font-display text-xl text-white">
            Luxe<span className="text-brand-400">.</span>
            <span className="text-xs text-surface-400 ml-2">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-300 hover:text-white hover:bg-surface-800 transition-colors group"
            >
              <item.icon size={16} />
              {item.label}
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
