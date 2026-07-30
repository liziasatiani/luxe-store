import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({ title: "Sitemap", noIndex: true });

const SECTIONS = [
  {
    title: "Shop",
    links: [
      { label: "All Beauty",    href: "/beauty"   },
      { label: "Skincare",      href: "/beauty/skincare"     },
      { label: "Makeup",        href: "/beauty/makeup"       },
      { label: "Hair Care",     href: "/beauty/hair-care"    },
      { label: "Body Care",     href: "/beauty/body-care"    },
      { label: "Perfume",       href: "/beauty/perfume"      },
      { label: "Beauty Tools",  href: "/beauty/beauty-tools" },
      { label: "All Tech",      href: "/tech"     },
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
      { label: "New Arrivals",  href: "/new"       },
      { label: "Best Sellers",  href: "/best"      },
      { label: "Featured",      href: "/featured"  },
      { label: "Deals & Sales", href: "/deals"     },
      { label: "All Brands",    href: "/brands"    },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In",       href: "/login"             },
      { label: "Create Account",href: "/register"          },
      { label: "My Account",    href: "/account"           },
      { label: "My Orders",     href: "/account/orders"    },
      { label: "My Addresses",  href: "/account/addresses" },
      { label: "My Wishlist",   href: "/wishlist"          },
      { label: "Track Order",   href: "/track-order"       },
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
      { label: "About Us",      href: "/about"   },
      { label: "Privacy Policy",href: "/privacy" },
      { label: "Terms of Use",  href: "/terms"   },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Sitemap</h1>
          <p className="text-surface-500">Find everything on Luxe Store</p>
        </Container>
      </div>
      <Container className="py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="font-semibold text-surface-900 dark:text-white mb-5 text-sm uppercase tracking-wider">{section.title}</h2>
              <ul className="space-y-3">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-surface-500 hover:text-brand-500 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
