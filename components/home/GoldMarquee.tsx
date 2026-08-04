"use client";

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
      className="h-[50px] overflow-hidden flex items-center"
      style={{
        background: "rgba(201,164,74,0.07)",
        borderTop: "1px solid rgba(201,164,74,0.18)",
        borderBottom: "1px solid rgba(201,164,74,0.18)",
      }}
    >
      <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display italic px-9 text-[13px]" style={{ color: "rgba(201,164,74,0.85)" }}>
              {item}
            </span>
            <span className="text-[8px]" style={{ color: "rgba(201,164,74,0.4)" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
