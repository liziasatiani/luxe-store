# Option B — "Immersive Explorer" Design Notes

## Concept
The homepage is not a storefront — it's a world choice. Two full-screen universes, side by side. The user is invited to enter a world, not navigate a menu. Discovery happens through atmosphere, not filters. Every product has a cinematic moment.

---

## Typography

### Fraunces (Variable Display Serif)
- **Why:** A variable font with genuine personality — its "wonky" optical axis and warmth make it unmistakable. At large optical sizes (`font-optical-sizing: auto`) it reads as editorial art. Unlike Playfair or Cormorant, it feels fresh and specifically chosen, not default. The italic is genuinely beautiful.
- **Usage:** All major headings, product "moment" titles, join CTA, brand name in footer
- **Variable settings:** Let `font-optical-sizing: auto` do the work — larger text gets more expressive letterforms automatically
- **Do not use for:** Navigation pills, body copy, prices

### Outfit (Clean Sans)
- **Why:** Geometric but warm — more character than Inter, less flashy than Space Grotesk. Works at small sizes and large. The 300 weight is particularly elegant for body copy.
- **Usage:** Navigation pills, body copy, badges, footer links, announcement bar
- **Weights:** 300 body, 400 UI, 500 labels, 600 strong labels

### Noto Sans Georgian
- **Why:** Reliable Georgian web font. On dark backgrounds (most of this design), lighter weights work better.
- **Usage:** Georgian display text only — `font-weight: 300` on dark bg

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Void | `#0A0908` | Primary background — very dark, not pure black (warmth matters) |
| Surface | `#131210` | Card backgrounds, secondary surfaces |
| Surface 2 | `#1C1A17` | Hover states on dark surfaces |
| Chalk | `#F0ECE4` | Primary text — warm off-white, not pure white |
| Chalk Dim | `rgba(240,236,228,0.55)` | Secondary text, descriptions |
| Chalk Faint | `rgba(240,236,228,0.15)` | Borders, dividers |
| Sienna | `#C96442` | Primary action color — energetic, warm, readable on dark |
| Sienna Dark | `#A04F32` | Sienna hover state |
| Teal | `#3D7A6F` | Tech world color — cooler, technical |

### Rules
- Sienna: CTAs, discovery card add buttons, beauty world accents
- Teal: Tech world identity color — nav pills, tech badge borders
- Never use both sienna and teal in the same UI element
- The split hero should always feel like entering two different moods

---

## Navigation Paradigm
The floating pill nav is the signature of this direction. Key implementation notes:
- `position: fixed`, `backdrop-filter: blur(20px)` — the blurred pill feels native on iOS and premium everywhere
- On the split hero itself: no nav visible — just the brand in center. Nav appears when scrolling past the hero.
- JS enhancement: add/remove class on scroll past `100vh`
- Mobile: pill narrows to brand + two world links only

---

## Layout System
- No max-width constraint — full bleed is the identity of this direction
- "Featured moment" sections: 50/50 grid with image opposite content — alternates left/right
- Discovery scroll: horizontal overflow with `scroll-snap-type: x mandatory` — native feeling on touch devices
- The asymmetry comes from section-level contrast, not column-level

---

## Component Library Recommendations
- **Base:** Radix UI (Dialog for quick-view, HoverCard for product peek)
- **Scroll:** No library needed — native `scroll-snap` + CSS `overflow-x: auto`
- **Animations:** Framer Motion for split-hero hover (the flex expansion), scroll reveals
- **Image loading:** Next.js `<Image>` with `priority` on split hero images

---

## Animation Recommendations
1. **Split hero expansion:** CSS Flexbox transition — `flex: 1` → `flex: 1.15` on hover, `transition: flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)`
2. **Hero image parallax:** `transform: scale(1.06)` on `.split-half:hover img`, slow `0.8s`
3. **Discovery cards:** `transform: translateY(-4px)` on hover — subtle lift
4. **Scroll indicator:** CSS keyframe animation on the descending line — signals interactivity without text
5. **Section transitions:** Framer Motion stagger for discovery cards appearing in view

---

## Build Priority (if this moves to production)
1. Split-screen hero with hover expansion (the signature interaction)
2. Floating pill navigation with scroll-triggered appearance
3. "Featured moment" template (image + content, alternating sides)
4. Horizontal discovery scroll with world badges
5. Brand grid
6. Newsletter section
7. Footer

---

## Technical Considerations
- The split hero flex-expansion may need `ResizeObserver` for edge cases
- Floating nav `backdrop-filter` needs a fallback: `background: rgba(10,9,8,0.95)` for Firefox
- Discovery horizontal scroll: add keyboard navigation (left/right arrows)
- World badges (TECH / BEAUTY) on product cards should persist into category pages

---

## What Makes This Direction Unique
- Homepage is an interactive entry point, not a landing page
- Two visual identities (teal/tech, sienna/beauty) that merge into one brand
- Navigation is invisible until needed
- Products are introduced as "moments" not catalogue items
- Horizontal scrolling discovery feels native and mobile-first

---

## Best For
Younger Georgian customers (22-38) who respond to lifestyle and visual identity. Users who don't know exactly what they want but are open to being inspired. High-conversion for impulse and discovery purchases.
