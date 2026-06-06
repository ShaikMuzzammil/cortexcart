# CortexCart HOST Dashboard

> **Private admin interface for managing orders, updating delivery status, and communicating with customers.**
> Connected to the same database as the main CortexCart store.

---

## 🚀 Quick Setup

### 1 — Local Setup
```bash
cd cortexcart-host
npm install
cp .env.example .env.local   # fill in values
npx prisma generate           # generate client from shared schema
npm run dev                   # → http://localhost:3001
```

### 2 — Push to GitHub (separate repo)
```bash
git init
git add .
git commit -m "feat: CortexCart Host v1"
git remote add origin https://github.com/YOUR_USER/cortexcart-host.git
git push -u origin main
```

### 3 — Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import **cortexcart-host** repo
2. **Build**: `prisma generate && next build`
3. **Install**: `npm install --ignore-scripts`
4. Add env vars below
5. Deploy → protect with a custom domain or Vercel password protection

---

## 🔑 Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | **Same** PostgreSQL URL as main CortexCart app |
| `HOST_PASSWORD` | Your private login password for the dashboard |
| `HOST_SECRET` | Any 32+ char random string for session cookie |
| `RESEND_API_KEY` | Same Resend key as main app |
| `RESEND_FROM_EMAIL` | Admin sender address |
| `NEXT_PUBLIC_APP_URL` | Main store URL (for email links) |

---

## ✅ Features

### 🔐 Authentication
- Simple password-based login (env var `HOST_PASSWORD`)
- Secure httpOnly cookie session (7-day)
- Auto-redirect to login if unauthenticated

### 📋 Orders Dashboard
| Feature | Description |
|---|---|
| Live search | Filter by order number or customer email |
| Status filter | Filter by any status (Pending, Shipped, etc.) |
| Stats row | Revenue, pending, in-transit, delivered counts |
| Pagination | 20 orders per page |
| Expand/Collapse | Click any order to see full details |
| Copy buttons | Copy order number or tracking number |

### ✏️ Order Management
Click **Edit** (pencil icon) or **Update Order** on any order to:
- Change **order status** (Pending → Processing → Shipped → Delivered, etc.)
- Set / update **estimated delivery date**
- Add **tracking number** + **carrier** (FedEx, UPS, DHL…)
- Add a **note to customer** (shown in email)
- **Email is sent automatically** to the customer on save

### ✉️ Custom Email
Click the **mail icon** on any order to:
- Send a custom email to the customer
- Pre-filled with order number as subject
- Full HTML email template sent via Resend

---

## 🔄 How Status Updates Flow

```
Host Admin clicks Save
       │
       ▼
PATCH /api/orders → prisma.order.update()
       │
       ▼
sendStatusUpdateEmail() → Resend API
       │
       ▼
Customer receives email with:
  • New status + emoji
  • Updated estimated delivery date
  • Tracking number + carrier
  • Custom note (if any)
  • "Track Order Live" button → main app /track?q=ORDER_NUM
```

---

## 📁 Structure
```
src/
├── app/
│   ├── page.tsx               ← Login
│   ├── dashboard/page.tsx     ← Main dashboard
│   └── api/
│       ├── auth/route.ts      ← Login/logout
│       ├── orders/route.ts    ← GET list + PATCH update
│       └── email/route.ts     ← Custom email send
├── lib/
│   ├── prisma.ts
│   └── email.ts
├── middleware.ts               ← Protect /dashboard
└── prisma/schema.prisma        ← Shared with main app
```

---

## 🛡️ Security Notes
- Keep this deployed on a **private URL** or enable Vercel password protection
- Use a strong `HOST_PASSWORD` (20+ chars recommended)
- Never share the HOST_SECRET
- The `DATABASE_URL` gives full read/write access — keep it private
