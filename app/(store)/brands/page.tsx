export const revalidate = 3600;
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Brands", description: "Explore all luxury beauty and premium tech brands at Everything Street.", locale });
}

export default async function BrandsPage() {
  const t = await getTranslations("pages.brands");
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { name: true, slug: true, description: true, logo: true, website: true, _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  const BEAUTY = ["La Mer","Charlotte Tilbury","Drunk Elephant","NARS","Tatcha","Dior Beauty","Chanel Beauty","YSL Beauty","Tom Ford Beauty","Sulwhasoo","Sisley Paris","Augustinus Bader","Dyson Beauty","FOREO","GHD","Creed","Jo Malone","Maison Margiela"];
  const beautyBrands = brands.filter(b => BEAUTY.includes(b.name));
  const techBrands   = brands.filter(b => !beautyBrands.includes(b));

  const groups = [
    { title: t("beautyBrands"), items: beautyBrands },
    { title: t("techBrands"),   items: techBrands   },
  ];

  return (
    <>
      <style>{`.brand-card-link:hover { background: var(--s2) !important; }`}</style>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("allBrands")}</p>
          <h1 className="page-hd-title">{t("allBrandsSubtitle")}</h1>
        </div>
      </div>

      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap">
          {groups.map(group => (
            <div key={group.title} style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--chalk)", letterSpacing: "0.02em" }}>{group.title}</h2>
                <span style={{ fontSize: 11, color: "var(--chalk3)", letterSpacing: "0.08em" }}>{group.items.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 1, border: "1px solid var(--border)" }}>
                {group.items.map(brand => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="brand-card-link"
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      padding: "24px 16px", background: "var(--s1)", textDecoration: "none",
                      textAlign: "center", transition: "background 0.15s", borderRight: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ width: 40, height: 40, border: "1px solid var(--borderg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "var(--chalk2)" }}>{brand.name[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--chalk)", letterSpacing: "0.04em", lineHeight: 1.3 }}>{brand.name}</p>
                      <p style={{ fontSize: 10, color: "var(--chalk3)", marginTop: 3, letterSpacing: "0.06em" }}>{brand._count.products} {t("products")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
