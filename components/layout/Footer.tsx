import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
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
    <footer className="bg-black text-white/40">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-white/8 pb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-2xl tracking-[0.14em] uppercase text-white">Everything Street</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Considered technology. Considered beauty. Curated, tested, and delivered together.
            </p>
            <a href="mailto:hello@everythingstreet.com" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6">
              <Mail size={14} />
              hello@everythingstreet.com
            </a>
            <div className="flex items-center gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-colors">
                  <Instagram size={14} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-colors">
                  <Facebook size={14} />
                </a>
              )}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-white mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[12px] tracking-wide text-white/40 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] tracking-[0.06em] text-white/25">
          © {new Date().getFullYear()} Everything Street. {t("allRights")}
        </p>
        <div className="flex items-center gap-3">
          {["VISA", "MC", "AMEX", "PAYPAL"].map((p) => (
            <span key={p} className="text-[10px] tracking-[0.1em] uppercase text-white/25">{p}</span>
          ))}
        </div>
      </Container>
    </footer>
  );
}
