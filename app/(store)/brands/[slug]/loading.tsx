export default function BrandLoading() {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 48 }}>
        <div style={{ width: 64, height: 64, background: "var(--s2)", border: "1px solid var(--border)", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 24, width: 180, background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 14, width: 240, background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="lg-grid-4">
        <style>{`@media(min-width:1024px){.lg-grid-4{grid-template-columns:repeat(4,1fr);}}`}</style>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ aspectRatio: "1", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "75%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "50%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
