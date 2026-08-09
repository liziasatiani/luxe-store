export default function Loading() {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }} className="md-grid-4">
        <style>{`@media(min-width:768px){.md-grid-4{grid-template-columns:repeat(4,1fr);}}`}</style>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, border: "1px solid var(--border)" }}>
            <div style={{ aspectRatio: "1", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 10, width: "60%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 14, width: "90%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 16, width: "40%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
