# ⚡ CortexCart GODMODE v2.0

The most advanced AI-powered shopping cart experience. Built with Next.js 14, Prisma, PostgreSQL, Framer Motion, Tailwind CSS, and Resend.

---

## 🚀 Features

### 🛒 Cart & Checkout
- Real-time cart with quantity controls, save-for-later, and bulk operations
- **Coupon codes**: CORTEX10 (10% off), FIRST15 (15% off), SAVE20 ($20 off), FREESHIP (free shipping), FLASH25 (25% off)
- Live free-shipping progress bar
- **Two payment methods**: Online (card) + Cash on Delivery (COD)
- 3 shipping speed options (Standard / Express / Overnight)
- Animated checkout stepper with live order summary

### 📦 Order Tracking
- Public order tracking page (`/track`) — no login needed
- Real-time status timeline: Placed → Processing → Shipped → Out for Delivery → Delivered
- Tracking number + carrier displayed when shipped

### 🔔 Notifications
- Persistent notification bell with unread count badge
- Tabs: All / Unread / Orders / Deals
- Cart abandonment nudge
- Wishlist price-drop alerts (demo)
- Welcome promo notification

### 📧 Email System (Resend)
- Detailed order confirmation (itemized with product images, timeline, address)
- Admin alert on every new order
- Welcome email with promo code
- Shipping update email with tracking
- Out-for-delivery notification
- Delivery confirmation + review request
- Price-drop wishlist alerts
- Contact form auto-reply

### 🏪 Products (80+)
Across 6 categories: Electronics · Wearables · Audio · Computing · Photography · Gaming

### 🎨 UI/UX
- Scroll progress gradient bar
- Announcement bar with dismissal
- Active navigation highlighting with animated indicator
- Mobile bottom navigation bar
- Live search with instant results (Cmd/Ctrl+K shortcut)
- Full responsive design with mobile-first layouts

---

## 🛠 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create `.env` from `.env.example`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/cortexcart"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-min-32-chars"
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="CortexCart <onboarding@resend.dev>"
CONTACT_EMAIL_TO="admin@cortexcart.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database setup
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: CortexCart GODMODE v2.0"
git remote add origin https://github.com/YOUR_USERNAME/cortexcart.git
git push -u origin main
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Set **Root Directory** to `/` (or subdirectory if needed)
4. Set **Framework**: Next.js

### Step 3: Environment Variables in Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | `CortexCart <onboarding@resend.dev>` |
| `CONTACT_EMAIL_TO` | Your admin email |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### Step 4: Build Settings
```
Build Command:    npx prisma generate && next build
Output Directory: .next
Install Command:  npm install
```

### Step 5: Database (Neon.tech - Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech) → New project
2. Copy the connection string
3. Add as `DATABASE_URL` in Vercel

### Step 6: After first deploy, run seed
```bash
# In Vercel terminal or locally with production DATABASE_URL:
npm run db:seed
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── products/             # Product listing + detail pages
│   ├── checkout/             # Multi-step checkout
│   ├── orders/               # Order history
│   ├── track/                # Public order tracking
│   ├── wishlist/             # Wishlist page
│   ├── account/              # User account
│   ├── contact/              # Contact form with FAQ
│   ├── admin/                # Admin dashboard
│   └── api/                  # All API routes
├── components/
│   ├── Navbar.tsx            # Navbar with announcements + notifications
│   ├── CartDrawer.tsx        # Enhanced slide-out cart
│   ├── NotificationBell.tsx  # Real-time notification system
│   ├── NotificationManager.tsx # Background notification triggers
│   ├── ScrollProgress.tsx    # Top scroll progress bar
│   └── ProductCard.tsx       # Product card with quick-view
├── store/
│   ├── cart.ts               # Zustand cart store (coupons, save-for-later)
│   ├── notifications.ts      # Notification store
│   └── wishlist.ts           # Wishlist store
└── lib/
    ├── email.ts              # All email templates (Resend)
    ├── auth.ts               # NextAuth config
    └── prisma.ts             # Prisma client
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cortexcart.com | admin123 |
| Customer | demo@cortexcart.com | customer123 |

## 🎟 Coupon Codes

| Code | Discount |
|------|----------|
| CORTEX10 | 10% off |
| FIRST15 | 15% off |
| SAVE20 | $20 off |
| FREESHIP | Free shipping |
| FLASH25 | 25% off |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v4
- **Styling**: Tailwind CSS + custom design tokens
- **Animations**: Framer Motion
- **Email**: Resend
- **State**: Zustand (persisted)
- **Icons**: Lucide React
- **Deployment**: Vercel + Neon

---

Built with ⚡ by CortexCart Team
