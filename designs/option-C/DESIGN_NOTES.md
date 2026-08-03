# Option C — "Utility Precision" Design Notes

## Concept
A tool that gets out of the way. The user who knows what they want — a Sony WH-1000XM5, a Tatcha moisturiser, a specific price range — should reach it in two clicks without scrolling past hero sections. The interface is structured like a professional dashboard: sidebar always visible, product grid always above the fold, data presented with typographic precision.

---

## Typography

### Syne (Display / Brand)
- **Why:** Geometric, slightly wide letterforms, genuinely distinctive at large weights. Syne 800 for headlines reads as confident and precise — not decorative. It's used by Vercel and Linear-adjacent products, but applied with restraint here (large headings only) rather than as a UI font.
- **Usage:** Page headings, featured banner title, footer brand name, content section title
- **Do not use for:** Body copy, navigation, prices, or anything under 18px

### DM Sans (UI / Body)
- **Why:** Clean without being clinical. More warmth than Inter, more authority than Outfit. The italic weight is elegant for occasional use. Works perfectly at 12-14px which is where 80% of this UI lives.
- **Usage:** All sidebar text, product names, body copy, buttons, navigation
- **Weights:** 300 long-form, 400 standard UI, 500 strong labels

### JetBrains Mono (Data / Labels)
- **Why:** The design signal that separates this from every other e-commerce site. Prices, counts, breadcrumbs, and category codes rendered in monospace communicate precision and technical authority — the same signal that Linear, Vercel, and Raycast use. Users unconsciously trust data that looks like it was typed by a machine.
- **Usage:** Prices (₾995), product counts (28 პროდუქტი), breadcrumbs, sidebar counts, badges
- **Never use for:** Anything conversational or emotional

### Noto Sans Georgian
- **Why:** Georgian text in sidebar navigation and breadcrumbs needs to be legible at 12-13px. Noto Sans Georgian is the most reliable for small sizes.

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Page and card backgrounds |
| Surface | `#FAFAFA` | Sidebar background, alternating rows |
| Surface 2 | `#F4F4F5` | Hover states, badges |
| Border | `#E4E4E7` | All dividers, card borders |
| Border Strong | `#D4D4D8` | Focused/hovered borders |
| Ink | `#09090B` | Primary text, brand mark |
| Ink 2 | `#3F3F46` | Secondary text |
| Ink 3 | `#71717A` | Tertiary text, placeholders |
| Ink 4 | `#A1A1AA` | Disabled, metadata |
| Green | `#15803D` | ALL interactive actions — the single accent |
| Green Light | `#DCFCE7` | Active states, badge backgrounds |
| Green Dark | `#166534` | Green hover states |
| Red | `#DC2626` | Discount badges only |

### Rules
- Green is used ONLY for active/selected states, CTAs, and the announcement bar
- No decorative use of color — every color is functional
- Product photography provides all the visual interest; the UI stays neutral
- Red appears only on discount percentage badges — never for errors or warnings in this mock

---

## Navigation Paradigm — Persistent Sidebar
This is the core differentiator. Key implementation:
- `position: sticky; top: var(--header-h); height: calc(100vh - var(--header-h))` — sidebar stays put while content scrolls
- `overflow-y: auto; scrollbar-width: thin` — sidebar itself can scroll for long filter lists
- On desktop: sidebar is always open, never collapsible
- On mobile: sidebar hides, replaced by bottom-sheet filter panel (tap "Filters" button)
- The sidebar has three zones: categories (top), price filter (middle), brand filter + status (bottom)

---

## Layout System
- Desktop: CSS Grid `grid-template-columns: 248px 1fr` — sidebar fixed width, content fills rest
- Content area: no max-width — uses the full available space after sidebar
- Product grid: `repeat(4, 1fr)` on desktop — dense, like a spreadsheet view
- Mobile product grid: `repeat(2, 1fr)` — appropriate density for touch
- Header: `position: fixed; height: 56px` — always visible, contains global search

---

## Component Library Recommendations
- **Base:** Radix UI (Select, Checkbox, Dialog for filter panel on mobile)
- **Data display:** The existing Prisma data maps directly to this UI — minimal transformation needed
- **Search:** The header search input connects to the existing `/api/search` or `/products?search=` route
- **Filters:** URL-based filter state (`?category=headphones&brand=sony&minPrice=500`) for shareability and SSR

---

## Animation Recommendations
1. **Product card quick-add:** `transform: translateY(0)` from `translateY(100%)` — slide up on hover, `0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
2. **Card hover:** `box-shadow: 0 0 0 1px var(--border-strong), 0 4px 16px rgba(0,0,0,0.06)` — no translate, feels native to a data-dense UI
3. **Sidebar active state:** `background: var(--green-light)` transition, `0.12s ease` — fast and responsive
4. **No scroll animations** — utility interfaces should feel immediate, not theatrical

---

## Build Priority (if this moves to production)
1. Header with global search (most important — this is the power user's primary tool)
2. Sidebar with category nav (working links, active state, accordion for sub-items)
3. Product grid component (the 4-column grid with all badge/hover states)
4. Price range slider (can use Radix Slider)
5. Brand checkbox filters
6. Sort controls + view toggle
7. Featured banner component
8. Trust bar
9. Mobile: filter bottom sheet replacing sidebar

---

## What Makes This Direction Unique
- Products are above the fold on every page load — no hero to scroll past
- Monospace data typography signals precision and trust (inspired by Linear, Vercel)
- Sidebar is always visible — power users never lose context
- The header search is the primary navigation for repeat users
- Mobile has a purpose-built bottom nav (no hamburger) — each world accessible in one tap

---

## Performance Notes
- This layout benefits most from SSR — sidebar counts and filter state served on first load
- Next.js parallel routes could power the sidebar + main grid independently
- `React.Suspense` for the product grid with a skeleton loader that matches the 4-column layout
- The URL-param filter approach means filter state survives page reload and can be shared

---

## Best For
Return customers and Georgian users who research before buying. Power shoppers who know brands and have a budget. B2B buyers (corporate gifts, office tech). Any user who has been burned by fake products elsewhere and needs visible trust signals above the fold.
