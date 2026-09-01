import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

const BEAUTY_CATS = ["skincare", "makeup", "hair-care", "body-care", "perfume", "beauty-tools", "beauty"];
const TECH_CATS = ["headphones", "cameras", "tablets", "gaming", "wearables", "smart-home", "audio", "accessories"];

async function getEditProducts() {
  const [beautyRows, techRows] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: { in: BEAUTY_CATS } },
        images: { some: { isPrimary: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }, { ratingAvg: "desc" }],
      take: 6,
      select: {
        id: true, name: true, slug: true, price: true, comparePrice: true,
        description: true, isFeatured: true, isOnSale: true,
        brand: { select: { name: true } },
        category: { select: { slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: { in: TECH_CATS } },
        images: { some: { isPrimary: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }, { ratingAvg: "desc" }],
      take: 3,
      select: {
        id: true, name: true, slug: true, price: true, comparePrice: true,
        description: true, isFeatured: true, isOnSale: true,
        brand: { select: { name: true } },
        category: { select: { slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
      },
    }),
  ]);

  const beauty = serializeDecimal(beautyRows) as unknown as typeof beautyRows;
  const tech = serializeDecimal(techRows) as unknown as typeof techRows;

  const featured = beauty[0];
  const second = tech[0] ?? beauty[1];
  const third = beauty[1] ?? tech[1];

  return [featured, second, third].filter(Boolean);
}

function formatPrice(p: number) {
  return `₾${Number(p).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function firstSentence(text: string | null) {
  if (!text) return null;
  return text.split(/[.!?]/)[0].trim();
}

export async function TheEditSection() {
  let items: Awaited<ReturnType<typeof getEditProducts>>;
  try {
    items = await getEditProducts();
  } catch {
    return null;
  }

  if (items.length === 0) return null;

  const [featured, ...rest] = items;
  const isFeaturedBeauty = BEAUTY_CATS.some(s => featured.category?.slug?.includes(s));
  const brandAccentFeatured = isFeaturedBeauty ? "var(--crimson)" : "var(--blue)";

  return (
    <section className="py-20">
      <div className="wrap">
        <div
          className="flex items-end justify-between pb-[22px] mb-[2px]"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <div
              className="text-[9px] font-medium tracking-[0.26em] uppercase mb-2"
              style={{ fontFamily: "var(--font-mulish)", color: "var(--gold)", opacity: 0.85 }}
            >
              Curated Selection
            </div>
            <h2
              className="text-[clamp(40px,5vw,72px)] font-normal leading-[0.94] uppercase tracking-[0.01em] italic"
              style={{ fontFamily: "var(--font-spectral)", color: "var(--chalk)" }}
            >
              The Edit
            </h2>
          </div>
          <Link
            href="/featured"
            className="text-[9px] tracking-[0.2em] uppercase mb-[6px] hover:text-brand-500 transition-colors"
            style={{ fontFamily: "var(--font-mulish)", color: "var(--chalk2)" }}
          >
            View All →
          </Link>
        </div>

        <div className="edit-grid" style={{ gap: 2, background: "rgba(238,233,255,0.04)" }}>
          {/* Large featured card */}
          <Link
            href={`/products/${featured.slug}`}
            className="glass-card edit-featured"
            style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ flex: 1, minHeight: 620, position: "relative", overflow: "hidden" }}>
              {featured.images[0]?.url ? (
                <Image
                  src={featured.images[0].url}
                  alt={featured.images[0].altText ?? featured.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width:768px) 100vw, 55vw"
                  priority
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg,#2d0d3d,#4a1a60,#1a1045)" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,10,20,0.75) 0%, transparent 50%)" }} />
              {featured.isOnSale && featured.comparePrice && (
                <div style={{ position: "absolute", top: 16, left: 16, fontFamily: "var(--font-mulish)", fontSize: 8, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--crimson)", color: "#fff", padding: "4px 10px", borderRadius: 2 }}>
                  Sale
                </div>
              )}
            </div>
            <div style={{ padding: "24px 26px 28px" }}>
              <div style={{ fontFamily: "var(--font-mulish)", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: brandAccentFeatured, marginBottom: 6, opacity: 0.85 }}>
                {featured.brand?.name}
              </div>
              <div style={{ fontFamily: "var(--font-spectral)", fontSize: 22, fontWeight: 600, color: "var(--chalk)", lineHeight: 1.1, marginBottom: 8 }}>
                {featured.name}
              </div>
              {featured.description && (
                <p style={{ fontSize: 12, fontWeight: 300, color: "var(--chalk2)", lineHeight: 1.7, marginBottom: 18, letterSpacing: "0.01em" }}>
                  {firstSentence(featured.description)}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 500, color: "var(--chalk)" }}>{formatPrice(Number(featured.price))}</span>
                  {featured.comparePrice && Number(featured.comparePrice) > Number(featured.price) && (
                    <span style={{ fontSize: 11, color: "var(--chalk2)", textDecoration: "line-through", marginLeft: 6 }}>
                      {formatPrice(Number(featured.comparePrice))}
                    </span>
                  )}
                </div>
                <span className="btn-cart" style={{ fontSize: 9, padding: "7px 16px", borderRadius: 2 }}>Shop Now</span>
              </div>
            </div>
          </Link>

          {/* Smaller cards */}
          {rest.map((item) => {
            const isTechItem = TECH_CATS.some(s => item.category?.slug?.includes(s));
            const brandAccent = isTechItem ? "var(--blue)" : "var(--gold)";
            return (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="glass-card"
                style={{ overflow: "hidden" }}
              >
                <div style={{ height: 300, position: "relative", overflow: "hidden" }}>
                  {item.images[0]?.url ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.images[0].altText ?? item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width:768px) 100vw, 35vw"
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: isTechItem ? "linear-gradient(145deg,#0a2035,#0f3555,#082840)" : "linear-gradient(145deg,#2a1400,#3d2000,#1a1800)" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,10,20,0.65) 0%, transparent 55%)" }} />
                  {item.isOnSale && (
                    <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--font-mulish)", fontSize: 7, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--gold)", color: "#000", padding: "3px 8px", borderRadius: 2 }}>
                      Sale
                    </div>
                  )}
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ fontFamily: "var(--font-mulish)", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: brandAccent, marginBottom: 5, opacity: 0.85 }}>
                    {item.brand?.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-spectral)", fontSize: 17, fontWeight: 600, color: "var(--chalk)", marginBottom: 10 }}>
                    {item.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: "var(--chalk)" }}>{formatPrice(Number(item.price))}</span>
                    <span className="btn-cart" style={{ fontSize: 9, padding: "7px 16px", borderRadius: 2 }}>Shop Now</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
