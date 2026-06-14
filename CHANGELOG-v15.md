# CortexCart v15 — Changes in this session

This builds on v14. Below is exactly what changed, why, and what (if anything)
you still need to do in Vercel/Neon/Resend.

---

## 1. Removed the duplicate/broken `/admin` route from the **main** app
Your screenshot showed `cortexcart.vercel.app/admin` rendering completely
blank. That route was a half-built duplicate of the real admin — the actual
admin tool is the separate **host** app (`cortexcart-host-*.vercel.app`).

- Deleted `main/src/app/admin/**`, `main/src/app/api/admin/**`,
  `main/src/components/admin/**` entirely.
- Removed the dead "Admin" links from the user dropdown (Navbar) and the
  Account page — they pointed at the now-deleted `/admin` route.

**Result:** there is now exactly ONE admin interface — the host app — and
nothing in the main site links to a blank page anymore.

---

## 2. "New Order Alert" email → real Track Order link (not the dead admin link)
`sendAdminNewOrderAlert` in `main/src/lib/email.ts` used to link to
`${APP}/admin` (now deleted). It now:
- Links to `${APP}/track?q=<orderNumber>` ("📦 Track This Order")
- Optionally links to the host dashboard via `HOST_APP_URL` /
  `NEXT_PUBLIC_HOST_APP_URL` if you set one of those env vars
- Includes the full shipping address in the alert email

---

## 3. AI branding — removed "Powered by Claude"
Per your request, the floating AI widget and `/recommendations` page no
longer say "Powered by Claude". They now say **"CortexCart Neural Engine"**.
The chat widget's quick-suggestion chips (Best laptop deals / Gaming mouse
under $80 / Wireless earbuds) are now always visible, not just on first load.

The AI itself already runs on **Gemini 2.0 Flash** (free-forever tier) when
`GEMINI_API_KEY` is set — see section 8.

---

## 4. Checkout — Cash on Delivery only (Pay Online removed)
Per your request, the "Pay Online / Card" option is fully removed from
checkout. The payment step now shows a single, polished COD panel:
- "Cash on Delivery · Only option · Always free" badge
- 4 feature tiles (Pay only on arrival / No card required / Up to $500 orders
  / Live tracking)
- Checklist of COD tips

`paymentMethod` defaults to `'cod'` everywhere in the checkout API.

---

## 5. Landing page — "Why CortexCart" section rebuilt
The old section directly compared CortexCart vs **Amazon vs Flipkart** in a
table. That's been replaced with:
- An animated wave-bordered panel with 4 live stat counters
  (17 Categories / 158+ Products / <1s AI Match / 0 Data Sold)
- A 4-step "Built different — on purpose" flow (Tell the AI → Instant neural
  matching → Transparent verified results → Track every step home)
- Updated copy: "17 curated categories", "158+ hand-curated products"

No competitor names anywhere on the page anymore.

---

## 6. Catalog massively expanded: 119 → **158 products**, 12 → **17 categories**
Added 5 new categories with 8 products each (40 new products total):
**Audio, Computing, Electronics, Wearables, Photography** — these match the
category slugs your screenshots showed in the Shop filters.

Also fixed two real bugs in the existing catalog:
- **Pets category** — all 8 products shared the *exact same image*, so every
  product page showed "3 related images" that were actually 3 copies of one
  photo. Now uses 5 distinct photos rotated across the category.
- **Books category** — only had 2 distinct images for 6 products (1 was a
  duplicate), causing the same "identical images" issue. Added a 3rd distinct
  image.

`prisma/seed.ts` is fully idempotent (`upsert` on `sku`/`slug`) — running it
again is always safe and won't create duplicates.

---

## 7. GitHub Actions — DB seed now runs automatically
Previously `database-migration.yaml` only ran `prisma db push` (schema only)
— it never seeded products. That's why your live site was stuck at "12
products" no matter what we changed in `seed.ts`.

Now:
- Triggers on changes to `main/prisma/schema.prisma` **or**
  `main/prisma/seed.ts`
- Runs `prisma db push` → **`npm run db:seed`** → table check
- Added `"prisma": { "seed": "..." }` to `main/package.json` so
  `prisma db seed` / `prisma migrate reset` work out of the box too

**This is the fix that gets your live Neon DB from 12 → 158 products and
12 → 17 categories** without you running anything locally — just merge to
`main`/`master` (or click "Run workflow" in the Actions tab).

---

## 8. AI Recommendations — already wired to free Gemini
`main/src/app/api/ai/recommend/route.ts` already calls **Gemini 2.0 Flash**
(`GEMINI_API_KEY`) with a keyword-matching fallback if the key is missing.
**To make AI recommendations "real":**
1. Get a free key: https://aistudio.google.com/apikey (15 req/min, 1M
   tokens/day, free forever)
2. Add `GEMINI_API_KEY=AIza...` to the **main** Vercel project's environment
   variables → redeploy

---

## 9. Host login page — full redesign
`host/src/app/page.tsx` was a plain static form. Now:
- Animated scrolling grid background
- 3 floating gradient orbs (emerald / violet / sky), slow drift animation
- ~24 drifting particle dots
- Glassmorphism login card with animated top accent line + pulsing logo glow
- Mini status strip: Encrypted · Neon DB · AI-ready
- Framer Motion entrance animations throughout

All new keyframes/classes live in `host/src/app/globals.css`
(`login-grid-bg`, `login-orb-1/2`, `login-logo-glow`, `login-particle`).

---

## 10. Host dashboard — email sending finally surfaces real errors
Your screenshot showed: *"The gmail.com domain is not verified. Please add
and verify your domain on resend.com/domains"* — but the dashboard still said
"Customer notified by email" regardless.

Root cause: Resend's SDK returns `{ error }` on failure — it does **not**
throw — so `sendStatusUpdateEmail` / `sendCustomEmail` never reported the
error, and `/api/orders` PATCH always responded `emailSent: true`.

Fixed in `host/src/lib/email.ts` + `main/src/lib/email.ts`:
- Every send now checks `result.error` AND wraps in try/catch
- New `friendlyError()` turns Resend errors into actionable messages, e.g.
  *"Sender domain not verified on Resend. Verify a domain at
  resend.com/domains, then set RESEND_FROM_EMAIL to an address on that
  domain."*
- **Auto-fallback**: if `RESEND_FROM_EMAIL` is set to `@gmail.com`,
  `@outlook.com`, `@yahoo.com`, `@hotmail.com`, `@icloud.com`, or `@live.com`
  (domains that can *never* be verified on Resend), the app automatically
  falls back to `onboarding@resend.dev` so mail still sends, and logs a
  warning telling you to verify your own domain.
- Added `reply_to` support (`CONTACT_EMAIL_TO`) so customer replies to
  status/order emails go to a real inbox.

`/api/orders` PATCH now returns `{ emailSent, emailError }`, and the
dashboard's quick-status buttons + "Save" button show the *real* outcome:
- ✅ "Status → Shipped. Email sent." (success)
- ⚠️ "Status → Shipped, but email failed: <reason>" (failure, with reason)

**To make emails actually deliver to real customers:** verify your own
domain at https://resend.com/domains, then set
`RESEND_FROM_EMAIL="CortexCart <noreply@yourdomain.com>"` in **both** Vercel
projects. Until then, mail will fall back to `onboarding@resend.dev`, which
Resend only delivers to the account owner's own verified email — fine for
testing, not for real customers.

---

## What's config/deploy-only (no code change needed)
- **Seed the live DB**: push to `main`/`master` (or run the workflow
  manually) — the updated GitHub Action seeds all 158 products / 17
  categories automatically (see #7).
- **Enable real AI**: add `GEMINI_API_KEY` to the main app's Vercel env vars
  (see #8).
- **Fix email deliverability for real customers**: verify a domain on Resend
  and set `RESEND_FROM_EMAIL` to an address on that domain, in both Vercel
  projects (see #10).
- **Optional**: set `HOST_APP_URL` (or `NEXT_PUBLIC_HOST_APP_URL`) on the
  main app so admin order-alert emails link straight to the host dashboard.
