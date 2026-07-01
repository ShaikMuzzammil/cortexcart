# CortexCart — Deployment Guide

> For the project overview, tech stack, and architecture, see [README.md](./README.md).
> This file covers step-by-step deployment only.

3 Next.js 14 apps, one Neon PostgreSQL database.

```
cortexcart/
├── main/    Customer store         → Project 1 in Vercel
├── host/    Admin dashboard        → Project 2 in Vercel (keep private)
└── reset/   Password reset app     → Project 3 in Vercel
```

---

## CRITICAL FIX — "No Output Directory named 'public' found"

If you see this error in Vercel build logs, the fix is one of two things:

**Option A (easier) — Clear the Output Directory in Vercel settings:**
1. Vercel → your project → **Settings** tab → **Build & Development Settings**
2. Find **Output Directory** — if it says `public`, clear it (leave blank)
3. Save → Redeploy

**Option B — vercel.json already included:**
All 3 apps in this zip already have a `vercel.json` with `"outputDirectory": ".next"` — so this error should not appear if you push from this zip. If it still does, do Option A.

---

## CRITICAL FIX — Blank reset-password page

The blank page at `/auth/reset-password?token=...` had two root causes — both fixed in v20:

**Root cause 1 — Old Vercel project still live at `cortexcart.vercel.app`:**
The URL `cortexcart.vercel.app` points to an OLD project (you can tell because the navbar says "Home | Explore | Batch" instead of "Home | Shop | Featured | Deals | AI Picks | Batch | Contact"). This old project is NOT running the current code.

Fix: Vercel dashboard → find the project that owns the `cortexcart.vercel.app` domain → **Settings → Domains → Remove** that domain, then add it to your current main project. Or delete the old project entirely.

**Root cause 2 — API fetch crashing the page (fixed in code):**
The old reset-password API route was missing a `try/catch` on the `GET` handler. If the database was briefly unavailable, it threw an exception and Next.js returned an HTML error page. The page then tried to call `.json()` on that HTML response, threw a silent JavaScript error, and rendered nothing.

Fixed: GET handler is now wrapped in try/catch and always returns JSON. The page also now guards against non-JSON responses and has a class-based error boundary — so even if something crashes, you see a clear error message instead of a blank page.

---

## CRITICAL FIX — Still seeing only 12 products after deploy

This was happening because seeding depended on a GitHub Actions secret
(`DATABASE_URL`) that may never have been configured, and the Vercel build
itself never ran the seed script — it only ran `prisma db push`, which
creates empty tables but inserts no data.

**Fixed:** the `main` app's `vercel.json` build command now runs
`npm run db:seed` directly, every single deploy:
```
prisma generate && prisma db push --skip-generate --accept-data-loss && npm run db:seed && next build
```
This requires zero extra setup — no GitHub secret, no manual trigger. Every
push to GitHub that Vercel redeploys will automatically sync the database to
the full 273-product, 16-category catalog. The seed script is idempotent
(`upsert` on every row), so running it on every deploy is always safe and
never creates duplicates.

If you still see 12 products after redeploying from this zip, check the
Vercel build logs for `✅ 273 products seeded` — if that line is missing,
the build is failing before reaching the seed step (check for a
`DATABASE_URL` typo in your env vars).

---

## CRITICAL FIX — Order tracking page not reflecting host updates

When the host dashboard set an order to **"Out for Delivery"**, the
storefront's `/track` page showed the progress bar reset to nothing and
every step looking incomplete — even steps that had genuinely already
happened (Placed, Processing, Shipped).

**Root cause:** the host dashboard has 8 possible order statuses including
`OUT_FOR_DELIVERY`, but the tracking page's progress-step list only knew
about 5 of them. Looking up an unrecognized status returned `-1`, and the
progress-bar math (`currentStep / totalSteps`) silently rendered everything
as 0% complete instead of erroring — so the update looked like it "didn't
happen" even though the database was correct.

**Fixed:** `OUT_FOR_DELIVERY` is now a real step in the tracking timeline
(6 steps total: Placed → Payment Confirmed → Processing → Shipped → Out for
Delivery → Delivered). A defensive fallback was also added so any future
unrecognized status shows a clear message instead of a misleading
zero-progress bar.

---

## STEP 1 — Push to GitHub

```bash
git add .
git commit -m "v20: reset app, 273 products, blank page fix, contacts inbox"
git push origin main
```

---

## STEP 2 — Deploy `main/` (Customer Store)

### Vercel settings
| Setting | Value |
|---|---|
| Root Directory | `main` |
| Build Command | `prisma generate && prisma db push --skip-generate --accept-data-loss && npm run db:seed && next build` |
| Install Command | `npm install --ignore-scripts` |
| Output Directory | *(leave blank — auto-detected from vercel.json)* |

### Environment variables
| Variable | Required | Value / Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon **pooled** connection string |
| `DIRECT_URL` | Yes | Neon **direct** (non-pooled) connection string |
| `NEXTAUTH_URL` | Yes | `https://your-main-app.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | Run: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `NEXTAUTH_URL` |
| `RESEND_API_KEY` | Yes | From resend.com |
| `RESEND_FROM_EMAIL` | Yes | `CortexCart <noreply@yourdomain.com>` — domain must be verified on Resend |
| `CONTACT_EMAIL_TO` | Yes | Your email — where contact form alerts go |
| `GEMINI_API_KEY` | Free, recommended | https://aistudio.google.com/apikey |
| `GROQ_API_KEY` | Free, optional | https://console.groq.com/keys — extra AI fallback |
| `RESET_APP_URL` | Yes (after deploying reset/) | `https://your-reset-app.vercel.app` |
| `HOST_APP_URL` | Optional | `https://your-host-app.vercel.app` — for order alert emails |

---

## STEP 3 — Deploy `host/` (Admin Dashboard)

### Vercel settings
| Setting | Value |
|---|---|
| Root Directory | `host` |
| Build Command | `prisma generate && next build` |
| Install Command | `npm install --ignore-scripts` |
| Output Directory | *(leave blank)* |

### Environment variables
| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | Yes | Same Neon pooled string as main |
| `HOST_PASSWORD` | Yes | Strong admin password (20+ chars) |
| `HOST_SECRET` | Yes | `openssl rand -base64 32` |
| `RESEND_API_KEY` | Yes | Same Resend key as main |
| `RESEND_FROM_EMAIL` | Yes | Same verified address as main |
| `CONTACT_EMAIL_TO` | Optional | Customer email replies route here |
| `NEXT_PUBLIC_APP_URL` | Yes | Your main app URL |

> Keep the host URL private. Enable Vercel Password Protection under project Settings for extra security.

---

## STEP 4 — Deploy `reset/` (Password Reset App)

This is the standalone app that handles `/auth/reset-password?token=...`.
It shares the same Neon DB but **never modifies the schema** — it only reads
`PasswordResetToken` and updates `User.password`.

### Vercel settings
| Setting | Value |
|---|---|
| Root Directory | `reset` |
| Build Command | `prisma generate && next build` |
| Install Command | `npm install --ignore-scripts` |
| Output Directory | *(leave blank)* |

> **Do not use `prisma db push` here** — this app never owns the schema.

### Environment variables (only 4 needed)
| Variable | Value |
|---|---|
| `DATABASE_URL` | Same Neon pooled string as main and host |
| `NEXT_PUBLIC_APP_URL` | Your **main** app URL (for "Back to store" links) |
| `RESEND_API_KEY` | Same Resend key |
| `RESEND_FROM_EMAIL` | Same verified address |

### After deploying reset/ — link it to main

1. Copy the reset app's Vercel URL (e.g. `cortexcart-reset-abc.vercel.app`)
2. Go to your **main** Vercel project → Settings → Environment Variables
3. Add: `RESET_APP_URL` = `https://cortexcart-reset-abc.vercel.app`
4. Redeploy main (Deployments → 3 dots → Redeploy)

From this point on, "Forgot Password" emails link to the reset app.

---

## STEP 5 — GitHub Actions (optional — manual backup only)

**You can skip this step.** The `main` build command above (Step 2) already
runs `prisma db push && npm run db:seed` on **every single Vercel deploy** —
so your database stays in sync automatically every time you push to GitHub.
No GitHub secret or extra setup required for normal use.

This workflow exists only as a manual fallback — for example, if you want to
push a schema/seed change to Neon without triggering a full app redeploy.
To enable it:
1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Name: `DATABASE_URL` → Value: Neon pooled connection string
3. Actions tab → "Database Migration" → **Run workflow** (manual trigger only)

---

## Summary — 3 Vercel projects

| Project | Root Dir | Build Command | DB Push + Seed? |
|---|---|---|---|
| main (store) | `main` | `prisma generate && prisma db push ... && npm run db:seed && next build` | Yes — on every deploy, automatically. Creates/updates all tables and seeds 273 products. |
| host (admin) | `host` | `prisma generate && next build` | No — reads same DB |
| reset (password) | `reset` | `prisma generate && next build` | No — reads same DB |

All 3 share the same `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

---

## What's in this version (v21)

### Products
- **273 products across 16 categories**
- Tech: 30 | Gaming: 20 | Home: 20 | Fashion: 20 | Sports: 18
- Audio/Computing/Electronics/Wearables/Photography/Beauty/Office/Music/Travel/Books/Kitchen: 15 each
- All products have 3 verified, relevant Unsplash images (no mismatched photos)
- Seeding now runs automatically on **every** Vercel deploy (see Critical Fix above) — no longer dependent on GitHub Actions being configured

### Order tracking
- Fixed: "Out for Delivery" status set by the host dashboard now correctly appears on the storefront's `/track` page (previously reset the progress bar to 0% — see Critical Fix above)
- Tracking timeline expanded to 6 stages: Placed → Payment Confirmed → Processing → Shipped → Out for Delivery → Delivered
- Defensive fallback added for any future unrecognized order status

### Host dashboard
- New **Messages tab** in the nav bar (with red unread badge)
- Full inbox: all contact form submissions, expand/collapse, auto-mark read
- Per-message: full message text, internal notes (saved on blur), status actions (Mark Replied / Archive), Reply via Email button (opens mail client pre-filled)
- Status filters: New / Read / Replied / Archived with live counts
- Fixed: lock icon on the login screen was visually overlapping the placeholder text — a global CSS class's padding was silently overriding the icon-spacing utility classes (now isolated with `@layer components` so this entire bug class can't recur elsewhere in the app)

### Reset app (`reset/`)
- Completely standalone Next.js 14 app
- Token validation on load (shows "expired" screen if token is used/old)
- Password strength meter (4 criteria, color-coded bar)
- Confirm-password match indicator
- Class-based error boundary — never shows a blank page
- Sends "password changed" confirmation email on success
- Home button → main store, "Back to sign in" → main store login

### AI recommendations
- Model upgraded: `gemini-2.0-flash` → `gemini-2.5-flash-lite` (higher free RPD)
- 15-min cache on identical queries (chip clicks are free)
- Self-imposed 6 calls/min Gemini limiter (prevents 429 before they happen)
- Optional Groq fallback (`GROQ_API_KEY`, free, 14,400 req/day)
- Smart scored fallback always returns 4 relevant results

### Checkout
- Cash-on-Delivery only (Pay Online / Card removed entirely)

### Emails
- Auto-fallback if `RESEND_FROM_EMAIL` uses an unverifiable domain (gmail.com etc.)
- Actual error messages shown in host dashboard ("domain not verified" instead of silent success)
- Admin order-alert email now links to Track Order, not the deleted /admin route

---

## Email domain fix (Resend "testing" or "domain not verified" error)

If emails only arrive in your own inbox (not customers'), or you see:
*"You can only send testing emails to your own email address"*

Fix:
1. Go to https://resend.com/domains
2. Add your domain (e.g. `yourdomain.com`)
3. Add the 3 DNS records Resend shows you (TXT + DKIM + CNAME)
4. Wait for verification (usually 5–30 minutes)
5. Update `RESEND_FROM_EMAIL` in **both** main and host Vercel projects:
   `CortexCart <noreply@yourdomain.com>`
6. Redeploy both projects

Until verified, emails still send (fall back to `onboarding@resend.dev`) but only deliver to your own Resend-registered email.
