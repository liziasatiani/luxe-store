# Everything Street

Luxury beauty and premium tech — curated for Tbilisi and beyond.

**Live:** [everythingstreet.ge](https://everythingstreet.ge)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| Database | PostgreSQL via Supabase (Prisma ORM) |
| Auth | NextAuth v5 (credentials + Google OAuth) |
| Payments | Stripe (live) |
| State | Zustand |
| i18n | next-intl — EN, KA, FR, ES (cookie-based) |
| Email | Resend |
| Animations | Framer Motion |
| Forms | react-hook-form + zod |
| Testing | Vitest (unit) + Playwright (accessibility) |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A Supabase project (free tier works)
- A Stripe account (optional — disable with `NEXT_PUBLIC_STRIPE_ENABLED=false`)

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — see required variables below

# 3. Generate Prisma client
npm run prisma:generate

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` and fill in the values. Minimum required to run locally:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:PASSWORD@db.YOURREF.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:PASSWORD@db.YOURREF.supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://YOURREF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=products

NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_STRIPE_ENABLED=false
```

All required variables are listed in `.env.example` with descriptions.

---

## Database

**Do not use `prisma migrate` or `prisma db push`** — they hang through pgbouncer (port 6543).

Schema changes go through the Supabase SQL editor directly:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS "newField" TEXT;
```

Then regenerate the Prisma client:

```bash
npm run prisma:generate
```

To seed initial data (brands, categories, demo products):

```bash
npm run prisma:seed
```

---

## Key Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build (runs prisma generate first)
npm run start            # Start production server
npx tsc --noEmit         # TypeScript check (ignore .next/types errors)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:studio    # Open Prisma DB browser
npm test                 # Run unit tests (Vitest)
npm run test:a11y        # Run accessibility tests (Playwright + axe-core)
```

---

## Project Structure

```
app/
  (auth)/          Login, register, password reset
  (store)/         All customer-facing pages
  admin/           Internal admin dashboard (English-only)
  api/             API routes

components/
  layout/          Navbar, Footer, BottomTabBar
  product/         ProductCard, ProductGrid, ProductGallery, etc.
  home/            Hero, editorial, newsletter sections
  cart/            CartDrawer
  ui/              Button, Price, MusicPlayer, etc.

lib/               Auth, Prisma, Stripe, email, pricing, utils
store/             Zustand stores (cart, wishlist, UI, currency)
hooks/             useDebounce, useClickOutside, useCurrency, useSearch
messages/          Translation files: en.json, ka.json, fr.json, es.json
types/             TypeScript types and NextAuth module augmentation
prisma/            Schema and seed script
public/            Static assets, service worker, PWA icons
```

---

## Admin Panel

Available at `/admin`. Protected by NextAuth — only users with role `ADMIN` or `SUPER_ADMIN` can access.

Features: product management, order management, customer management, coupons, analytics, bulk CSV/JSON import.

---

## Deployment

The project auto-deploys to [Vercel](https://vercel.com) from the `main` branch.

- All environment variables are configured in the Vercel dashboard
- Stripe webhook is registered at `https://everythingstreet.ge/api/stripe/webhook`
- An hourly cron job sends abandoned cart recovery emails (`vercel.json`)

---

## Testing

```bash
npm test              # Unit tests — lib/pricing, lib/utils
npm run test:a11y     # Accessibility audit on 10 core pages using axe-core
```

---

## i18n

Language is stored in a cookie (`luxe-locale`), not in the URL. All four languages must work after any UI change. Translation files are in `messages/`. Admin panel is intentionally English-only.
