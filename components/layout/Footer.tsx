import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  const FOOTER_LINKS = {
    [t("shop")]: [
      { label: t("beauty"),      href: "/beauty"  },
      { label: t("tech"),        href: "/tech"    },
      { label: t("brands"),      href: "/brands"  },
      { label: t("deals"),       href: "/deals"   },
      { label: t("newArrivals"), href: "/new"     },
      { label: t("bestSellers"), href: "/best"    },
    ],
    [t("help")]: [
      { label: t("faq"),         href: "/faq"          },
      { label: t("contact"),     href: "/contact"      },
      { label: t("shipping"),    href: "/shipping"     },
      { label: t("returns"),     href: "/returns"      },
      { label: t("trackOrder"),  href: "/track-order"  },
    ],
    [t("company")]: [
      { label: t("about"),       href: "/about"        },
      { label: t("privacy"),     href: "/privacy"      },
      { label: t("terms"),       href: "/terms"        },
      { label: t("sitemap"),     href: "/sitemap-page" },
    ],
  };

  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebook  = process.env.NEXT_PUBLIC_FACEBOOK_URL;

  return (
    <footer className="bg-surface-950 text-surface-300">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-3xl text-white">
                Luxe<span className="text-brand-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs mb-6">
              Your destination for luxury beauty and premium tech. Curated collections from the world's most coveted brands.
            </p>
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
            <div className="flex items-center gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Facebook size={18} />
                </a>
              )}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-surface-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-surface-800">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Luxe Store. {t("allRights")}
          </p>
          <div className="flex items-center gap-2">
            {["VISA", "MC", "AMEX", "PAYPAL"].map((p) => (
              <div key={p} className="h-6 px-2 rounded bg-surface-800 flex items-center">
                <span className="text-xs text-surface-400 uppercase font-bold">{p}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
