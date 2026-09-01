"use client";
import { useState } from "react";

interface Props {
  description?: string | null;
  howToUse?: string | null;
  ingredients?: string | null;
  inTheBox?: string | null;
  reviewCount: number;
  labels: {
    description: string;
    howToUse: string;
    ingredients: string;
    inTheBox: string;
    reviews: string;
  };
}

export function ProductDetailTabs({ description, howToUse, ingredients, inTheBox, reviewCount, labels }: Props) {
  const tabs = [
    { id: "description", label: labels.description, content: description },
    { id: "howtouse",    label: labels.howToUse,    content: howToUse },
    { id: "ingredients", label: labels.ingredients,  content: ingredients },
    { id: "inthebox",    label: labels.inTheBox,     content: inTheBox },
    { id: "reviews",     label: `${labels.reviews} (${reviewCount})`, isLink: true },
  ].filter(t => t.content || t.isLink);

  const [active, setActive] = useState(tabs.find(t => !t.isLink)?.id ?? "description");

  if (tabs.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", overflowX: "auto", marginBottom: 22 }}>
        {tabs.map(tab => {
          const isActive = !tab.isLink && active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isLink) {
                  document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  setActive(tab.id);
                }
              }}
              style={{
                padding: "11px 18px",
                border: "none",
                background: "none",
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? "var(--gold)" : "var(--chalk2)",
                borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "var(--sans)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.filter(t => !t.isLink).map(tab => (
        <div key={tab.id} style={{ display: active === tab.id ? "block" : "none" }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.85, whiteSpace: "pre-line", letterSpacing: "0.01em", maxWidth: 560 }}>
            {tab.content}
          </p>
        </div>
      ))}
    </div>
  );
}
