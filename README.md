# CortexCart Monorepo v13

Two Next.js applications that share a Neon PostgreSQL database.

```
cortexcart/
├── main/     ← Customer store  → deploy as Vercel Project 1
└── host/     ← Admin dashboard → deploy as Vercel Project 2
```

## ✅ What's Fixed in v13

| Fix | Details |
|-----|---------|
| **Cursor lag** | Rewritten with pure RAF + CSS transforms — zero lag |
| **AI Recommendations** | Fixed missing `x-api-key` + `anthropic-version` headers; keyword fallback when no API key |
| **Reset Password** | Fully rewritten with inline styles — no CSS class dependencies, always renders |
| **119 products** | 12 categories: Tech, Gaming, Home, Fashion, Beauty, Sports, Office, Music, Travel, Books, Kitchen, Pets |
| **Batch page** | `/batch` in main app — CSV/TXT upload, up to 20 queries, export results |
| **AI Chat** | Fixed API calls with proper headers + product cards with Add to Cart |
| **Host emails** | Added `force-dynamic` + better error messages |
| **Navbar** | Batch + AI Picks links; shop dropdown with all 12 categories |
| **Home page** | Added "Why CortexCart" comparison table + Batch preview section |
| **Recommendations** | Shows mode (AI/keyword), better empty state, proper product cards |

---


## 📁 .gitignore & GitHub Actions — What's Included

```
cortexcart/
├── .gitignore                          ← root (covers both apps)
├── .github/
│   └── workflows/
│       ├── database-migration.yaml     ← auto prisma db push on schema change
│       └── ci.yaml                     ← type-check both apps on every push/PR
├── main/
│   └── .gitignore                      ← main/ specific overrides
└── host/
    └── .gitignore                      ← host/ specific overrides
```

**`.gitignore` excludes:** `node_modules/`, `.next/`, `.env*` (except `.env.example`), `.vercel`, build artifacts, OS files (`.DS_Store`, `Thumbs.db`), editor configs (`.idea/`, `.vscode/`), logs, and Prisma generated client.

**`.env.example` IS committed** — it's a safe template with no real secrets, so anyone cloning the repo knows which variables to set.

### Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `database-migration.yaml` | Push to `main`/`master` when `main/prisma/schema.prisma` changes, or manual | Runs `prisma db push` against Neon using the pooled `DATABASE_URL` |
| `ci.yaml` | Every push/PR to `main`/`master` | Type-checks both `main/` and `host/` with `tsc --noEmit` — catches errors **before** Vercel build fails |

### One-time setup
1. **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DATABASE_URL` → Value: your Neon **pooled** connection string
2. Push your code — both workflows run automatically
3. To manually re-run the DB migration: **Actions tab → Database Migration → Run workflow**

---

## 🔄 Full Push & Deploy Checklist

```bash
git init
git add .
git commit -m "feat: CortexCart v13"
git branch -M main
git remote add origin https://github.com/ShaikMuzzammil/cortexcart.git
git push -u origin main
```

After push:
1. ✅ GitHub Actions → CI runs (type-check both apps)
2. ✅ GitHub Actions → Database Migration runs (syncs schema to Neon)
3. ✅ Vercel auto-deploys both projects (if already linked) — or set up Projects 1 & 2 as below

## 🚀 Deploy

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "CortexCart v13"
git remote add origin https://github.com/YOUR_USER/cortexcart.git
git push -u origin main
```

### Step 2 — Deploy Main Store (Project 1)
- Vercel → New Project → Root Dir: `main`
- Environment Variables:

| Variable | Required | Value |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Neon pooled URL |
| `NEXTAUTH_URL` | ✅ | https://your-main.vercel.app |
| `NEXTAUTH_SECRET` | ✅ | 32+ random chars |
| `RESEND_API_KEY` | ✅ | re_xxx from resend.com |
| `RESEND_FROM_EMAIL` | ✅ | CortexCart `<onboarding@resend.dev>` |
| `CONTACT_EMAIL_TO` | ✅ | your@email.com |
| `NEXT_PUBLIC_APP_URL` | ✅ | https://your-main.vercel.app |
| `GEMINI_API_KEY` | ✅ AI features (free) | Get free key → aistudio.google.com/apikey |
| `ANTHROPIC_API_KEY` | Optional (paid) | sk-ant-xxx — only if you prefer Claude |

### Step 3 — Deploy Host Dashboard (Project 2)
- Vercel → New Project → Root Dir: `host`
- Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Same Neon URL |
| `HOST_PASSWORD` | Your admin password |
| `HOST_SECRET` | 32+ random chars |
| `RESEND_API_KEY` | Same key |
| `RESEND_FROM_EMAIL` | Same sender |
| `NEXT_PUBLIC_APP_URL` | Main app URL |

### Step 4 — Seed Database (GitHub Actions)
Add `DATABASE_URL` as GitHub Secret → Actions → Database Migration → Run workflow

### Step 5 — Seed Products
```bash
# After first deploy, in main/ folder:
npm install
npx prisma db push
npm run db:seed
```

---


## 🤖 AI Setup (Free — Gemini)

1. Go to **https://aistudio.google.com/apikey**
2. Click **Create API Key** — completely free, no credit card
3. Copy the key (starts with )
4. Add to Vercel → main app → Settings → Environment Variables:
   

**Free tier:** 15 requests/minute · 1 million tokens/day · Gemini 2.0 Flash model

AI priority order:  →  → keyword search fallback

## 🔑 Key Features

**Main Store**
- 119 products across 12 categories
- AI Recommendations (Claude-powered, keyword fallback)
- AI Chat widget (bottom-right, expandable)
- Batch recommendations (/batch) — CSV/TXT upload
- Password reset flow (forgot → email → reset page)
- Zero-lag custom cursor (RAF-based)
- "Why CortexCart" comparison vs Amazon/Flipkart
- Shop with category filters, pagination, sort

**Host Dashboard**
- Login with `HOST_PASSWORD`
- Order management + status updates
- Email customers from dashboard
- Auto-email on status change
- Live stats + analytics
