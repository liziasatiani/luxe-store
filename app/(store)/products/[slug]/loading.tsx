export default function ProductLoading() {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }} className="lg-grid-2">
        <style>{`@media(min-width:1024px){.lg-grid-2{grid-template-columns:1fr 1fr;}}`}</style>
        <div style={{ aspectRatio: "1", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
          <div style={{ height: 10, width: 80, background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 28, width: "75%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 20, width: "40%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 80, width: "100%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 48, width: "100%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite", marginTop: 8 }} />
          <div style={{ height: 48, width: "100%", background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
