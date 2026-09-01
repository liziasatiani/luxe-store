const BRANDS = [
  { name: "Charlotte Tilbury", size: 20, weight: 600 },
  { name: "La Mer", size: 20, weight: 600 },
  { name: "Sony", size: 20, weight: 600 },
  { name: "Apple", size: 17, weight: 400 },
  { name: "Chanel", size: 17, weight: 400 },
  { name: "Fenty Beauty", size: 17, weight: 400 },
  { name: "Samsung", size: 17, weight: 400 },
  { name: "Dior", size: 17, weight: 400 },
  { name: "Dyson", size: 17, weight: 400 },
  { name: "GHD", size: 17, weight: 400 },
];

export function TheHousesSection() {
  return (
    <section
      style={{
        padding: "60px 0",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="wrap">
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
            fontFamily: "var(--font-mulish)",
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--chalk3)",
          }}
        >
          The Houses
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px 44px",
          }}
        >
          {BRANDS.map((b) => (
            <span
              key={b.name}
              style={{
                fontFamily: "var(--font-spectral)",
                fontSize: b.size,
                fontWeight: b.weight,
                color: b.weight === 600 ? "var(--chalk2)" : "var(--chalk3)",
                letterSpacing: "0.01em",
                transition: "color 0.2s",
                cursor: "default",
              }}
            >
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
