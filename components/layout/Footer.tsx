"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebook  = process.env.NEXT_PUBLIC_FACEBOOK_URL;

  if (pathname.startsWith("/admin")) return null;

  const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
    [t("shop")]: [
      { label: t("tech"),        href: "/tech"   },
      { label: t("beauty"),      href: "/beauty" },
      { label: t("newArrivals"), href: "/new"    },
      { label: t("brands"),      href: "/brands" },
    ],
    [t("company")]: [
      { label: t("about"),   href: "/about"   },
      { label: t("contact"), href: "/contact" },
      { label: t("careers"), href: "/careers" },
    ],
    [t("support")]: [
      { label: t("shipping"),     href: "/shipping"     },
      { label: t("returns"),      href: "/returns"      },
      { label: t("terms"),        href: "/terms"        },
      { label: t("privacy"),      href: "/privacy"      },
      { label: t("cookiePolicy"), href: "/cookie-policy"},
    ],
  };

  return (
    <footer>
      <div className="footer-inner">
        <div className="ftop">
          {/* Brand column */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <img
                src={mounted && theme !== "dark" ? "/logo-nameplate-light.svg" : "/logo-nameplate-dark.svg"}
                alt="Everything Street"
                height={32}
                width={110}
                style={{ height: "32px", width: "auto", marginBottom: "14px", display: "block" }}
              />
            </Link>
            <p className="fdescr">Georgia&apos;s curated destination for technology and beauty. Only the authentic.</p>
            <div className="f-socials">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="f-social">
                  <Instagram size={16} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="f-social">
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div className="fcol-h">{title}</div>
              <ul className="fcol-links">
                {links.map((link, i) => (
                  <li key={`${link.href}-${i}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fbot">
          <span className="fbot-copy">© {new Date().getFullYear()} Everything Street — Tbilisi, Georgia</span>
          <div className="fbot-pay">
            {["Visa", "Mastercard", "Amex", "Apple Pay"].map((pm, i, arr) => (
              <span key={pm} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="fbot-pm">{pm}</span>
                {i < arr.length - 1 && <span className="fbot-dot">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
