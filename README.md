<div align="center">

# ⚡ CortexCart

**An AI-powered e-commerce platform built as three independent, purpose-built applications sharing a single source of truth.**

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com)

</div>

---

## What is CortexCart?

CortexCart is a full-stack e-commerce platform that pairs a real-time AI shopping assistant with a hand-curated catalog of **273 products across 16 categories**. Instead of one monolithic app, it's split into **three focused applications** that each do one job well and stay in sync through a single shared database — the same architectural pattern used by real production storefronts that separate customer-facing, internal, and account-recovery surfaces.

```
                         ┌─────────────────────────────┐
                         │      Neon PostgreSQL          │
                         │   (single shared database)    │
                         └───────────────┬────────────────┘
                  ┌───────────────────────┼───────────────────────┐
                  │                       │                       │
         ┌────────▼────────┐    ┌─────────▼─────────┐   ┌─────────▼─────────┐
         │   🛍  main        │    │   🔐 host          │   │   🔑 reset         │
         │  Customer Store   │    │  Admin Dashboard   │   │  Password Reset    │
         │                   │    │   (private)         │   │   (standalone)      │
         │  Next.js 14       │    │  Next.js 14         │   │  Next.js 14         │
         │  Public-facing    │    │  Password-gated     │   │  Token-gated        │
         └───────────────────┘    └─────────────────────┘   └─────────────────────┘
```

Each app deploys independently to its own Vercel project. They never call each other directly — all coordination happens through the shared Postgres database and transactional email, exactly the way decoupled production services are meant to communicate.

---

## The Three Applications

### 🛍️ `main` — Customer Storefront
The public shopping experience. Browse, search, get AI-matched recommendations, track orders, and check out — Cash on Delivery only, no card data ever touches the app.

- 273 products across 16 categories (Tech, Audio, Computing, Electronics, Wearables, Photography, Gaming, Home, Fashion, Beauty, Sports, Office, Music, Travel, Books, Kitchen)
- AI shopping assistant with a 3-tier provider fallback chain (Gemini → Groq → scored relevance engine) — never goes down, never costs more than free-tier
- Batch recommendations: upload a CSV/TXT of products you want and get AI-matched results in bulk
- Full auth (NextAuth), live order tracking with a 6-stage delivery timeline, animated checkout, contact form

### 🔐 `host` — Admin Dashboard *(private — not publicly linked)*
Internal operations console for managing the store. Password-protected, intended to never be indexed or shared publicly.

- Order management: update status, tracking number, carrier, ETA — customer is auto-emailed on every change
- Contact Messages inbox — every message submitted on the storefront appears here with status tracking and internal notes
- Live analytics: revenue, order funnel, status breakdown
- Glassmorphism UI with animated backgrounds, fully responsive

### 🔑 `reset` — Password Reset
A minimal, standalone app whose only job is turning a reset-token link into a new password. Deliberately isolated from the main app so a password-reset flow can never be taken down by an unrelated storefront deploy or outage.

- Token validation with expiry handling and a clear "request a new link" path on failure
- Live password-strength meter, match confirmation
- Sends a "password changed" confirmation email on success
- Shares the same database as `main` — reads/writes only the two tables it needs, never touches schema

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + custom design tokens |
| Animation | Framer Motion |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless, branchable) |
| ORM | Prisma 5 |
| Auth | NextAuth.js (main) · custom cookie session (host, reset) |
| Email | [Resend](https://resend.com) — transactional email API |
| AI | Google Gemini 2.5 Flash-Lite (primary, free) → Groq Llama 3.1 (fallback, free) → scored relevance engine (always-on fallback) |
| State | Zustand |
| Icons | Lucide React |
| Hosting | Vercel (3 independent projects, shared Postgres) |
| CI | GitHub Actions (type-checking, optional manual DB seed trigger) |

---

## Live

| App | Status |
|---|---|
| 🛍️ Storefront | _add your deployed URL here_ |
| 🔑 Password Reset | _add your deployed URL here_ |
| 🔐 Admin Dashboard | **Private** — not publicly linked |

---

## Getting Started

Full step-by-step deployment instructions (Vercel settings, environment variables, build commands, and troubleshooting) live in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

Quick local setup:

```bash
cd main          # or host, or reset
npm install
cp .env.example .env.local   # fill in your values
npx prisma generate
npx prisma db push           # main only
npm run db:seed              # main only — seeds 273 products
npm run dev
```

---

<div align="center">

### Built by **[Shaik Muzzammil]**

A self-built, production-architected e-commerce platform — designed, coded, and deployed end-to-end.

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ShaikMuzzammil)

License: _MIT (https://github.com/ShaikMuzzammil/cortexcart/tree/main?tab=MIT-1-ov-file#)_

</div>
