import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { Container } from "@/components/ui";

const NAV = [
  { href: "/account",           icon: User,    label: "Profile"   },
  { href: "/account/orders",    icon: Package, label: "Orders"    },
  { href: "/account/addresses", icon: MapPin,  label: "Addresses" },
  { href: "/wishlist",          icon: Heart,   label: "Wishlist"  },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?redirect=/account");

  return (
    <Container className="py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
            <div className="bg-surface-50 dark:bg-surface-800/50 px-5 py-5 border-b border-surface-100 dark:border-surface-800">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3">
                <User size={22} className="text-brand-600 dark:text-brand-400" />
              </div>
              <p className="font-semibold text-surface-900 dark:text-white">{session.user.name}</p>
              <p className="text-xs text-surface-400 truncate">{session.user.email}</p>
            </div>
            <nav className="py-2">
              {NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-surface-100 dark:border-surface-800 mt-2 pt-2">
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </Link>
              </div>
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </Container>
  );
}
