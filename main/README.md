# CortexCart GODMODE v3.0 — Main Store

> **Next-gen e-commerce with real-time order tracking, custom cursor, advanced checkout, and host dashboard integration.**

---

## 🚀 Quick Deploy

### 1 — Local Setup
```bash
git clone https://github.com/YOUR_USER/cortexcart.git
cd cortexcart
npm install
cp .env.example .env.local   # fill in all values
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev                   # → http://localhost:3000
```

### 2 — Push to GitHub
```bash
git init
git add .
git commit -m "feat: CortexCart GODMODE v3"
git remote add origin https://github.com/YOUR_USER/cortexcart.git
git push -u origin main
```

### 3 — Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
2. **Framework**: Next.js (auto-detected)
3. **Build Command**: `prisma generate && prisma db push --skip-generate --accept-data-loss && next build`
4. **Install Command**: `npm install --ignore-scripts`
5. Add all env vars from `.env.example`
6. Click **Deploy**

---

## 🔑 Required Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | [neon.tech](https://neon.tech) (free) |
| `NEXTAUTH_URL` | Your full Vercel URL | Vercel project settings |
| `NEXTAUTH_SECRET` | Random secret | `openssl rand -base64 32` |
| `RESEND_API_KEY` | Email API key | [resend.com](https://resend.com) (free tier) |
| `RESEND_FROM_EMAIL` | Sender address | Resend verified domain |
| `CONTACT_EMAIL_TO` | Where contact forms go | Your email |
| `NEXT_PUBLIC_APP_URL` | Public URL | Same as NEXTAUTH_URL |
| `HOST_API_KEY` | Shared secret with host app | Any random string |

---

## ✅ Features v3.0

### 🎨 Custom Cursor
- Spring-physics ring that lags behind with Framer Motion `useSpring`
- Dot that follows cursor with zero latency (raw CSS transform)
- Scales up on hover over links/buttons
- Glow trail effect

### 🛒 Checkout (4-Step)
- **Step 1: Contact** — Name, email, phone. Login prompt for guests
- **Step 2: Shipping** — Address + 3 shipping speeds with live pricing
- **Step 3: Payment** — **Cash on Delivery** (default) + Pay Online (demo)
- **Step 4: Confirm** — Order number with **copy button**, confetti, track link
- No coupon codes (removed per spec)

### 📦 Order Tracking
- `/track` — Public page, paste any order number
- Copy order number button
- 5-stage visual progress bar: Placed → Payment → Processing → Shipped → Delivered
- Auto-loads logged-in user's recent orders
- Delivery address + price breakdown shown

### 👤 Account Page
- Profile tab with stats (orders, wishlist, reviews)
- **My Orders** tab — expandable cards with items, address, breakdown
- Copy order number from any order
- **Track This Order** button on each order
- **Wishlist** tab — view/remove saved items

### 📧 Emails (via Resend)
- ✉️ **Login success** — welcome back + quick links to shop/orders/wishlist
- 📦 **Order confirmation** — full receipt, address, items, track link
- 🚚 **Status update** — sent automatically when host updates order
- 📬 **Contact form** — copy to both customer + admin

### 🏪 Shop
- **35+ products** across 6 categories (Tech, Home, Fashion, Beauty, Sports, Food, Gaming)
- Advanced filters: category, price range, brand, rating, in-stock
- Sort: featured, price, rating, newest

---

## 📁 Project Structure
```
src/
├── app/
│   ├── checkout/page.tsx     ← 4-step checkout
│   ├── track/page.tsx        ← Order tracker
│   ├── orders/page.tsx       ← Public track redirect
│   ├── account/page.tsx      ← Profile + orders + wishlist
│   ├── contact/page.tsx      ← Enhanced contact form
│   ├── products/page.tsx     ← Shop with filters
│   └── api/
│       ├── checkout/route.ts
│       ├── user/orders/route.ts
│       ├── orders/[orderNumber]/route.ts  ← Public lookup
│       └── admin/orders/route.ts          ← Host integration
├── components/
│   ├── CustomCursor.tsx      ← Spring cursor
│   ├── Navbar.tsx
│   └── ...
├── lib/
│   ├── email.ts              ← All email functions
│   └── auth.ts               ← NextAuth with login email
└── store/                    ← Zustand stores
```
