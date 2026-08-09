import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Sitemap", noIndex: true, locale });
}

const SECTIONS = [
  {
    title: "Shop",
    links: [
      { label: "All Beauty",    href: "/beauty"              },
      { label: "Skincare",      href: "/beauty/skincare"     },
      { label: "Makeup",        href: "/beauty/makeup"       },
      { label: "Hair Care",     href: "/beauty/hair-care"    },
      { label: "Body Care",     href: "/beauty/body-care"    },
      { label: "Perfume",       href: "/beauty/perfume"      },
      { label: "Beauty Tools",  href: "/beauty/beauty-tools" },
      { label: "All Tech",      href: "/tech"                },
      { label: "Headphones",    href: "/tech/headphones"     },
      { label: "Cameras",       href: "/tech/cameras"        },
      { label: "Tablets",       href: "/tech/tablets"        },
      { label: "Gaming",        href: "/tech/gaming"         },
      { label: "Wearables",     href: "/tech/wearables"      },
      { label: "Smart Home",    href: "/tech/smart-home"     },
      { label: "Audio",         href: "/tech/audio"          },
      { label: "Accessories",   href: "/tech/accessories"    },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "New Arrivals",  href: "/new"      },
      { label: "Best Sellers",  href: "/best"     },
      { label: "Featured",      href: "/featured" },
      { label: "Deals & Sales", href: "/deals"    },
      { label: "All Brands",    href: "/brands"   },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In",        href: "/login"             },
      { label: "Create Account", href: "/register"          },
      { label: "My Account",     href: "/account"           },
      { label: "My Orders",      href: "/account/orders"    },
      { label: "My Addresses",   href: "/account/addresses" },
      { label: "My Wishlist",    href: "/wishlist"          },
      { label: "Track Order",    href: "/track-order"       },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ",           href: "/faq"      },
      { label: "Contact Us",    href: "/contact"  },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns",       href: "/returns"  },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",       href: "/about"   },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use",   href: "/terms"   },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">Navigation</p>
          <h1 className="page-hd-title">Sitemap</h1>
          <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12 }}>Find everything on Everything Street</p>
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
                      <Link
                        href={link.href}
                        style={{ fontSize: 13, color: "var(--chalk3)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--chalk)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk3)")}
                      >
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
