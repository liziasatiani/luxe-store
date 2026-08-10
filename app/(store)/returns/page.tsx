import { buildMetadata } from "@/lib/seo";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.returns"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function ReturnsPage() {
  const t = await getTranslations("pages.returns");
  const sections = [
    { titleKey: "overviewTitle",       contentKey: "overviewContent"       },
    { titleKey: "beautyTitle",         contentKey: "beautyContent"         },
    { titleKey: "techTitle",           contentKey: "techContent"           },
    { titleKey: "howToTitle",          contentKey: "howToContent"          },
    { titleKey: "refundTitle",         contentKey: "refundContent"         },
    { titleKey: "shippingCostsTitle",  contentKey: "shippingCostsContent"  },
    { titleKey: "damagedTitle",        contentKey: "damagedContent"        },
    { titleKey: "internationalTitle",  contentKey: "internationalContent"  },
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
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {sections.map(s => (
              <div key={s.titleKey} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--chalk)", marginBottom: 12, letterSpacing: "0.02em" }}>{t(s.titleKey)}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{t(s.contentKey)}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, padding: "24px 28px", border: "1px solid var(--gold)", background: "var(--s1)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t("needHelp")}</p>
            <p style={{ fontSize: 13, color: "var(--chalk2)" }}>
              Contact{" "}
              <a href="mailto:returns@everythingstreet.ge" style={{ color: "var(--chalk)", textDecoration: "underline" }}>
                returns@everythingstreet.ge
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
