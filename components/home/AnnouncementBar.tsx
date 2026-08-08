"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function AnnouncementBar() {
  const t = useTranslations("nav");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    t("announcement"),
    "Free shipping on orders over $150",
    "New arrivals every week",
    t("announcement"),
    "Free shipping on orders over $150",
    "New arrivals every week",
  ];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[201] h-8 overflow-hidden border-b border-white/[0.06] transition-transform duration-400 ease-[cubic-bezier(.4,0,.2,1)] ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ background: "transparent" }}
    >
      <div className="flex items-center h-full">
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-8 text-[10px] tracking-[0.22em] uppercase text-white/60">
              <span>{item}</span>
              <span className="text-white/20">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
