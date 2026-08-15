import { getTranslations, getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Cookie Policy", description: "How Everything Street uses cookies and how you can manage them.", locale });
}

export default async function CookiePolicyPage() {
  const t = await getTranslations("pages.cookiePolicy");

  const sections = [
    { titleKey: "s1Title", contentKey: "s1Content" },
    { titleKey: "s2Title", contentKey: "s2Content" },
    { titleKey: "s3Title", contentKey: "s3Content" },
    { titleKey: "s4Title", contentKey: "s4Content" },
    { titleKey: "s5Title", contentKey: "s5Content" },
    { titleKey: "s6Title", contentKey: "s6Content" },
    { titleKey: "s7Title", contentKey: "s7Content" },
  ] as const;

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">{t("eyebrow")}</p>
          <h1 className="page-hd-title">{t("title")}</h1>
          <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 8, letterSpacing: "0.08em" }}>{t("updated")}</p>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
            {t("intro")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {sections.map(s => (
              <div key={s.titleKey} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 700, color: "var(--chalk)", marginBottom: 12, letterSpacing: "0.02em" }}>{t(s.titleKey)}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.85, whiteSpace: "pre-line" }}>{t(s.contentKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
