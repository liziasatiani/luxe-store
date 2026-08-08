import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import { Container } from "@/components/ui";
import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export async function Footer() {
  const t  = await getTranslations("footer");
  const tn = await getTranslations("home.newsletter");

  const FOOTER_LINKS = {
    [t("shop")]: [
      { label: t("beauty"),      href: "/beauty"       },
      { label: t("tech"),        href: "/tech"          },
      { label: t("brands"),      href: "/brands"        },
      { label: t("deals"),       href: "/deals"         },
      { label: t("newArrivals"), href: "/new"           },
      { label: t("bestSellers"), href: "/best"          },
    ],
    [t("help")]: [
      { label: t("faq"),         href: "/faq"           },
      { label: t("contact"),     href: "/contact"       },
      { label: t("shipping"),    href: "/shipping"      },
      { label: t("returns"),     href: "/returns"       },
      { label: t("trackOrder"),  href: "/track-order"   },
    ],
    [t("company")]: [
      { label: t("about"),       href: "/about"         },
      { label: t("privacy"),     href: "/privacy"       },
      { label: t("terms"),       href: "/terms"         },
      { label: t("sitemap"),     href: "/sitemap-page"  },
    ],
  };

  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebook  = process.env.NEXT_PUBLIC_FACEBOOK_URL;

  return (
    <footer className="bg-surface-950" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      {/* ── Newsletter — full-width editorial ── */}
      <div className="border-t border-white/8 overflow-hidden">
        <Container className="pt-20 pb-16">

          {/* Eyebrow */}
          <p className="text-[9px] tracking-[0.32em] uppercase text-white/25 mb-8 text-center">
            {tn("badge")}
          </p>

          {/* Giant display headline */}
          <h2
            className="font-display font-light text-white text-center leading-[1] mb-14 uppercase"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", letterSpacing: "-0.01em" }}
          >
            {tn("title")}
          </h2>

          {/* Minimal centered form */}
          <div className="max-w-lg mx-auto">
            <NewsletterForm minimal />
          </div>

        </Container>

        {/* Full-width hairline rule */}
        <div className="border-t border-white/8" />
      </div>

      {/* ── Links grid ── */}
      <Container className="py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-2 pr-0 md:pr-8">
            <Link href="/" className="inline-block mb-7">
              <span className="font-display text-[21px] font-bold tracking-[0.02em] text-white/90">
                Everything <em className="not-italic italic font-bold" style={{ color: "#C9A44A" }}>Street</em>
              </span>
            </Link>
            <p className="text-[12px] leading-[1.8] text-white/35 mb-7 max-w-[220px]">
              {t("tagline")}
            </p>
            <a
              href="mailto:hello@everythingstreet.ge"
              className="flex items-center gap-2 text-[11px] tracking-[0.04em] text-white/35 hover:text-white/70 transition-colors mb-7"
            >
              <Mail size={12} />
              hello@everythingstreet.ge
            </a>
            <div className="flex items-center gap-2">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-7 h-7 border border-white/12 flex items-center justify-center text-white/35 hover:text-white/80 hover:border-white/30 transition-colors">
                  <Instagram size={12} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-7 h-7 border border-white/12 flex items-center justify-center text-white/35 hover:text-white/80 hover:border-white/30 transition-colors">
                  <Facebook size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[9px] tracking-[0.22em] uppercase text-white/50 mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] leading-none text-white/30 hover:text-white/70 transition-colors"
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

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.06em] text-white/20">
            © {new Date().getFullYear()} Everything Street. {t("allRights")}
          </p>
          <div className="flex items-center gap-4">
            {["VISA", "MC", "AMEX", "PAYPAL", "GEO CARD"].map((p) => (
              <span key={p} className="text-[9px] tracking-[0.12em] uppercase text-white/20">{p}</span>
            ))}
          </div>
        </Container>
      </div>

    </footer>
  );
}
