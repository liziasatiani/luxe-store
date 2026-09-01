import Link from "next/link";

const HeadphoneIcon = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="rgba(78,201,192,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const LeafIcon = () => (
  <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,92,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const EDIT_ITEMS = [
  {
    href: "/beauty",
    gridRow: "span 2" as const,
    imageStyle: {
      flex: 1,
      minHeight: 620,
      background: "linear-gradient(155deg,#2d0d3d 0%,#4a1a60 45%,#1a1045 100%)",
    },
    imageOverlay: "radial-gradient(ellipse 70% 60% at 30% 30%,rgba(255,92,122,0.28),transparent)",
    badge: { label: "−20% · Limited", bg: "var(--crimson)", color: "#fff" },
    brandColor: "var(--gold)",
    brand: "Charlotte Tilbury",
    name: "Hollywood Flawless Filter",
    description: "The glow-giving complexion booster worn by everyone from editors to red-carpet regulars. Buildable, blurring, extraordinary.",
    price: "₾189",
    originalPrice: "₾236",
    icon: <span style={{ fontSize: 88, lineHeight: 1, position: "relative" as const, zIndex: 1, color: "rgba(255,255,255,0.7)" }}>✦</span>,
  },
  {
    href: "/tech",
    imageStyle: { height: 300, background: "linear-gradient(145deg,#0a2035 0%,#0f3555 50%,#082840 100%)" },
    imageOverlay: "radial-gradient(ellipse 60% 50% at 70% 20%,rgba(78,201,192,0.30),transparent)",
    badge: { label: "New Drop", bg: "var(--gold)", color: "#000" },
    brandColor: "var(--blue)",
    brand: "Sony",
    name: "WH-1000XM5 Headphones",
    price: "₾1,089",
    icon: <span style={{ position: "relative" as const, zIndex: 1 }}><HeadphoneIcon /></span>,
  },
  {
    href: "/beauty",
    imageStyle: { height: 300, background: "linear-gradient(145deg,#2a1400 0%,#3d2000 50%,#1a1800 100%)" },
    imageOverlay: "radial-gradient(ellipse 60% 50% at 30% 70%,rgba(212,168,92,0.28),transparent)",
    brandColor: "var(--gold)",
    brand: "La Mer",
    name: "The Soft Cream",
    price: "₾489",
    icon: <span style={{ position: "relative" as const, zIndex: 1 }}><LeafIcon /></span>,
  },
];

export function TheEditSection() {
  const [featured, ...rest] = EDIT_ITEMS;

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
            href={featured.href}
            className="glass-card edit-featured"
            style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div
              style={{
                ...featured.imageStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: featured.imageOverlay }} />
              {featured.icon}
              {featured.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    fontFamily: "var(--font-mulish)",
                    fontSize: 8,
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    background: featured.badge.bg,
                    color: featured.badge.color,
                    padding: "4px 10px",
                    borderRadius: 2,
                  }}
                >
                  {featured.badge.label}
                </div>
              )}
            </div>
            <div style={{ padding: "24px 26px 28px" }}>
              <div
                style={{
                  fontFamily: "var(--font-mulish)",
                  fontSize: 8,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: featured.brandColor,
                  marginBottom: 6,
                  opacity: 0.85,
                }}
              >
                {featured.brand}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-spectral)",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--chalk)",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                {featured.name}
              </div>
              {featured.description && (
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    color: "var(--chalk2)",
                    lineHeight: 1.7,
                    marginBottom: 18,
                    letterSpacing: "0.01em",
                  }}
                >
                  {featured.description}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 500, color: "var(--chalk)" }}>{featured.price}</span>
                  {featured.originalPrice && (
                    <span style={{ fontSize: 11, color: "var(--chalk2)", textDecoration: "line-through", marginLeft: 6 }}>
                      {featured.originalPrice}
                    </span>
                  )}
                </div>
                <span className="btn-cart" style={{ fontSize: 9, padding: "7px 16px", borderRadius: 2 }}>
                  Shop Now
                </span>
              </div>
            </div>
          </Link>

          {/* Smaller cards */}
          {rest.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="glass-card"
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  ...item.imageStyle,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: item.imageOverlay }} />
                {item.icon}
                {item.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      fontFamily: "var(--font-mulish)",
                      fontSize: 7,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: item.badge.bg,
                      color: item.badge.color,
                      padding: "3px 8px",
                      borderRadius: 2,
                    }}
                  >
                    {item.badge.label}
                  </div>
                )}
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mulish)",
                    fontSize: 8,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: item.brandColor,
                    marginBottom: 5,
                    opacity: 0.85,
                  }}
                >
                  {item.brand}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-spectral)",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--chalk)",
                    marginBottom: 10,
                  }}
                >
                  {item.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: "var(--chalk)" }}>{item.price}</span>
                  <span className="btn-cart" style={{ fontSize: 9, padding: "7px 16px", borderRadius: 2 }}>
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
