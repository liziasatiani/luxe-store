# Luxe Store — Claude Code Project

## Project Identity
This is a standalone project. Do NOT reference, modify, or interact with any files outside this directory.

## What This Project Is
A full-stack luxury e-commerce store built with Next.js 15, TypeScript, Prisma, Supabase, and next-intl.

**Live dev server:** `http://localhost:3000`
**Admin panel:** `http://localhost:3000/admin` (admin@everythingstreet.ge / Admin@123456)

## Tech Stack
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Supabase (Prisma ORM)
- **Auth:** NextAuth v5
- **State:** Zustand
- **i18n:** next-intl (cookie-based, no URL prefix) — EN, FR, ES, KA
- **Animations:** Framer Motion
- **Forms:** react-hook-form + zod

## Project Structure
```
luxe-store/
├── app/
│   ├── (auth)/          # login, register, forgot-password
│   ├── (store)/         # all store pages
│   ├── admin/           # admin dashboard
│   └── api/             # API routes
├── components/
│   ├── layout/          # Navbar, Footer, LanguageSelector
│   ├── product/         # ProductCard, ProductGrid, QuickView
│   ├── home/            # Hero, Newsletter, MusicPlayer, EditorialPanels
│   └── ui/              # Design system primitives
├── messages/            # Translations: en.json, fr.json, es.json, ka.json
├── lib/                 # prisma, auth, utils, seo, stripe, validations
├── store/               # Zustand: cart (cartStore.ts), wishlist (wishlistStore.ts), UI (index.ts)
├── hooks/               # useScrolled, useDebounce, useClickOutside, etc.
├── prisma/              # schema.prisma, seed.ts
├── types/               # TypeScript types
├── vercel.json          # Cron jobs (abandoned cart, hourly)
├── i18n.ts              # next-intl config (cookie-based locale)
├── middleware.ts         # Route protection (only /account and /admin)
└── next.config.ts       # Next.js + next-intl plugin config
```

## Database
- **Provider:** Supabase PostgreSQL
- **Connection:** Pooler port 6543 (pgbouncer)
- **ORM:** Prisma
- **Key models:** User, Product, Order, Brand, Category, Coupon, Review, Address

## Environment Variables (in .env)
```
DATABASE_URL=postgresql://...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://everythingstreet.ge
NEXT_PUBLIC_STRIPE_ENABLED=true
NEXT_PUBLIC_APP_URL=https://everythingstreet.ge
NEXT_PUBLIC_APP_NAME="Everything Street"
```

## Key Commands
```bash
npm run dev              # Start dev server on port 3000
npx tsc --noEmit         # TypeScript check (ignore .next/types errors)
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma DB browser
npm run build            # Production build
```

## Git Identity — Permanent
Always run these before any commit:
```
git config user.name "Lizi"
git config user.email "ccceeddx@gmail.com"
```

Author on every commit: Lizi <ccceeddx@gmail.com>
Never use any other name, email, or identity.
Never add Co-Authored-By or any AI attribution to any commit.

## Commit Rules
- Every commit message must be short, specific, and human
- Vary commit times naturally between 9am and 11pm
- Never use bare vague messages like "update", "fix", "wip", "changes" — always be specific (e.g. "fix: search modal z-index above navbar")

## Project Rules
- Never work on main directly
- Never merge without explicit "approve" or "merge this"
- Never force push without disabling Vercel auto-deploys first
- Mobile first — 375px first, enhanced upward
- Prices in GEL (₾) everywhere
- All 4 languages must work after every change (ka/en/es/fr)
- Dark and light mode must work after every change
- No console.log or console.warn in client code
- No unused imports, variables, or functions
- No AI-style comments — never narrate what code does
- npm run build must pass before every commit

## Important Rules for Claude Code
1. NEVER modify files outside this directory
2. The middleware only protects /account and /admin — /checkout and /wishlist are public
3. Language switching is cookie-based (cookie: luxe-locale) — no URL prefix routing
4. Cart badge uses `mounted` state guard to prevent hydration errors
5. Wishlist uses localStorage via Zustand persist — deduplicated with `new Set()`
6. Guest checkout is supported — no login required for /checkout
7. GEL currency rate is fetched live from currency-api.pages.dev, cached 24h in DB. Hardcoded fallback only if API fails — do not hardcode rates in logic
8. Always run `npx tsc --noEmit` after making changes to verify no errors

## Categories
**Beauty:** skincare, makeup, hair-care, body-care, perfume, beauty-tools
**Tech:** headphones, cameras, tablets, gaming, wearables, smart-home, audio, accessories

## Pre-seeded Data
- Admin: admin@everythingstreet.ge / Admin@123456
- Demo: demo@everythingstreet.ge / Demo@123456
- Coupons: WELCOME15 (15%), LUXE20 (20%), FREESHIP, BEAUTY50

## Product Import
Admin → /admin/import → Upload CSV
Required columns: name, price
Optional: brand, category, subcategory, description, compare_price, stock, sku, tags, images

## External Services & Integrations

Read this section at the start of every session. Never suggest replacing or adding a service that already exists here.

- **Supabase** — PostgreSQL database (via Prisma) + product image storage
  - Used in: `lib/prisma.ts`, `lib/supabase.ts`, `app/api/admin/upload/route.ts`, all DB queries
  - Config: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`

- **NextAuth v5** — Email/password + Google OAuth authentication. Protects `/account` and `/admin`
  - Used in: `lib/auth.ts`, `app/api/auth/[...nextauth]/`, `middleware.ts`
  - Config: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

- **Google OAuth** — Sign in with Google provider (via NextAuth)
  - Used in: `lib/auth.ts`
  - Config: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

- **Resend** — Transactional email: newsletter confirmation, order confirmation, shipping, welcome, password reset, abandoned cart, contact auto-reply, admin order alerts. Domain `everythingstreet.ge` is verified — all addresses on it work automatically. Active mailboxes: `hello`, `admin`, `returns`, `legal`, `careers`
  - Used in: `lib/email.ts`, `app/api/newsletter/`, `app/api/cron/abandoned-cart/`, `app/api/contact/`, `app/api/auth/`
  - Config: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ADMIN`

- **Stripe** — Payment processing. **Live and enabled** (`NEXT_PUBLIC_STRIPE_ENABLED=true`). Live keys configured in `.env` and Vercel. Webhook registered at `https://everythingstreet.ge/api/stripe/webhook`
  - Used in: `lib/stripe.ts`, `app/api/stripe/checkout/`, `app/api/stripe/webhook/`
  - Config: `NEXT_PUBLIC_STRIPE_ENABLED`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`

- **Upstash Redis** — Rate limiting for login, newsletter, contact, and API routes. Falls back to in-memory if unconfigured
  - Used in: `lib/rateLimit.ts`, called from `lib/auth.ts` and multiple API routes
  - Config: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

- **Google Analytics (GA4)** — Client-side analytics, consent-gated via cookie banner
  - Used in: `components/GoogleAnalytics.tsx`, `app/layout.tsx`
  - Config: `NEXT_PUBLIC_GA_ID`

- **Vercel** — Hosting and deployment. Auto-deploys from `main` branch. `@vercel/analytics` package included
  - Used in: `app/layout.tsx`
  - Config: managed via Vercel dashboard, not in `.env`

- **currency-api.pages.dev** — Free live exchange rates (USD/EUR/GEL). No API key. Cached 24h in DB with fallback to hardcoded rates. Admin can override manually at `/admin/settings`
  - Used in: `app/api/rates/route.ts`, `store/index.ts`, `hooks/useCurrency.ts`
  - Config: none required

- **Unsplash** — Free stock images used in hero and editorial sections. No account or API key — direct CDN URLs
  - Used in: `components/home/EditorialPanels.tsx`, `components/home/BeautyEditorial.tsx`, `app/layout.tsx`
  - Config: none

- **SoundHelix** — Placeholder ambient audio track. **Replace with real track** (see memory: Music Playlist — Pending)
  - Used in: `components/ui/MusicPlayer.tsx` (the active player with hardcoded URL). `components/home/MusicPlayer.tsx` is a separate home-section variant
  - Config: none — hardcoded URL, to be replaced

- **Google Maps** — Link to physical store location on contact page
  - Used in: `app/(store)/contact/page.tsx`
  - Config: `NEXT_PUBLIC_CONTACT_MAPS_URL`

- **Social links** (Instagram, Facebook, WhatsApp, Messenger) — External links in footer and contact page. Instagram: `everythingstreet.ge`. Facebook: `Everything Street` (no custom username yet). WhatsApp number is placeholder (`+1234567890`) — not yet configured with real number
  - Used in: `components/layout/Footer.tsx`, `app/(store)/contact/page.tsx`
  - Config: `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_MESSENGER_URL`

- **Cron job — abandoned cart** — `GET /api/cron/abandoned-cart` sends recovery emails via Resend for carts abandoned 1+ hour ago. Secured with `x-cron-secret` header. Scheduled hourly via `vercel.json`
  - Used in: `app/api/cron/abandoned-cart/route.ts`
  - Config: `CRON_SECRET`

## Known Issues / Notes
- TypeScript errors in .next/types are auto-generated and harmless — ignore them
- Prisma `directUrl = env("DIRECT_URL")` IS in schema.prisma but DIRECT_URL also points to port 6543 (pooler). DDL via `prisma.$executeRawUnsafe()` works for non-CONCURRENTLY statements. Never use `prisma db push` or `prisma migrate` — they will hang or fail.
- userId on Order model is nullable (supports guest orders)
- Guest orders use: guestEmail, guestName, guestPhone fields on Order
- Product model has three nullable content fields: `howToUse`, `ingredients`, `inTheBox` (added 2026-08-10 via manual SQL — not via Prisma migrate)
- `public/sw.js` service worker excludes `/_next/` paths from cache — critical, do not revert. See Changelog.
- `CREATE INDEX CONCURRENTLY` fails through pooler (code 25001 — cannot run inside a transaction block). Use `CREATE INDEX IF NOT EXISTS` (without CONCURRENTLY) for DDL via Prisma.

## Database — Supabase Health Status (audited 2026-08-11)

**Project ref:** fjdatrmbijswdhbtiigm (eu-central-1)
**Tables:** 28 public tables

### RLS Status
- All 28 tables have RLS enabled — **EXCEPT `contact_messages` which was fixed** (enabled 2026-08-11)
- **Zero RLS policies defined on any table.** This is correct and intentional: all app DB access goes through Prisma using the postgres superuser role, which bypasses RLS entirely. RLS with no policies blocks any anon/authenticated Supabase JS client access — which is what we want.
- If you ever use the Supabase JS client (anon key) to query any table directly, add an appropriate policy first.

### Indexes
- 25 FK indexes added 2026-08-11 (see Changelog). Total indexes: 76.
- All foreign key columns are now indexed.

### Data Integrity (audited 2026-08-11; product count updated 2026-09-02)
- **244 active products, 33 inactive** (last updated 2026-09-02 after duplicate/variant audit; see Changelog)
- 0 duplicate slugs, 0 with bad prices, 0 without valid category
- 2 orders total, 0 orphaned (all have userId or guestEmail), 0 without line items
- 6 users, 2 active newsletter subscribers, 0 reviews, 0 abandoned carts
- Sessions table empty (expected — no active logins during audit)
- No expired sessions or verification tokens

## New Components (2026-08-10 session)
- `components/product/CategorySidebar.tsx` — async server component for cross-category sidebar nav. Used via `sidebarSlot` prop on ProductGrid.
- `components/product/CategoryNav.tsx` — exports `CategoryGroup` interface only. The actual rendering is done by CategorySidebar.
- ProductGrid `sidebarSlot?: React.ReactNode` — replaces old `categoryGroups` prop. Pass server-rendered JSX here to avoid RSC hydration issues.

---

## Legal Pages Registry

| Page | File Path | Last Updated | Status |
|------|-----------|--------------|--------|
| Privacy Policy | `app/(store)/privacy/page.tsx` | 2026-08-10 | Live |
| Terms & Conditions | `app/(store)/terms/page.tsx` | 2026-08-10 | Live |
| Shipping Policy | `app/(store)/shipping/page.tsx` | 2026-08-10 | Live |
| Return & Refund Policy | `app/(store)/returns/page.tsx` | 2026-08-10 | Live |
| Cookie Policy | `app/(store)/cookie-policy/page.tsx` | 2026-08-10 | Live |

All legal page content is in `messages/en.json` (under `pages.returns`, `pages.shipping`, etc.) and translated in `messages/ka.json`, `fr.json`, `es.json`.

---

## Third-Party Services (Legal Disclosure Context)

These services are disclosed in legal pages. If any are added, removed, or changed, update all relevant legal pages.

| Service | Disclosed In | Purpose | Data Sent | Location |
|---------|-------------|---------|-----------|----------|
| Stripe | Privacy, Cookie Policy, T&C | Payment processing, fraud detection (Radar) | Payment details, billing address, device/IP | US + EU (SCCs) |
| Supabase | Privacy | Database + file storage | All customer & order data | EU (Frankfurt) |
| Resend | Privacy | Transactional email | Email address, name, order details | US (SCCs) |
| Vercel | Privacy | Hosting + edge delivery | IP address, request logs | US + global (SCCs) |
| Google Analytics 4 | Privacy, Cookie Policy | Anonymised site analytics | Anonymised usage + IP | US (SCCs) |
| Upstash Redis | Privacy | Rate limiting / abuse prevention | IP address only | EU |
| NextAuth | Cookie Policy | Authentication sessions | Session cookie | Local |

**Not used (and stated as such in Cookie Policy):** Meta Pixel, TikTok Pixel, Google Ads remarketing, any advertising trackers.

---

## Known Legal Requirements

- **Georgian 14-day return right:** Mandatory under Georgian consumer law. Cannot be waived by T&C. Applies to all physical goods except unsealed beauty/hygiene products and activated digital licenses.
- **Beauty hygiene exception:** Unsealed cosmetics, skincare, fragrances, and personal care items are non-returnable if the seal has been broken. This is stated in Returns page under "Beauty & Cosmetics" section.
- **Electronics 2-year warranty:** Mandatory legal guarantee under Georgian consumer law. Stated in Returns page under "Electronics & Tech". First 6 months: defect presumed to exist at sale. Months 6–24: customer may need to demonstrate defect existed at purchase.
- **GDPR applies:** Yes — international customers accepted, EEA/UK customers entitled to GDPR rights. Legal bases documented per data type in Privacy Policy.
- **Stripe named in:** Privacy Policy (sections 2b, 2c, 4), Cookie Policy (section 2 — strictly necessary Stripe cookies), Terms & Conditions (section 7 — payment terms).
- **Stripe Radar automated processing:** Disclosed in Privacy Policy section 2c with GDPR Art. 6(1)(f) legal basis and manual review opt-out pathway.
- **Standard Contractual Clauses (SCCs):** Required for Stripe, Resend, Vercel, Google transfers outside EEA. All documented in Privacy Policy section 5.
- **Data Controller:** Everything Street, Shalva Nutsubidze St, Tbilisi, Georgia. Email: legal@everythingstreet.ge
- **VAT/tax disclosure:** Prices include applicable taxes per T&C section 5. Georgian VAT applies.

---

## Shipping Restrictions

- **Fragrances & perfumes:** Flammable — international air transport prohibited. Ground/sea only for international. Domestic unaffected. Stated in Shipping page.
- **Aerosol products** (hairspray, dry shampoo, body spray): International air prohibited. Ground only internationally.
- **Nail products with acetone:** Same flammable liquid restrictions internationally.
- **Lithium battery products** (phones, tablets, laptops, headphones, smartwatches, wearables): Subject to IATA air freight regulations limiting battery count/capacity per shipment. Compliance stated in Shipping page.
- **Regional electronics restrictions:** Some RF devices may face additional import inspection in certain countries. Buyer's responsibility to verify.
- **Voltage:** Products configured for 220V / 50Hz. International buyers warned to verify compatibility.
- **Temperature-sensitive products:** Protective packaging used; carrier mishandling excluded from liability.

---

## Decisions & Reasons

- **[2026-08-10]:** CategorySidebar as server component via `sidebarSlot` pattern — chose this over passing `categoryGroups` data prop to ProductGrid (client component) because a PWA service worker was caching old JS bundles, causing the client to run stale ProductGrid code that didn't know about the new prop. Server-rendered JSX passed as `children`-style slot bypasses the RSC serialization boundary entirely — the HTML is pre-rendered and React never needs to re-evaluate it on the client.

- **[2026-08-10]:** Excluded `/_next/` from service worker cache — the SW used cache-first for all static assets. In development, chunk filenames don't have content hashes, so old bundles were served forever. In production Next.js uses content-hashed filenames so Next.js chunks don't need SW caching anyway.

- **[2026-08-10]:** Product schema fields (`howToUse`, `ingredients`, `inTheBox`) added via raw SQL in Supabase dashboard — Prisma db push and migrate both blocked by pgbouncer (port 6543 doesn't support DDL). All future schema changes must go through Supabase SQL editor: `ALTER TABLE products ADD COLUMN IF NOT EXISTS "fieldName" TEXT;` then `npx prisma generate`.

- **[2026-08-10]:** Retained `CategoryNav.tsx` as an interface-only file (exports `CategoryGroup` type) — other pages may use this type. The actual rendering is in `CategorySidebar.tsx`.

- **[Legal overhaul, ~2026-08-10]:** Removed US jurisdiction clauses — not applicable. Governing law is Georgia. GDPR compliance added for international customers but Georgian Law on Personal Data Protection (Law No. 5669) is the primary framework.

- **[Legal overhaul]:** No COD (cash on delivery) — removed all COD references from shipping and payment sections. Store is card-only via Stripe.

- **[Legal overhaul]:** Returns email is `returns@everythingstreet.ge` (not .com) — Resend domain is everythingstreet.ge, all inboxes on this domain work.

---

## Outstanding Items

- **Attorney review needed:** All 5 legal pages are live but have not been reviewed by a Georgian lawyer. Recommend review before the store handles significant transaction volume.
- **Electronics warranty wording:** The 2-year guarantee section in Returns page is based on general Georgian consumer law understanding. Exact statutory language should be verified by attorney.
- **WhatsApp number:** Placeholder `+1234567890` in footer and contact page — needs real number configured via `NEXT_PUBLIC_WHATSAPP_NUMBER` env var.
- **Music player:** SoundHelix placeholder track still in use (`components/ui/MusicPlayer.tsx`). Replace with real ambient track when ready.
- **GDPR Data Processing Agreements (DPAs):** SCCs are mentioned in Privacy Policy but actual DPA execution with Stripe, Resend, Vercel should be confirmed by attorney.
- **Cookie banner re-consent:** If any new analytics or tracking service is added, existing users must be shown the banner again for fresh consent.
- **i18n — editorial/home content not translated (intentional):** The following are marketing copy intentionally left in English — translating editorial text requires copywriter-level input per language: `components/home/BeautyEditorial.tsx`, `components/home/EditorialPanels.tsx`, `components/home/StatsSection.tsx`, `components/home/index.tsx` (hero/editorial sections), `components/layout/Footer.tsx` (tagline), `app/(store)/about/page.tsx`, `app/(store)/careers/page.tsx`, `app/(store)/featured/page.tsx`, `app/(store)/track-order/page.tsx`. Auth pages (`login/page.tsx`, `register/page.tsx`) have `••••••••` password field placeholders — same in all languages, no action needed.
- **i18n — admin panel not translated (intentional):** Admin is an internal English-only tool. No translation needed for admin pages/components.

---

## Changelog

[2026-09-03] CODE [app/admin/products/page.tsx, app/api/admin/products/route.ts] — Admin product list split into Active/Inactive tabs. Active tab: edit + deactivate actions. Inactive tab: restore (↺) action only. Tab labels show live counts. Stock filter hidden on Inactive tab and cleared on tab switch. API GET now accepts ?active=true|false. New PATCH endpoint toggles isActive.
[2026-09-02] DB [Supabase] — Product duplicate/variant audit. Deactivated 30 products: 15 BT-XXX batch duplicates (kept better-described versions), 13 orphan per-shade listings for already-merged products (NARS Powermatte Lipstick, Girlactik Luminous Face Powder, Kulfi Concealer, Fenty Beauty Suede Powder Blush, What's Up Beauty Wind Dances Pressed Powder), 2 old separate Eloise/Ouhoe listings. Created 2 new merged products: Eloise Sweet Cheeks Bronzing Palette (2 shades) and Ouhoe Lip Liner Stay-N (2 shades). Active count: 274→244. Inactive count: 3→33.
[2026-09-02] FIX [app/globals.css, components/product/ProductBreadcrumb.tsx, app/(store)/contact/page.tsx, app/(store)/wishlist/page.tsx] — Mobile audit fixes at 375px: product detail .dinfo padding override (!important), ProductBreadcrumb flex-wrap, contact heading clamp(28px,8vw,80px), wishlist startShopping/continueShopping translated in all 4 languages.

[2026-08-11] DB [Supabase] — Enabled RLS on contact_messages table (was the only table with RLS disabled — a security gap allowing anon reads/writes).
[2026-08-11] DB [Supabase] — Created 25 missing FK indexes (accounts, addresses, cart_items×2, categories, coupon_usages×2, notifications, order_items×2, orders×3, product_images, product_specs, product_variants, products×2, recently_viewed×2, reviews×2, sessions, wishlist_items×2). Total indexes: 51→76.
[2026-08-11] FIX [app/api/admin/analytics/route.ts] — Fixed raw SQL column names: changed snake_case (created_at, payment_status) to quoted camelCase ("createdAt", "paymentStatus") — Prisma stores columns in camelCase, not PostgreSQL snake_case. Fixed "Failed to load analytics" error in admin dashboard.
[2026-08-11] FIX [app/api/admin/products/route.ts] — Fixed intermittent "Failed to update product" errors: product list returns full image objects with id/productId/createdAt; these were being spread into Prisma create payloads causing validation errors. Fixed by explicitly picking only url/altText/isPrimary/sortOrder in image and spec create payloads.
[2026-08-11] CODE [app/admin/orders/page.tsx] — Orders list now shows product names (with quantity) instead of just a count. Added full order detail drawer (click row) showing shipping address, line items with SKU/variant, totals, tracking, customer notes. Status dropdown has e.stopPropagation() to prevent row click. Shipping modal z-index raised to z-[60].
[2026-08-11] CODE [app/api/admin/orders/route.ts] — Added ?id= detail endpoint returning full order with all shipping fields, items with unitPrice/totalPrice/variantName/productSku, and user/guest info.
[2026-08-11] CODE [app/admin/customers/page.tsx] — Full rewrite: click-to-open detail drawer with addresses and order history; email copy button (clipboard, not mailto); edit mode (inline name/email/phone); delete with confirmation (anonymizes PII, keeps order history).
[2026-08-11] CODE [app/api/admin/customers/route.ts] — Added ?id= GET for customer detail (addresses + orders). Added PUT for editing name/email/phone/isActive with email conflict check. Added DELETE for anonymizing PII (name→"Deleted Customer", email→deleted.invalid, phone/image/passwordHash→null, deletes addresses).
[2026-08-11] CODE [app/admin/coupons/page.tsx] — Added edit functionality: pencil button per row pre-fills form with coupon data and switches to edit mode. On save, PUT with coupon id. Edited row highlighted. Cancel clears edit state. No API changes needed.
[2026-08-11] FIX [app/admin/customers/page.tsx, app/admin/coupons/page.tsx] — Added overflow-x-auto wrapper around tables (matching orders page pattern) for mobile horizontal scroll.
[2026-08-11] FIX [app/api/admin/coupons/route.ts] — Coupon DELETE was silently failing due to FK constraints: CouponUsage.couponId and Order.couponId both reference Coupon with no cascade. Fixed by deleting CouponUsage records and nulling Order.couponId before deleting the coupon.
[2026-08-11] FIX [app/admin/coupons/page.tsx] — Replaced window.confirm() with inline "Delete? Yes / No" confirmation per row (window.confirm is unreliable in some browser environments).
[2026-08-11] FIX [app/api/admin/orders/route.ts] — Status update to SHIPPED was failing: dynamic import("@/lib/email") could throw before .catch() was attached. Fixed by using static import. Also made all post-update side effects (email + notification) non-fatal via Promise.all().catch(). Added console.error logging.
[2026-08-11] CODE [lib/email.ts] — Added sendOrderStatusEmail() for CONFIRMED/DELIVERED/CANCELLED statuses with appropriate subject and body per status.
[2026-08-11] CODE [app/api/admin/orders/route.ts] — All 4 status changes now send emails: CONFIRMED → order confirmed email, SHIPPED → shipping notification, DELIVERED → delivery email, CANCELLED → cancellation email. In-app notifications sent for all 4 if user account exists.
[2026-08-11] CODE [app/api/admin/orders/route.ts] — Added DELETE endpoint: nulls CouponUsage.orderId (no FK but hygiene), deletes Order (OrderItem cascades via DB-level Cascade).
[2026-08-11] CODE [app/admin/orders/page.tsx] — Added trash icon + inline delete confirmation per order row. Closing detail drawer automatically if the deleted order is open.
[2026-08-15] i18n [Phase 8 complete — 6 commits total] — All customer-facing hardcoded strings translated across the store. 53 more keys added in final pass: error page (pages.error), newsletter section, checkout guest flow, cart free-shipping banners + suggestions, product gallery lightbox, QuickView wishlist toast, RecentlyViewed/RelatedProducts headings, SearchModal "try different" hint, wishlist device-sync notice, 20+ aria-labels across Navbar/CartDrawer/ScrollToTop/Breadcrumbs/BottomTabBar/SearchModal/ExitIntentCapture/CookieConsent. All 4 languages in sync at 854 keys. Admin panel left in English (internal tool, no translation needed).
[2026-08-15] i18n [Phase 8 recheck — 3 follow-up commits] — Fixed hardcoded strings missed in Phase 8 audit: NotifyMe "OK" button and email placeholder; ReorderButton "Reorder" label and aria-label; checkout "New address", "Save address", "Cancel", address label field, "Pay" button, SSL/free-shipping trust badges; contact page field placeholders; ProductCard Tech/Beauty/New badges, Out of Stock overlay, Low Stock label, Add to Cart button, wishlist aria-labels. 15 new keys added. All 4 languages in sync (801 total keys).
[2026-08-15] i18n [Phase 8 Audit — 15 files] — Converted all hardcoded UI strings to next-intl translations across the store. ProductCard/NotifyMe/ReorderButton/cart/checkout/contact/reset-password: all toast messages and labels now use t(). CategorySidebar: category names resolved from categories namespace. privacy/terms/cookie-policy: full async server component rewrite using getTranslations — all 3 pages fully translated in EN/KA/FR/ES. 80+ new keys added across common, product, auth.resetPassword, pages.contact, pages.privacy, pages.terms, pages.cookiePolicy namespaces in all 4 language files.
[2026-08-12] FIX [app/globals.css] — Added white-space: nowrap to .btn-cart; text was wrapping to 3 lines on mobile product cards at 375px (button ~59px wide, insufficient for "ADD TO CART").
[2026-08-12] FIX [app/(store)/cart/page.tsx] — Fixed "1 items" singular/plural: now shows "1 item" when itemCount() === 1.
[2026-08-12] PERF [hooks/useCurrency.ts] — Deduplicated /api/rates fetches via module-level promise; was firing 20+ concurrent requests per page (one per component using useCurrency). Now one request per page session.
[2026-08-12] PERF [app/api/rates/route.ts] — Added Cache-Control headers to all response paths: public, max-age=300, stale-while-revalidate=3600 for fresh/live rates; public, max-age=60, stale-while-revalidate=600 for stale; public, max-age=60 for fallback. Previously Vercel served dynamic default (no caching).
[2026-08-11] CODE [components/product/CategorySidebar.tsx] — New async server component for cross-category sidebar (Beauty+Tech). Used via sidebarSlot prop on ProductGrid.
[2026-08-11] CODE [components/product/CategoryNav.tsx] — Created as interface-only file exporting CategoryGroup type.
[2026-08-11] CODE [components/product/ProductGrid.tsx] — Replaced categoryGroups prop with sidebarSlot: React.ReactNode (server-rendered slot pattern).
[2026-08-11] CODE [app/(store)/tech/page.tsx, tech/[slug]/page.tsx, beauty/page.tsx, beauty/[slug]/page.tsx] — Updated to pass CategorySidebar as sidebarSlot; both Beauty and Tech groups now appear on both category pages.
[2026-08-11] FIX [public/sw.js] — Excluded /_next/ paths from service worker cache. Old code cached stale JS bundles indefinitely, breaking client hydration after code changes.
[2026-08-11] CODE [messages/en.json, ka.json, fr.json, es.json] — Added allBeauty and allTech translation keys for cross-category sidebar labels.
[2026-08-10] CODE [prisma/schema.prisma] — Added howToUse, ingredients, inTheBox fields to Product model (nullable Text). Applied via manual SQL in Supabase dashboard (pgbouncer blocks DDL).
[2026-08-10] LEGAL [app/(store)/privacy/page.tsx] — Full legal overhaul: Stripe Radar disclosure, GDPR legal bases, SCCs for international transfers, data controller details.
[2026-08-10] LEGAL [app/(store)/terms/page.tsx] — Full legal overhaul: Georgian law governing, 18+ age requirement, pricing/currency section, Stripe payment terms.
[2026-08-10] LEGAL [app/(store)/returns/page.tsx] — Full legal overhaul: 14-day Georgian return right, beauty hygiene exception, 2-year electronics warranty, returns email corrected to .ge domain.
[2026-08-10] LEGAL [app/(store)/shipping/page.tsx] — Full legal overhaul: fragrance/aerosol air restrictions, lithium battery IATA rules, duties disclaimer, voltage warning.
[2026-08-10] LEGAL [app/(store)/cookie-policy/page.tsx] — Full legal overhaul: Stripe mandatory cookies disclosed, GA4 consent-gated, no advertising cookies stated explicitly.

---

## Design Snapshot

Captured 2026-08-25 before glassmorphism changes. Describes the **original design** exactly as it existed at this point.

### Source Files
| File | Role |
|------|------|
| `app/globals.css` | All custom CSS: tokens, nav, hero, editorial, cards, footer, responsive |
| `tailwind.config.ts` | Tailwind design tokens: colors, fonts, spacing, shadows, animations |

### Color Tokens (CSS custom properties in `globals.css`)

**Dark mode (`:root` default — applied when `<html>` has class `dark`):**
```
--bg:      #07090F       (deepest background)
--s1:      #0D1220       (surface 1 — cards, footer, nav solid)
--s2:      #131929       (surface 2 — dropdowns, hover states)
--s3:      #1A2235       (surface 3 — subtle raised elements)
--gold:    #C9A44A       (primary accent — borders, CTAs, highlights)
--gold2:   rgba(201,164,74,0.18)
--gold3:   rgba(201,164,74,0.07)
--blue:    #00E5FF       (tech category accent)
--blue2:   rgba(0,229,255,0.12)
--crimson: #FF3366       (beauty category accent)
--crimson2:rgba(255,51,102,0.12)
--chalk:   #EFE9DA       (primary text)
--chalk2:  rgba(239,233,218,0.55)  (secondary text)
--chalk3:  rgba(239,233,218,0.15)  (muted text, labels)
--border:  rgba(239,233,218,0.08)  (dividers)
--borderg: rgba(201,164,74,0.18)   (gold-tinted borders on interactive elements)
--nav-h:   68px
```

**Light mode (`:root:not(.dark)` — active when `dark` class is absent from `<html>`):**
```
--bg:      #F4F0E8
--s1:      #EDE7D8
--s2:      #E5DDCC
--s3:      #DDD4BF
--chalk:   #1A1208
--chalk2:  rgba(26,18,8,0.55)
--chalk3:  rgba(26,18,8,0.15)
--border:  rgba(26,18,8,0.09)
--borderg: rgba(201,164,74,0.25)
--gold3:   rgba(201,164,74,0.06)
(gold, blue, crimson unchanged from dark)
```

### Typography
- **Serif display** (`--serif`, `font-display`, `font-serif`): Playfair Display — used for headings, product names, logo, editorial titles
- **Sans-serif body** (`--sans`, `font-sans`): Outfit — used for UI, labels, buttons, body text
- **Georgian** (`--ka`, `font-georgian`): Noto Serif Georgian — used for KA-locale hero text
- All loaded via Next.js `next/font/google` with `display: swap`

### Key Component Styles (all in `globals.css`)

**Navigation (`#nav`):**
- Fixed, height 68px, `grid-template-columns: 1fr auto 1fr`
- Transparent by default; `.solid` state: `background: rgba(7,9,15,0.88)` + `backdrop-filter: blur(24px)`
- Light mode solid: `background: rgba(244,240,232,0.92)`
- Dropdown (`.nav-dropdown`): `background: rgba(7,9,15,0.96)` + `backdrop-filter: blur(24px)`

**Product cards (`.pcard`):**
- `background: var(--bg)` — solid, no blur
- Hover: `background: var(--s1)`
- Border radius: `border-radius: 1px` (effectively square)
- Grid gap: `gap: 1px; background: var(--border)` (hairline separator between cards)

**Buttons:**
- `.btn-cart`: transparent bg, `border: 1px solid var(--borderg)`, gold text, `border-radius: 1px`. Hover: `background: var(--gold)`
- `.btn-wish`: `border: 1px solid var(--border)`, `border-radius: 1px`
- `.signin-btn`: `border-radius: 20px` (pill), gold border + text

**Hero (`.hero`):**
- `min-height: calc(100svh + var(--nav-h))`, `grid-template-columns: 1fr 1fr`
- CTA (`.hero-cta`): `border-radius: 1px`, `backdrop-filter: blur(8px)` — already has glass
- No ambient orbs or colored blobs

**Footer (`footer`):**
- `background: var(--s1)` — solid surface color

**Sections:**
- `.section`: `padding: 96px 0`
- `.wrap`: `max-width: 1400px; padding: 0 52px`
- Mobile: `padding: 0 20px`

**Page headers (`.page-hd`, `.k-page-hdr`):**
- `background: var(--bg)` — solid

**Border radius convention:** Almost everything uses `border-radius: 1px` (near-square). Only `.signin-btn` and newsletter inputs use rounded variants (`20px`, `2px`).

### Tailwind Color Scale (from `tailwind.config.ts`)
```
brand-500: #C9A44A   (= --gold)
surface-950: #07090F (= --bg)
surface-900: #0D1220 (= --s1)
surface-800: #1A1720 (= --s2)
surface-50:  #EFE9DA (= --chalk)
accent-500:  #FF3366 (= --crimson)
tech:        #00E5FF (= --blue)
```

### Shadows (`tailwind.config.ts`)
```
luxury:     0 4px 24px -2px rgba(0,0,0,0.08), 0 2px 8px -1px rgba(0,0,0,0.04)
luxury-md:  0 8px 40px -4px rgba(0,0,0,0.12), 0 4px 16px -2px rgba(0,0,0,0.06)
glow-gold:  0 0 24px rgba(182,130,53,0.35)
```

### What Already Has Glass
These components already had `backdrop-filter` before the glassmorphism update:
- `#nav.solid` — `blur(24px)` ✓
- `.nav-dropdown` — `blur(24px)` ✓
- `.hero-cta` — `blur(8px)` ✓
- `.ann-bar` — `blur(20px)` ✓

Everything else (product cards, footer, page headers, editorial panels, newsletter section, stats) used **solid** `var(--bg)` or `var(--s1)` backgrounds.

---

## How to Revert

If glassmorphism changes need to be undone completely, restore exactly these two files:

```bash
# From the project root:
cp design-backup/globals.css app/globals.css
cp design-backup/tailwind.config.ts tailwind.config.ts
```

Then verify nothing is broken:
```bash
npx tsc --noEmit
npm run build
```

**What the backup contains:** The complete pre-glassmorphism state of `app/globals.css` (657 lines) and `tailwind.config.ts` captured on 2026-08-25. No other files need restoring — glassmorphism changes are confined to these two files plus optional orb markup in `app/layout.tsx` (which was NOT modified and does not need reverting).

**If orbs were added to `app/layout.tsx`:** Remove any `<div>` elements with class names like `orb`, `bg-orbs`, or similar ambient gradient divs that were added inside `<body>` before `<Navbar />`.

**Backup location:** `design-backup/` in the project root — these files are not tracked by git and will not be deployed.
