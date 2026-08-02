# Luxe Store — Claude Code Project

## Project Identity
This is a standalone project. Do NOT reference, modify, or interact with any files outside this directory.

## What This Project Is
A full-stack luxury e-commerce store built with Next.js 15, TypeScript, Prisma, Supabase, and next-intl.

**Live dev server:** `http://localhost:3000`
**Admin panel:** `http://localhost:3000/admin` (admin@everythingstreet.com / Admin@123456)

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
│   ├── home/            # Hero, Newsletter sections
│   └── ui/              # Design system primitives
├── messages/            # Translations: en.json, fr.json, es.json, ka.json
├── lib/                 # prisma, auth, utils, seo, stripe, validations
├── store/               # Zustand: cart, wishlist, UI stores
├── hooks/               # useScrolled, useDebounce, useClickOutside, etc.
├── prisma/              # schema.prisma, seed.ts
├── types/               # TypeScript types
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
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_ENABLED=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Luxe Store"
```

## Key Commands
```bash
npm run dev              # Start dev server on port 3000
npx tsc --noEmit         # TypeScript check (ignore .next/types errors)
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma DB browser
npm run build            # Production build
```

## Important Rules for Claude Code
1. NEVER modify files outside this directory
2. The middleware only protects /account and /admin — /checkout and /wishlist are public
3. Language switching is cookie-based (cookie: luxe-locale) — no URL prefix routing
4. Cart badge uses `mounted` state guard to prevent hydration errors
5. Wishlist uses localStorage via Zustand persist — deduplicated with `new Set()`
6. Guest checkout is supported — no login required for /checkout
7. GEL currency rate: 1 USD = 2.77 GEL
8. Always run `npx tsc --noEmit` after making changes to verify no errors

## Categories
**Beauty:** skincare, makeup, hair-care, body-care, perfume, beauty-tools
**Tech:** headphones, cameras, tablets, gaming, wearables, smart-home, audio, accessories

## Pre-seeded Data
- Admin: admin@everythingstreet.com / Admin@123456
- Demo: demo@everythingstreet.com / Demo@123456
- Coupons: WELCOME15 (15%), LUXE20 (20%), FREESHIP, BEAUTY50

## Product Import
Admin → /admin/import → Upload CSV
Required columns: name, price
Optional: brand, category, subcategory, description, compare_price, stock, sku, tags, images

## Known Issues / Notes
- TypeScript errors in .next/types are auto-generated and harmless — ignore them
- Prisma directUrl line is removed from schema (not needed with pooler)
- userId on Order model is nullable (supports guest orders)
- Guest orders use: guestEmail, guestName, guestPhone fields on Order
