export function StatsSection() {
  const stats = [
    { value: "2,400+", label: "Tech Products",      cls: "gold" },
    { value: "1,800+", label: "Beauty Items",        cls: "gold" },
    { value: "48h",    label: "Tbilisi Delivery",    cls: "chalk" },
    { value: "30",     label: "Day Returns",         cls: "chalk" },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4"
      style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="py-8 px-10 md:py-8 md:px-11"
          style={{
            borderRight: i < 3 ? "1px solid rgba(239,233,218,0.08)" : undefined,
            borderBottom: i < 2 ? "1px solid rgba(239,233,218,0.08)" : undefined,
          }}
        >
          <div
            className="font-sans text-[44px] font-bold leading-none tracking-[-0.03em] mb-1.5"
            style={{ color: s.cls === "gold" ? "#C9A44A" : "#EFE9DA" }}
          >
            {s.value}
          </div>
          <div className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: "rgba(239,233,218,0.55)" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
