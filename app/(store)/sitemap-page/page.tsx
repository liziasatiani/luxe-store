export const revalidate = 3600;
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Sitemap", noIndex: true, locale });
}

export default async function SitemapPage() {
  const [t, tn, tc] = await Promise.all([
    getTranslations("pages.sitemap"),
    getTranslations("nav"),
    getTranslations("home.categories"),
  ]);

  const SECTIONS = [
    {
      title: t("sectionShop"),
      links: [
        { label: tn("beauty"),      href: "/beauty"              },
        { label: tc("skincare"),    href: "/beauty/skincare"     },
        { label: tc("makeup"),      href: "/beauty/makeup"       },
        { label: tc("hairCare"),    href: "/beauty/hair-care"    },
        { label: tc("bodyCare"),    href: "/beauty/body-care"    },
        { label: tc("perfume"),     href: "/beauty/perfume"      },
        { label: tc("beautyTools"), href: "/beauty/beauty-tools" },
        { label: tn("tech"),        href: "/tech"                },
        { label: tc("headphones"),  href: "/tech/headphones"     },
        { label: tc("cameras"),     href: "/tech/cameras"        },
        { label: tc("tablets"),     href: "/tech/tablets"        },
        { label: tc("gaming"),      href: "/tech/gaming"         },
        { label: tc("wearables"),   href: "/tech/wearables"      },
        { label: tc("smartHome"),   href: "/tech/smart-home"     },
        { label: tc("audio"),       href: "/tech/audio"          },
        { label: tc("accessories"), href: "/tech/accessories"    },
      ],
    },
    {
      title: t("sectionDiscover"),
      links: [
        { label: tn("new"),    href: "/new"      },
        { label: tn("deals"),  href: "/deals"    },
        { label: tn("brands"), href: "/brands"   },
      ],
    },
    {
      title: t("sectionAccount"),
      links: [
        { label: tn("signIn"),    href: "/login"             },
        { label: tn("myAccount"), href: "/account"           },
        { label: tn("orders"),    href: "/account/orders"    },
        { label: tn("wishlist"),  href: "/wishlist"          },
      ],
    },
    {
      title: t("sectionHelp"),
      links: [
        { label: "FAQ",     href: "/faq"      },
        { label: "Contact", href: "/contact"  },
        { label: "Shipping", href: "/shipping" },
        { label: "Returns",  href: "/returns"  },
      ],
    },
    {
      title: t("sectionCompany"),
      links: [
        { label: "About",   href: "/about"   },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms",   href: "/terms"   },
      ],
    },
  ];

  return (
    <>
      <style>{`
        .sitemap-link { font-size: 13px; color: var(--chalk3); text-decoration: none; transition: color 0.15s; }
        .sitemap-link:hover { color: var(--chalk); }
      `}</style>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">{t("subtitle")}</h1>
        </div>
      </div>
      <div style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "48px 32px" }}>
            {SECTIONS.map(section => (
              <div key={section.title}>
                <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  {section.title}
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {section.links.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="sitemap-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
