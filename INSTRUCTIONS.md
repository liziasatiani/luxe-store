# Luxe Store — Setup & Deployment Instructions

## Requirements
- Node.js v20+
- npm v10+
- Supabase account (free tier works)
- Stripe account (optional — can be disabled)

---

## 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

---

## 2. Environment Variables

Copy the example file:
```bash
cp .env.example .env.local
```

Minimum required variables to run locally:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Luxe Store"
NODE_ENV=development

DATABASE_URL="postgresql://postgres:PASSWORD@db.YOURREF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:PASSWORD@db.YOURREF.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL=https://YOURREF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=products

NEXTAUTH_SECRET=run_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_STRIPE_ENABLED=false
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 3. Supabase Setup

1. Create project at supabase.com
2. Go to Settings → API Keys → copy Legacy anon + service_role keys
3. Go to Settings → Database → copy connection string (URI tab)
4. Go to Storage → New bucket → name: `products` → enable Public
5. Add your project's connection string password to DATABASE_URL

---

## 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# Seed database (186 products, brands, categories)
npm run prisma:seed
```

---

## 5. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

**Default accounts after seeding:**
- Admin: admin@luxestore.com / Admin@123456
- Demo: demo@luxestore.com / Demo@123456
- Admin panel: http://localhost:3000/admin

---

## 6. Build for Production

```bash
npm run build
npm run start
```

---

## 7. Deploy to Vercel

1. Push code to GitHub
2. Import repo at vercel.com
3. Add all environment variables from .env.local
4. Change NEXT_PUBLIC_APP_URL and NEXTAUTH_URL to your Vercel domain
5. Deploy

For production, also add to vercel.json:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

---

## 8. Enable Stripe (Optional)

1. Get keys from dashboard.stripe.com
2. Set in environment:
```env
NEXT_PUBLIC_STRIPE_ENABLED=true
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
3. Add webhook at dashboard.stripe.com/webhooks:
   - URL: https://yourdomain.com/api/stripe/webhook
   - Events: checkout.session.completed, payment_intent.payment_failed

---

## 9. Enable Google OAuth (Optional)

1. Create OAuth app at console.cloud.google.com
2. Add to environment:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```
3. Add authorized redirect URI: https://yourdomain.com/api/auth/callback/google

---

## 10. Optional Variables

```env
# WhatsApp chat button
NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890

# Social links
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourstore
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourstore
```

---

## Database Commands

```bash
npm run prisma:generate   # Regenerate Prisma client after schema changes
npm run prisma:migrate    # Run pending migrations
npm run prisma:seed       # Seed initial data
npm run prisma:studio     # Open Prisma Studio (database UI)
npm run prisma:reset      # DANGER: Reset DB and reseed
```

---

## Product Import

Admin Panel → Import → Upload CSV, Excel (.xlsx), or JSON

Download templates from the import page.

Required fields: name, price
Optional: brand, category, subcategory, description, compare_price, stock, sku, tags, images (comma-separated URLs)

---

## Pre-seeded Coupon Codes

| Code       | Type       | Value | Min Order |
|------------|------------|-------|-----------|
| WELCOME15  | Percentage | 15%   | $50       |
| LUXE20     | Percentage | 20%   | $150      |
| FREESHIP   | Free Ship  | —     | $75       |
| BEAUTY50   | Fixed      | $50   | $200      |
