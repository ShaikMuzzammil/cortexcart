# CortexCart Monorepo

Two Next.js 14 apps sharing one Neon PostgreSQL database via Prisma.

```
cortexcart/
├── main/     ← Customer store   → deploy as Vercel Project 1
├── host/     ← Admin dashboard  → deploy as Vercel Project 2
└── .github/workflows/
    ├── database-migration.yaml ← prisma db push + db seed on push to main/master
    └── ci.yaml                 ← type-checks both apps on every push/PR
```

---

## 1. Quick Deploy

### Local setup (either app)
```bash
cd main   # or: cd host
npm install
cp .env.example .env.local   # fill in real values
npx prisma generate
npx prisma db push            # main app only — host shares the same DB
npm run db:seed                # main app only — seeds 158 products / 17 categories
npm run dev
```

### Push to GitHub
```bash
git init && git add . && git commit -m "feat: CortexCart"
git branch -M main
git remote add origin https://github.com/YOUR_USER/cortexcart.git
git push -u origin main
```
After push: `ci.yaml` type-checks both apps, and `database-migration.yaml` runs
`prisma db push` + `prisma db seed` against Neon automatically (needs the
`DATABASE_URL` GitHub secret — see below).

### Deploy to Vercel — Project 1 (main store)
- New Project → Root Directory: `main`
- Build Command: `prisma generate && prisma db push --skip-generate --accept-data-loss && next build`
- Install Command: `npm install --ignore-scripts`
- Add env vars from the table below

### Deploy to Vercel — Project 2 (host dashboard)
- New Project → Root Directory: `host`
- Build Command: `prisma generate && next build`
- Install Command: `npm install --ignore-scripts`
- Add env vars from the table below
- Keep this on a private/unlisted URL — it's the admin panel

### GitHub Actions one-time setup
**Repo → Settings → Secrets and variables → Actions → New repository secret**
- `DATABASE_URL` = your Neon **pooled** connection string

Then: Actions tab → "Database Migration" → Run workflow (or just push — it
runs automatically whenever `main/prisma/schema.prisma` or
`main/prisma/seed.ts` changes).

---

## 2. Environment Variables

### `main/` (customer store)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct (non-pooled) connection string, for migrations |
| `NEXTAUTH_URL` | Yes | Your main app's full URL |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `NEXTAUTH_URL` |
| `RESEND_API_KEY` | Yes | From resend.com (free tier) |
| `RESEND_FROM_EMAIL` | Yes | Must be on a domain verified on Resend — see §5 |
| `CONTACT_EMAIL_TO` | Yes | Where contact-form / order alerts go |
| `HOST_APP_URL` | Optional | Host dashboard URL — used for "Open Host Dashboard" link in order-alert emails |
| `GEMINI_API_KEY` | Recommended (free) | https://aistudio.google.com/apikey — powers AI Picks / chat widget |
| `GROQ_API_KEY` | Optional (free) | https://console.groq.com/keys — high-headroom fallback if Gemini is rate-limited |
| `ANTHROPIC_API_KEY` | Optional (paid) | Extra fallback AI provider |

### `host/` (admin dashboard)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Same Neon DB as main |
| `HOST_PASSWORD` | Yes | Admin login password (20+ chars recommended) |
| `HOST_SECRET` | Yes | `openssl rand -base64 32` — session cookie signing |
| `RESEND_API_KEY` | Yes | Same Resend account as main |
| `RESEND_FROM_EMAIL` | Yes | Must be on a domain verified on Resend — see §5 |
| `CONTACT_EMAIL_TO` | Optional | Customer replies to status emails route here |
| `NEXT_PUBLIC_APP_URL` | Yes | Main store URL (used in emails + "View on Store" links) |

---

## 3. What's been built / enhanced — file-by-file

This is the full record of every code change made across the v14 → v17 passes,
organized by file so you can see exactly what changed and why.

### Removed entirely
| Path | What happened |
|---|---|
| `main/src/app/admin/**` | Deleted — duplicate, half-built admin UI inside the customer app that rendered blank. The host app is now the single admin tool. |
| `main/src/app/api/admin/**` | Deleted — orders/stats API routes only used by the above. |
| `main/src/components/admin/**` | Deleted — `AdminOrdersTable`, `AdminCharts`, only used by the above. |

### `main/` — core app

| File | What was built / enhanced |
|---|---|
| `src/components/Navbar.tsx` | Removed dead `/admin` link from the user dropdown (route no longer exists); removed unused `Settings` icon import. |
| `src/app/account/page.tsx` | Removed dead "Admin Panel" link that pointed at the deleted `/admin` route. |
| `src/lib/email.ts` | Major refactor. Added `resolveFrom()` — auto-falls back to `onboarding@resend.dev` if `RESEND_FROM_EMAIL` is set to an unverifiable domain (gmail.com, outlook.com, etc.), logging a warning instead of silently failing. Added `friendlyError()` to turn raw Resend errors into actionable messages. Added a shared `sendMail()` wrapper used by all 11 email functions so `result.error` is always checked and thrown (previously errors were silently swallowed — this is why the dashboard always said "email sent" even when it wasn't). `sendAdminNewOrderAlert` now links to `/track?q=<order>` and the host dashboard instead of the deleted `/admin` route, and includes the full shipping address. |
| `src/lib/auth.ts` | Login-success email is now fire-and-forget (`.catch()` instead of `await`), so a slow/failing email never delays sign-in. |
| `src/app/api/checkout/route.ts` | `paymentMethod` now defaults to `'cod'` (Pay Online removed). Passes `shippingAddress` through to the admin new-order alert email. |
| `src/app/checkout/page.tsx` | Removed "Pay Online / Card" entirely — checkout is Cash-on-Delivery only, redesigned as a single polished COD panel (badge, 4 feature tiles, tips checklist). Removed unused `payMethod` state and `CreditCard`/`Lock`/`AlertCircle` imports. |
| `src/components/AIChatFloat.tsx` | Removed "Powered by Claude" → now "Online · Neural Engine Active". Quick-suggestion chips are now always visible (previously disappeared after the first message). |
| `src/app/recommendations/page.tsx` | Removed "Powered by Claude AI" → "CortexCart Neural Engine". Fixed badge bug: `mode === 'ai'` never matched the API's actual `'gemini'/'groq'/'anthropic'/'keyword'` values, so it always showed "Keyword matched" even when AI answered — now any non-`'keyword'` mode correctly shows "✦ AI matched". |
| `src/app/api/ai/recommend/route.ts` | Full rewrite to fix Gemini 429 TooManyRequests errors (see §4 for details): switched model to `gemini-2.5-flash-lite`, added 15-min response cache, a self-imposed 6-call/min limiter that skips Gemini proactively, optional Groq fallback, and a much smarter scored keyword fallback that always returns 4 relevant results. |
| `src/app/page.tsx` (landing page) | Replaced the CortexCart-vs-Amazon-vs-Flipkart comparison table with an animated wave-bordered "Built different — on purpose" section: 4 live stat counters (17 categories / 158+ products / <1s AI match / 0 data sold) + a 4-step flow. Expanded `CAT_CONFIG` from 6 to all 17 categories with distinct icons/colors. Category showcase now shows all 17 (was 6). Updated copy to "17 categories" / "158+ products". Fixed footer Shop links to real category slugs. |
| `src/components/ProductFilters.tsx` | Expanded `CAT_ICONS` from 10 to all 17 category slugs (added audio, computing, electronics, wearables, photography, kitchen, books, pets; removed unused `food`). |
| `prisma/seed.ts` | Catalog expanded 119 → 158 products, 12 → 17 categories — added Audio, Computing, Electronics, Wearables, Photography (8 products each, 40 total). Fixed Pets category (all 8 products previously shared one identical image — now 5 distinct photos rotated across the category). Fixed Books category (only 2 distinct images for 6 products — added a 3rd). Fixed Audio category images — the original Unsplash photo IDs didn't match their products at all (e.g. "Echo 360 Spatial Speaker" showed an unrelated photo of a person with cables); all 8 Audio products now use Unsplash photo IDs individually verified by fetching the actual photo page. |
| `package.json` | Added `"prisma": { "seed": "..." }` config so `prisma db seed` / `prisma migrate reset` work without extra flags. |
| `.env.example` | Documented `RESEND_FROM_EMAIL` domain-verification requirement, added `GROQ_API_KEY` (optional), refreshed Gemini free-tier notes. |

### `host/` — admin dashboard

| File | What was built / enhanced |
|---|---|
| `src/app/page.tsx` (login) | Full redesign — animated scrolling grid background, 3 floating gradient orbs, ~24 drifting particles, glassmorphism card with pulsing logo glow and animated top accent line, "Encrypted / Neon DB / AI-ready" status strip, Framer Motion entrance animations throughout. |
| `src/app/globals.css` | Added new keyframes/classes for the login redesign: `login-grid-bg`, `login-orb-1/2`, `login-logo-glow`, `login-particle`. |
| `src/lib/email.ts` | Same `resolveFrom()` / `friendlyError()` / error-surfacing refactor as the main app, plus `reply_to` support via `CONTACT_EMAIL_TO` so customer replies route to a real inbox. This directly fixes the "gmail.com domain is not verified" error that was previously shown to the admin with no explanation. |
| `src/app/api/orders/route.ts` | PATCH now returns `{ emailSent, emailError }` with the real error message instead of always reporting success. |
| `src/app/dashboard/page.tsx` | `saveOrder` and `quickStatus` now show accurate feedback: a success toast "Status → Shipped. Email sent." on success, or a warning "...but email failed: \<reason\>" on failure — previously always claimed success regardless of outcome. |
| `.env.example` | Documented the `RESEND_FROM_EMAIL` verified-domain requirement and the new `CONTACT_EMAIL_TO` reply-to variable. |

### Root / infra

| File | What was built / enhanced |
|---|---|
| `.github/workflows/database-migration.yaml` | Now triggers on changes to `main/prisma/seed.ts` (not just `schema.prisma`), and runs `npm run db:seed` after `prisma db push` — this is what gets the live Neon DB from 12 → 158 products automatically on every push to `main`/`master`. |

---

## 4. AI Recommendations — provider chain & rate-limit fix

`main/src/app/api/ai/recommend/route.ts` tries providers in this order, then
falls back to a real scoring algorithm:

```
Gemini (gemini-2.5-flash-lite, free)
  -> Groq (llama-3.1-8b-instant, free, optional)
    -> Anthropic (optional, paid)
      -> Smart scored fallback (always works, no API key needed)
```

Why this exists: Google tightened Gemini's free tier hard in late 2025/2026 —
`gemini-2.0-flash` can be as low as ~250 requests/day. A handful of shoppers
clicking the same quick-suggestion chip was enough to trigger `429
TooManyRequests`. Three things fix this:

1. 15-minute response cache — the chips are a fixed set, so repeated clicks
   become instant cache hits and never call any AI provider.
2. Self-imposed 6 calls/minute limiter — proactively skips Gemini once near
   the free-tier ceiling and moves to the next provider, so a skipped call
   (invisible to the shopper) replaces a 429 (same outcome, more latency).
3. Smart scored fallback — scores the live catalog by name / category / tags
   / brand / description + a popularity nudge from rating and review count,
   always returning 4 relevant results with a real reason ("Closely
   matches…", "Top pick in Wearables for…", etc.) even with zero AI calls
   available.

To raise the ceiling further (optional, free): get a Groq key at
https://console.groq.com/keys (no card) and add `GROQ_API_KEY` — Llama 3.1 8B
on Groq's free tier is ~30 RPM / 14,400 requests/day, about 5–14x Gemini's
free daily ceiling, and is used automatically whenever Gemini is unavailable.

---

## 5. Email deliverability — "domain not verified" errors

If you see "The gmail.com domain is not verified. Please add and verify your
domain on resend.com/domains":

- Resend can only send from a domain you've verified on your account.
  `gmail.com` / `outlook.com` / `yahoo.com` / etc. can never be verified by
  anyone but their owners.
- The app now auto-falls-back to `onboarding@resend.dev` if
  `RESEND_FROM_EMAIL` uses one of those domains, so mail still sends — but
  Resend only delivers `onboarding@resend.dev` mail to your own account
  email, not real customers.
- Fix: verify a domain you own at https://resend.com/domains, then set
  `RESEND_FROM_EMAIL="CortexCart <noreply@yourdomain.com>"` in both Vercel
  projects and redeploy.
- The host dashboard now shows the real error (e.g. "Sender domain not
  verified...") instead of silently claiming success.

---

## 6. Features

### Main Store
- 158 products across 17 categories: Tech, Audio, Computing, Electronics,
  Wearables, Photography, Gaming, Home, Fashion, Beauty, Sports, Office,
  Music, Travel, Books, Kitchen, Pets — each with 3 verified, related images.
- AI Recommendations (Gemini → Groq → Anthropic → smart fallback chain)
- AI chat widget (bottom-right) with always-visible quick-suggestion chips
- Batch recommendations (`/batch`) — CSV/TXT upload, AI-matched results
- Password reset flow (forgot → email → reset page, fully wired to DB)
- Checkout: Cash-on-Delivery only, with order confirmation + admin alert emails
- Order tracking (`/track`) with live status timeline
- Zero-lag custom cursor (RAF-based)
- "Built different — on purpose" animated advantage showcase (no competitor
  comparison table)
- Shop with category filters, price range, sort, pagination

### Host Dashboard
- Password-protected login (animated, glassmorphism design)
- Order management: status, tracking number, carrier, ETA, customer notes
- Saving an order emails the customer automatically — with real
  success/failure feedback shown to the admin
- Send custom emails to customers from the dashboard
- Live stats: revenue, pending, in-transit, delivered counts
- Search/filter orders by number, email, or status

---

## 7. Security notes
- Keep the host app on a private/unlisted URL or behind Vercel password protection.
- Use a strong `HOST_PASSWORD` (20+ chars) and never share `HOST_SECRET` / `NEXTAUTH_SECRET`.
- `DATABASE_URL` gives full read/write access to both apps' shared data — keep it out of client code and source control (`.env*` is gitignored; `.env.example` is the only committed template).
