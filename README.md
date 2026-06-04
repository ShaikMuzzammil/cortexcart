# ⚡ CortexCart GODMODE v2.0

> AI-powered shopping platform — Next.js 14 · Prisma 5.17 · PostgreSQL · Framer Motion · Resend

---

## 🚀 Local Setup

### 1. Install
```bash
npm install
```

### 2. Environment variables
Create a `.env` file (copy from `.env.example`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/cortexcart?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/cortexcart?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="CortexCart <onboarding@resend.dev>"
CONTACT_EMAIL_TO="admin@yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run
```bash
npm run dev
```

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "feat: CortexCart GODMODE v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cortexcart.git
git push -u origin main
```

### Step 2 — Create Database (Neon.tech — Free)
1. Go to [neon.tech](https://neon.tech) → New Project
2. Copy the **Connection String** (pooled) → this is your `DATABASE_URL`
3. Copy the **Direct Connection String** → this is your `DIRECT_URL`

### Step 3 — Create Resend Account (Free)
1. Go to [resend.com](https://resend.com) → Sign up
2. API Keys → Create API Key → copy it

### Step 4 — Create Vercel Project
1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build` _(already set in vercel.json)_
4. **Install Command**: `npm install --ignore-scripts` _(set in vercel.json)_

### Step 5 — Add Environment Variables in Vercel
```
DATABASE_URL          = postgresql://...pooled-url...?sslmode=require
DIRECT_URL            = postgresql://...direct-url...?sslmode=require
NEXTAUTH_URL          = https://your-project.vercel.app
NEXTAUTH_SECRET       = (generate: openssl rand -base64 32)
RESEND_API_KEY        = re_xxxxxxxxxxxx
RESEND_FROM_EMAIL     = CortexCart <onboarding@resend.dev>
CONTACT_EMAIL_TO      = admin@yourdomain.com
NEXT_PUBLIC_APP_URL   = https://your-project.vercel.app
```

### Step 6 — Deploy & Seed
After first deploy:
```bash
# Option A: Vercel CLI
npx vercel env pull .env.local
npm run db:seed

# Option B: Set DATABASE_URL locally to production DB, then:
DATABASE_URL="your-neon-url" npm run db:seed
```

---

## 🎯 Build & Deploy Commands Summary

| Command | Description |
|---------|-------------|
| `npm install --ignore-scripts` | Install without triggering postinstall |
| `npm run build` | `prisma generate && next build` |
| `npm run db:push` | Push schema to DB (no migration files) |
| `npm run db:seed` | Seed 35+ products, 2 users |
| `npm run db:studio` | Open Prisma Studio |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cortexcart.com | admin123 |
| Customer | demo@cortexcart.com | customer123 |

## 🎟 Coupon Codes

| Code | Discount |
|------|----------|
| `CORTEX10` | 10% off |
| `FIRST15` | 15% off first order |
| `SAVE20` | $20 flat discount |
| `FREESHIP` | Free shipping |
| `FLASH25` | 25% flash sale |

---

## 📦 What's New in v2.0

### ✅ Prisma Schema Fixes
- **Explicit `@relation` names** on all relations (fixes Prisma 5.22 validation)
- **Multi-line enum format** (prevents parser issues)
- **Pinned to Prisma 5.17.0 exact** (no caret ^, prevents auto-upgrade to 5.22)
- Added `VerificationToken` model (required for NextAuth email providers)
- Added `DIRECT_URL` datasource for Neon serverless connection pooling
- Renamed `InteractionType.REVIEW` → `ITEM_REVIEW` (avoids model name conflict)
- Removed `postinstall: prisma generate` (prevents double-generate on Vercel)
- `vercel.json` uses `--ignore-scripts` on install

### 🔔 Notification System
- Real-time bell in navbar with unread badge + shake animation
- 4 tabs: All / Unread / Orders / Deals
- Cart abandonment nudge after 30 min inactivity
- Wishlist price-drop alerts
- Welcome promo on first visit

### 🛒 Enhanced Cart
- Coupon code system (5 working codes)
- Free shipping progress bar
- Save for later shelf
- Estimated delivery date
- Tax + shipping breakdown
- Trust badges

### 💳 Dual Payment Checkout
- **Online** (card with Visa/MC/Amex) + **Cash on Delivery**
- 3 shipping speeds
- Animated stepper with field validation
- Canvas confetti on success

### 📧 Rich Email System (Resend)
- Order confirmation with product images + order timeline
- Admin alert on every new order
- Shipping / out-for-delivery / delivered emails
- Welcome email with promo code

### 🎯 Navigation
- Active section highlighting with animated indicator
- Announcement bar (dismissable with version tracking)
- Cmd/Ctrl+K live search
- Mobile bottom navigation bar
- Scroll progress gradient bar

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router |
| Database | PostgreSQL via Prisma 5.17 |
| Auth | NextAuth.js v4 |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | Framer Motion 11 |
| Email | Resend |
| State | Zustand 5 (persisted) |
| Icons | Lucide React |
| Hosting | Vercel + Neon |

---

*Built with ⚡ — CortexCart GODMODE v2.0*
