"use client";
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { usePathname } from "next/navigation";

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "Technology",   href: "/tech"   },
    { label: "Beauty",       href: "/beauty" },
    { label: "New Arrivals", href: "/new"    },
    { label: "All Brands",   href: "/brands" },
  ],
  Company: [
    { label: "About Us", href: "/about"   },
    { label: "Contact",  href: "/contact" },
    { label: "Careers",  href: "/careers" },
  ],
  Support: [
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns Policy",      href: "/returns"  },
    { label: "Authenticity",        href: "/about"    },
    { label: "Privacy Policy",      href: "/privacy"  },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebook  = process.env.NEXT_PUBLIC_FACEBOOK_URL;

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer>
      <div className="footer-inner">
        <div className="ftop">
          {/* Brand column */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div className="flogo">Everything <em>Street</em></div>
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
