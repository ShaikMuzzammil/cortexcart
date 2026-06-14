# CortexCart v14 — Audit Notes & Fixes

I went through the v13 codebase end-to-end against your prompt and screenshots. Good news:
most of what you described as "not working" already has a **complete, correct implementation
in this code** — the live site is just running an older build and/or is missing some env vars
and DB setup. Below is what I actually found, what I fixed, and exactly what to do to make the
live deployment match this code.

---

## ✅ Fixed in this pass (real bugs found by code audit)

### 1. Coupon banner (your Image 1) — now live
The top announcement bar was showing a generic "Batch Recommendations" message, while the
**coupon system (CORTEX10, FIRST15, FREESHIP, SAVE20, FLASH25) was already fully wired up**
in the cart store and checkout — it just wasn't visible to shoppers.

`main/src/components/Navbar.tsx` — the announcement bar now shows:
> 🚚 Free shipping on orders over $99 · Use code **CORTEX10** — 10% off · **FIRST15** — 15% off your first order

Clicking a code:
- If your cart has items → applies the coupon immediately and opens the cart drawer.
- If your cart is empty → copies the code to your clipboard with a toast telling you to paste it at checkout.

(Bumped the announcement-bar version so it reappears even for visitors who dismissed the old one.)

### 2. Host dashboard — "invisible text" bug (fixed)
Found it: the **Quick Update status buttons** in `host/src/app/dashboard/page.tsx` were
computing background color and text color from the same Tailwind class string — for several
statuses (Pending, Payment Confirmed, Shipped, Out for Delivery, Cancelled, Refunded) this made
**the text the exact same color as its own background** (e.g. violet text on a violet
background). Replaced the broken inline-style hack with the correct Tailwind classes.

### 3. Host dashboard color palette (fixed)
`host/tailwind.config.js` had `emerald`, `violet`, and `sky` defined as single flat colors
instead of full shade scales — which silently breaks any `*-400` / `*-500` class (used all over
the order status badges). Gave them proper scales so status badges render with correct,
distinct colors everywhere in the dashboard.

### 4. Shop filters — "Quick Filters" wrong colors (fixed)
`main/src/components/ProductFilters.tsx` — "Featured", "Deals", and "In Stock" quick filters
all referenced an undefined CSS variable and silently fell back to the **same emerald tint**
for all three. Now each has its correct color (sky / rose / emerald).

### 5. Custom cursor — click feedback + smoothness (fixed)
`main/src/components/CustomCursor.tsx` — clicking appended `scale(...)` directly onto
`style.transform`, which the animation loop overwrote on the very next frame, so the click
"pop" never actually showed (and could compound into garbage transform strings on rapid
clicks). Rebuilt with a proper pressed-state, and increased the ring follow-speed (0.18 → 0.32)
for a snappier, less "laggy" feel.

---

## 🔍 Already implemented in v13 (just needs deploying / configuring)

These are things your prompt described as broken, but the code for them is **already complete
and correct** in this zip:

- **Reset password flow** — `main/src/app/auth/reset-password/page.tsx` is a full
  checking → valid → invalid → done flow with password-strength meter, confirm-match
  validation, and a working API (`/api/auth/reset-password` GET to verify token, POST to set
  new password). `forgot-password` sends a styled email via Resend with the reset link.
  **The blank page in your screenshot is the OLD deployed version — this code fixes it.**
- **AI recommendations** — `main/src/app/api/ai/recommend/route.ts` already has a real AI
  chain: **Gemini (free forever) → Anthropic → keyword search fallback**. If it's showing
  "keyword" mode only, it's because `GEMINI_API_KEY` isn't set (see checklist below).
- **100+ products across 12 categories**, each with **3 related images** (same-category,
  distinct) — `main/prisma/seed.ts` already builds this. If the live site shows only ~12
  products with "CA"/"CI" placeholder boxes, the production DB hasn't been migrated/reseeded
  with this data yet.
- **"Why CortexCart" section** with a CortexCart vs Amazon vs Flipkart comparison table and
  6 advantage cards — already on the homepage.
- **Host order management** — full edit panel (status, tracking, carrier, ETA, notes), and
  saving **automatically emails the customer** a styled status-update email via Resend
  (`host/src/lib/email.ts` + `host/src/app/api/orders/route.ts` PATCH).
- **Host "email customer" tool** — `host/src/app/api/email/route.ts` + dashboard modal, sends
  a custom message via Resend.
- **Batch upload** — `main/src/app/batch/page.tsx` already accepts CSV/TXT with multiple
  product queries and returns AI-matched results.

---

## ⚙️ Deployment checklist — do this and most "not working" items disappear

Since both apps are already on Vercel + GitHub, all of this can be done from the Vercel
dashboard + GitHub Actions (no local terminal needed):

1. **Run the Prisma migration + seed against your Neon DB** (this is what populates the
   `password_reset_tokens` table and the full 100+ product catalog with 3 images each):
   - Use your `database-migration.yaml` GitHub Action (or run it manually via Actions tab) to
     execute `prisma migrate deploy` against `DATABASE_URL`/`DIRECT_URL`, then run the seed.

2. **Main app — Vercel env vars** (Project Settings → Environment Variables):
   - `DATABASE_URL`, `DIRECT_URL` — from Neon (pooled / non-pooled)
   - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` — your main app's URL
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL_TO`
   - `GEMINI_API_KEY` — **free forever**, get one at https://aistudio.google.com/apikey →
     this turns "AI recommendations" from keyword-fallback into real AI with explanations.

3. **Host app — Vercel env vars**:
   - `DATABASE_URL` (same Neon DB as main)
   - `HOST_PASSWORD`, `HOST_SECRET`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` — main app's URL (used for "View on Store" links + email links)

4. **Redeploy both projects** after setting env vars (Vercel → Deployments → Redeploy).

---

## 📋 Bigger remaining items — pick what's next

Your prompt also asked for several larger pieces of work. The code above is already a big,
mature codebase, so I want to tackle these as **focused follow-ups** rather than one giant
blind rewrite (which tends to produce shallow, half-broken results everywhere instead of solid
results in a few places). Candidates, roughly in order of effort:

- Batch page: add a "show more results" button + smarter TXT parsing/filtering for bulk
  product queries.
- "Remove that other website" — I wasn't able to identify which page/site this refers to from
  the screenshots (the browser tabs in Image 2 show unrelated projects of yours — terra-project,
  AgroWave, etc. — not part of this codebase). Let me know specifically what should be removed.
- Even more product categories/domains beyond the current 12 (e.g. groceries, toys, automotive)
  with full Flipkart-style filtering.
- Navigation restructuring beyond the current Home / Shop / Featured / Deals / AI Picks / Batch
  / Contact set.

Tell me which 2–3 of these matter most right now and I'll dig into those next.
