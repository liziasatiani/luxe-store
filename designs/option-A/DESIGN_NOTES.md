# Option A — "Editorial Authority" Design Notes

## Concept
A luxury magazine that happens to sell things. The site positions Everything Street as Georgia's authoritative voice on premium tech and beauty — not just a retailer, but a curator. Think Monocle or Wallpaper* if they had a shop.

---

## Typography

### Cormorant Garamond (Display)
- **Why:** Has genuine literary character — warm, humanist, cuts through generic e-commerce. Its italic is exceptionally beautiful and used for the brand's "other voice" (gold subheadings, caption text). Georgian users respond positively to serif type — it aligns with the literary tradition.
- **Usage:** Brand name, section headers, product names on cards, hero headline (English version), beauty editorial title
- **Do not use for:** Prices, navigation links, body copy under 14px

### Barlow (Body/UI)
- **Why:** Slightly condensed, excellent at tracking — reads as considered, not generic. Not Inter. Works beautifully at 11px with 0.14em letter-spacing for nav labels.
- **Usage:** All navigation, body copy, prices, buttons, announcement bar
- **Weight:** 300 for body, 400 for UI elements, 500 for labels

### Noto Sans Georgian
- **Why:** Most reliable Georgian web font. Clean, doesn't conflict with Cormorant's style.
- **Usage:** Georgian headlines only. Let it be big — the script has its own beauty.

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Parchment | `#F2F0EB` | Page background — warm, not clinical white |
| Ink | `#111110` | Primary text, buttons, nav, footer bg |
| Gold (aged) | `#8B6F38` | Section markers, accents, gold text — NEVER overused |
| Gold (light) | `#C9A96E` | On dark backgrounds — footer stats, beauty section |
| Border | `#D4D1C7` | Dividers, card outlines |
| Muted | `#767570` | Secondary text, breadcrumbs |

### Rules
- Gold appears no more than 3 times per viewport
- Dark sections (`--ink` bg) are used sparingly — 1-2 per page — to create visual contrast
- Product cards are always `#FFFFFF` against the parchment background

---

## Layout System
- Max content width: 1400px
- Grid: CSS Grid with named editorial modules, NOT a uniform column system
- Section whitespace: `padding-block: 8vw` on major sections (scales with viewport)
- Card grid: intentionally asymmetric — 7:5 ratio for hero row, 4:4:4 for secondary

---

## Component Library Recommendations
- **Base:** Radix UI primitives (accessible dialog, select, dropdown)
- **Forms:** react-hook-form + zod (already in stack)
- **Animations:** Framer Motion for card hover reveals, section entrances
- **Icons:** Lucide (already in stack) — use `stroke-width: 1.5` always

---

## Animation Recommendations
1. **Card image scale:** `transform: scale(1.04)` on hover, `transition: 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)` — slow enough to feel expensive
2. **Button transitions:** `0.25s ease` — color and background
3. **Section reveals:** Framer Motion `viewport: { once: true, amount: 0.2 }` with `y: 24, opacity: 0` → `y: 0, opacity: 1`
4. **Brand marquee:** CSS `animation: marquee 30s linear infinite` — pause on hover

---

## Build Priority (if this moves to production)
1. Navigation system — sticky horizontal nav with category links (replaces hamburger on desktop)
2. Hero section with editorial image + typography
3. Product card component with the editorial info hierarchy
4. Magazine-style editorial grid (the 7:5 + 4:4:4 layout)
5. Dark editorial module (beauty section on dark background)
6. Brand marquee
7. Newsletter section
8. Footer

---

## What Makes This Direction Unique
- No hamburger menu on desktop — categories always visible and named
- Section headers styled as magazine "chapter" markers (Vol. 1, Chapter II)
- Georgian script is treated as typographic art, not just localisation
- Whitespace is structural, not decorative — modular rhythm creates authority
- Gold is aged and restrained, never flashy — signals old money not new

---

## Best For
Georgian customers aged 28-50 who respond to cultural authority and editorial curation. Users who want to feel they're buying from *the* source, not just a store.
