import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui";

const FOOTER_LINKS = {
  Shop: [
    { label: "Beauty",     href: "/beauty"  },
    { label: "Tech",       href: "/tech"    },
    { label: "Brands",     href: "/brands"  },
    { label: "Deals",      href: "/deals"   },
    { label: "New Arrivals",href: "/new"    },
    { label: "Best Sellers",href: "/best"   },
  ],
  Help: [
    { label: "FAQ",          href: "/faq"      },
    { label: "Contact Us",   href: "/contact"  },
    { label: "Shipping",     href: "/shipping" },
    { label: "Returns",      href: "/returns"  },
    { label: "Track Order",  href: "/account/orders" },
  ],
  Company: [
    { label: "About Us",       href: "/about"   },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use",   href: "/terms"   },
    { label: "Sitemap",        href: "/sitemap.xml" },
  ],
};

const SOCIALS = [
  { icon: Instagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#", label: "Instagram" },
  { icon: Facebook,  href: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "#",  label: "Facebook"  },
  { icon: Twitter,   href: "#",                                           label: "Twitter"   },
  { icon: Youtube,   href: "#",                                           label: "YouTube"   },
];

const PAYMENT_ICONS = ["visa", "mastercard", "amex", "paypal", "apple-pay"];

export function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-300">
      {/* Main footer */}
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-3xl text-white">
                Luxe<span className="text-brand-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs mb-6">
              Your destination for luxury beauty and premium tech. Curated collections from the world's most coveted brands.
            </p>

            {/* Contact */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-brand-400 shrink-0" />
                <a href="mailto:hello@luxestore.com" className="hover:text-white transition-colors">hello@luxestore.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={15} className="text-brand-400 shrink-0" />
                <a href="tel:+15550000000" className="hover:text-white transition-colors">+1 (555) 000-0000</a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="text-brand-400 shrink-0 mt-0.5" />
                <span>123 Luxury Lane, Beverly Hills, CA 90210</span>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-brand-500 flex items-center justify-center transition-colors"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-surface-800">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Luxe Store. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {/* Payment method icons (text fallback) */}
            {PAYMENT_ICONS.map((p) => (
              <div key={p} className="h-6 px-2 rounded bg-surface-800 flex items-center">
                <span className="text-2xs text-surface-400 uppercase font-bold">{p}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
