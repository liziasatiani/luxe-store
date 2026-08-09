import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) return {};
  const locale = await getLocale();
  return buildMetadata({ title: brand.name, description: brand.description ?? `Shop all ${brand.name} products at Everything Street.`, locale });
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug, isActive: true },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  if (!brand) notFound();

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, border: "1px solid var(--borderg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)" }}>{brand.name[0]}</span>
          </div>
          <p className="page-hd-eyebrow">{brand.name}</p>
          <h1 className="page-hd-title" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>{brand.name}</h1>
          {brand.description && (
            <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12, maxWidth: 480, margin: "12px auto 0", lineHeight: 1.7 }}>{brand.description}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "var(--chalk3)", letterSpacing: "0.06em" }}>{brand._count.products} products</span>
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--gold)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                Visit Brand <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap">
          <ProductGrid filters={{ brandSlugs: [slug] }} />
        </div>
      </div>
    </>
  );
}
