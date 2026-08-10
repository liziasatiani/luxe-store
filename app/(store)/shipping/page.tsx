import { buildMetadata } from "@/lib/seo";
import { Truck, Clock, Globe, Package } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.shipping"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function ShippingPage() {
  const t = await getTranslations("pages.shipping");
  const cards = [
    { icon: Truck,   label: t("freeShipping"),  desc: t("freeShippingDesc") },
    { icon: Clock,   label: t("standard"),       desc: t("standardDesc")     },
    { icon: Package, label: t("express"),        desc: t("expressDesc")      },
    { icon: Globe,   label: t("international"),  desc: t("internationalDesc")},
  ];
  const sections = [
    { titleKey: "processingTitle",        contentKey: "processingContent"        },
    { titleKey: "domesticTitle",          contentKey: "domesticContent"          },
    { titleKey: "internationalTitle",     contentKey: "internationalContent"     },
    { titleKey: "dutiesTitle",            contentKey: "dutiesContent"            },
    { titleKey: "beautyRestrictionsTitle",contentKey: "beautyRestrictionsContent"},
    { titleKey: "techRestrictionsTitle",  contentKey: "techRestrictionsContent"  },
    { titleKey: "trackingTitle",          contentKey: "trackingContent"          },
    { titleKey: "lostTitle",              contentKey: "lostContent"              },
  ] as const;
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">{t("subtitle")}</h1>
        </div>
      </div>

      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: "1px solid var(--border)", marginBottom: 56 }}>
            {cards.map(item => (
              <div key={item.label} style={{ padding: "28px 20px", textAlign: "center", background: "var(--s1)", borderRight: "1px solid var(--border)" }}>
                <item.icon size={20} style={{ color: "var(--gold)", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--chalk)", letterSpacing: "0.06em", marginBottom: 6 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--chalk3)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {sections.map(section => (
              <div key={section.titleKey} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--chalk)", marginBottom: 12, letterSpacing: "0.02em" }}>{t(section.titleKey)}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{t(section.contentKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
