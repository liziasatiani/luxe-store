const ITEMS = [
  "Free 48h Delivery in Tbilisi",
  "100% Authentic Products",
  "30-Day Returns",
  "Secure Checkout",
  "New Arrivals Weekly",
  "Exclusive Brand Drops",
];

export function GoldMarquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        background: "var(--gold3)",
        borderTop: "1px solid var(--borderg)",
        borderBottom: "1px solid var(--borderg)",
        height: 50,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", animation: "mq 32s linear infinite", whiteSpace: "nowrap" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{ padding: "0 36px", fontFamily: "var(--serif)", fontSize: 13, fontWeight: 400, fontStyle: "italic", color: "var(--gold)", opacity: 0.85 }}>
              {item}
            </span>
            <span style={{ fontStyle: "normal", fontSize: 8, opacity: 0.4, color: "var(--gold)" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
