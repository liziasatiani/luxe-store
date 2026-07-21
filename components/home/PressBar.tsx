"use client";
import { useEffect, useRef } from "react";

export function PressBar() {
  const signals = [
    "Free 30-Day Returns",
    "100% Authentic",
    "Secure Checkout",
    "Free Shipping Over ₾200",
    "Authorized Distributors Only",
    "Customer Support 7 Days",
  ];

  const items = [...signals, ...signals, ...signals];

  return (
    <div
      style={{ overflow: "clip", position: "relative" }}
      className="border-y border-black/8 dark:border-white/8 bg-white dark:bg-black py-3"
    >
      <style>{`
        @keyframes pressbar-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .pressbar-track {
          display: flex;
          width: max-content;
          animation: pressbar-scroll 30s linear infinite;
          will-change: transform;
        }
        .pressbar-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="pressbar-track">
        {items.map((text, i) => (
          <span
            key={i}
            className="text-[10px] tracking-[0.16em] uppercase font-medium whitespace-nowrap shrink-0 px-8"
            style={{ color: "#b68235" }}
          >
            ✦ {text}
          </span>
        ))}
      </div>
    </div>
  );
}
