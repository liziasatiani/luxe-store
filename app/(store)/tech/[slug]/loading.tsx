export default function TechSubcategoryLoading() {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ height: 28, width: 180, background: "var(--s2)", marginBottom: 32, animation: "pulse 1.5s ease-in-out infinite" }} />
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
