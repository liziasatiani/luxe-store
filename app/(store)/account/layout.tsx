import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };
import { auth } from "@/lib/auth";
import Link from "next/link";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?redirect=/account");

  const t = await getTranslations("account");

  const NAV = [
    { href: "/account",           icon: User,    label: t("profile.title") },
    { href: "/account/orders",    icon: Package, label: t("orders")        },
    { href: "/account/addresses", icon: MapPin,  label: t("addresses.title") },
    { href: "/wishlist",          icon: Heart,   label: t("wishlist")      },
  ];

  return (
    <div style={{ paddingTop: 40, paddingBottom: 96 }}>
      <div className="wrap">
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          <aside style={{ width: 220, flexShrink: 0 }}>
            <div style={{ border: "1px solid var(--border)" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", background: "var(--s1)" }}>
                <div style={{ width: 36, height: 36, border: "1px solid var(--borderg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <User size={16} style={{ color: "var(--chalk2)" }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)", letterSpacing: "0.02em" }}>{session.user.name}</p>
                <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.email}</p>
              </div>
              <nav style={{ padding: "4px 0" }}>
                {NAV.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", fontSize: 12, color: "var(--chalk2)", textDecoration: "none", transition: "color 0.15s", letterSpacing: "0.04em" }}
                  >
                    <item.icon size={14} style={{ flexShrink: 0, color: "var(--chalk3)" }} />
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 4 }}>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", fontSize: 12, color: "var(--crimson)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.04em" }}
                    >
                      <LogOut size={14} style={{ flexShrink: 0 }} /> {t("signOut")}
                    </button>
                  </form>
                </div>
              </nav>
            </div>
          </aside>
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </div>
  );
}
