export function BrandStatement() {
  return (
    <section
      style={{
        padding: "120px 40px",
        background: "var(--s2)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(212,168,92,0.10), transparent)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--sans)",
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.30em",
            textTransform: "uppercase" as const,
            color: "var(--chalk3)",
            marginBottom: 40,
          }}
        >
          Everything Street · Tbilisi
        </div>
        <blockquote
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(36px, 5.5vw, 72px)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.02,
            color: "var(--chalk)",
            marginBottom: 48,
            letterSpacing: "-0.01em",
          }}
        >
          &ldquo;From Tbilisi,<br />to everywhere.&rdquo;
        </blockquote>
        <div
          style={{
            width: 48,
            height: 1,
            background: "rgba(212,168,92,0.5)",
            margin: "0 auto 28px",
          }}
        />
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "var(--chalk2)",
            lineHeight: 1.8,
            maxWidth: 440,
            margin: "0 auto",
            letterSpacing: "0.01em",
          }}
        >
          Premium beauty and technology, curated by people who care. Delivered in 48 hours across Georgia — authentic, always.
        </p>
      </div>
    </section>
  );
}
