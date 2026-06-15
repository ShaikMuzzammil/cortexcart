export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ─────────────────────────────────────────────────────────────────────────
   AI Recommendations — provider chain & resilience

   Priority: Gemini (free forever) → Groq (free, optional, high headroom)
             → Anthropic (optional) → Smart scored keyword fallback (always works)

   Why this file looks the way it does:
   Google's free Gemini tier got squeezed hard in late 2025/2026 — Flash is
   now as low as ~10 RPM / ~250 RPD on some accounts. A handful of people
   clicking the same "quick chip" (e.g. "Best laptop deals") in a short
   window is enough to trip 429 TooManyRequests. None of that should ever be
   visible to a shopper, so this route:
     1. Caches identical queries for 15 min (huge win — chips are a fixed,
        repeated set, so most clicks become free cache hits).
     2. Tracks a rolling 60s window of Gemini calls and skips Gemini
        entirely once we're near the free-tier ceiling, going straight to
        the next provider/fallback instead of eating a 429.
     3. Falls back to Groq (https://console.groq.com/keys — free, ~30 RPM /
        14,400 RPD on llama-3.1-8b-instant) if GROQ_API_KEY is set.
     4. The final fallback is a real scoring algorithm over the live catalog
        (not a thin Prisma OR-query), so results stay relevant and
        "AI-like" even with zero AI calls.

   Get a free Gemini key: https://aistudio.google.com/apikey
   Get a free Groq key:   https://console.groq.com/keys (optional, raises
                           your effective free-tier ceiling a lot)
   ───────────────────────────────────────────────────────────────────────── */

// ── In-memory response cache (per warm serverless instance) ────────────────
// Best-effort only — resets on cold start — but on a warm instance this
// turns repeated/identical chip clicks into instant, zero-quota responses.
const CACHE_TTL_MS = 15 * 60 * 1000   // 15 minutes
const CACHE_MAX    = 200              // cap memory usage
const responseCache = new Map<string, { data: any; expiresAt: number }>()

function cacheKey(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, ' ')
}
function getCached(query: string) {
  const hit = responseCache.get(cacheKey(query))
  if (!hit) return null
  if (hit.expiresAt < Date.now()) { responseCache.delete(cacheKey(query)); return null }
  return hit.data
}
function setCached(query: string, data: any) {
  if (responseCache.size >= CACHE_MAX) {
    // evict oldest entry
    const oldestKey = responseCache.keys().next().value
    if (oldestKey) responseCache.delete(oldestKey)
  }
  responseCache.set(cacheKey(query), { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ── Proactive Gemini rate limiter (rolling 60s window) ──────────────────────
// Free-tier Flash models are commonly throttled to ~10-15 RPM. We cap
// ourselves at 6/min so we degrade gracefully to the next provider/fallback
// BEFORE Google returns a 429 — a skipped call is invisible to the user,
// a 429 just adds latency for the same end result.
const GEMINI_RPM_LIMIT = 6
const geminiCallTimes: number[] = []
function geminiHasHeadroom(): boolean {
  const now = Date.now()
  while (geminiCallTimes.length && now - geminiCallTimes[0] > 60_000) geminiCallTimes.shift()
  return geminiCallTimes.length < GEMINI_RPM_LIMIT
}
function recordGeminiCall() { geminiCallTimes.push(Date.now()) }

// ── Providers ────────────────────────────────────────────────────────────
async function callGemini(prompt: string, system: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')

  // gemini-2.5-flash-lite has the most generous free-tier RPD of the
  // currently-free Gemini models (and a healthy RPM) — switched from
  // gemini-2.0-flash, which is the model most likely to be hitting 429s.
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents:          [{ role:'user', parts:[{ text: prompt }] }],
        generationConfig:  {
          responseMimeType: 'application/json',
          maxOutputTokens:  512,
          temperature:      0.2,
        },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
}

async function callGroq(prompt: string, system: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('No GROQ_API_KEY')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:           'llama-3.1-8b-instant',
      max_tokens:      512,
      temperature:     0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: prompt },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || '{}'
}

async function callAnthropic(prompt: string, system: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No ANTHROPIC_API_KEY')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       key,
      'anthropic-version':'2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens:  512,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data?.content?.[0]?.text || '{}'
}

// ── Smart scored fallback — no AI call needed, always relevant ─────────────
// Scores the already-fetched catalog against the query across name, brand,
// category, tags and description, weighted by relevance + popularity. This
// is what runs when every AI provider is unavailable/rate-limited, so it
// needs to feel close to a real recommendation, not a blind text search.
function scoreFallback(products: any[], query: string) {
  const q     = query.toLowerCase().trim()
  const words = q.split(/\s+/).filter(w => w.length > 2)

  const scored = products.map(p => {
    const name  = (p.name || '').toLowerCase()
    const brand = (p.brand || '').toLowerCase()
    const cat   = (p.category?.name || '').toLowerCase()
    const desc  = (p.description || '').toLowerCase()
    const tags: string[] = (p.tags || []).map((t: string) => t.toLowerCase())

    let score = 0
    let matchedOn: string[] = []

    if (name.includes(q)) { score += 14; matchedOn.push('name') }
    if (cat === q || cat.includes(q) || q.includes(cat)) { score += 10; matchedOn.push('category') }

    for (const w of words) {
      if (name.includes(w))               { score += 6; matchedOn.push('name') }
      if (brand.includes(w))              { score += 4; matchedOn.push('brand') }
      if (cat.includes(w))                { score += 4; matchedOn.push('category') }
      if (tags.some(t => t.includes(w) || w.includes(t))) { score += 5; matchedOn.push('tag') }
      if (desc.includes(w))               { score += 1.5 }
    }

    // Small popularity/quality nudge so near-ties favor better-reviewed items
    score += Math.min(p.rating || 0, 5) * 0.4
    score += Math.min(Math.log10((p.reviewCount || 0) + 1), 4) * 0.5

    return { p, score, matchedOn: Array.from(new Set(matchedOn)) }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

function reasonFor(matchedOn: string[], query: string, categoryName?: string) {
  if (matchedOn.includes('name'))     return `Closely matches "${query}"`
  if (matchedOn.includes('category')) return `Top pick in ${categoryName || 'this category'} for "${query}"`
  if (matchedOn.includes('tag'))      return `Tagged for "${query}"`
  if (matchedOn.includes('brand'))    return `From a brand matching "${query}"`
  if (matchedOn.includes('popular'))  return `One of our most popular picks`
  return `Relevant to "${query}"`
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

    // Serve from cache if we've answered this exact query recently —
    // covers the common case of multiple shoppers clicking the same chip.
    const cached = getCached(query)
    if (cached) return NextResponse.json({ ...cached, cached: true })

    /* Load product catalog */
    const products = await prisma.product.findMany({
      where:   { isActive: true },
      select:  {
        id: true, name: true, slug: true, brand: true, description: true,
        currentPrice: true, comparePrice: true,
        images: true, rating: true, reviewCount: true, tags: true,
        category: { select: { name: true } },
      },
      orderBy: { reviewCount: 'desc' },
      take:    100,
    })

    const catalog = products.map((p, i) =>
      `${i+1}. id:"${p.id}" | "${p.name}" | ${p.brand||'?'} | `+
      `${p.category?.name||'General'} | $${p.currentPrice} | `+
      `${p.rating}★(${p.reviewCount}) | tags:${p.tags?.join(',')}`
    ).join('\n')

    const systemPrompt =
      `You are CortexCart's product recommendation AI. `+
      `Given the user query, pick the 4 BEST matching products from the catalog. `+
      `Return ONLY a JSON object in this exact shape (no markdown, no extra text):\n`+
      `{"recommendations":[{"id":"<exact id from catalog>","reason":"one sentence why it fits","score":0.95}]}\n\n`+
      `CATALOG:\n${catalog}`

    /* Try Gemini (if under our self-imposed rate ceiling) → Groq → Anthropic */
    let raw    = ''
    let aiMode = 'keyword'

    if (process.env.GEMINI_API_KEY && geminiHasHeadroom()) {
      recordGeminiCall()
      try   { raw = await callGemini(query, systemPrompt); aiMode = 'gemini' }
      catch (e) { console.warn('[AI] Gemini failed, trying next provider:', e) }
    } else if (process.env.GEMINI_API_KEY) {
      console.warn('[AI] Skipping Gemini — near free-tier rate limit, using next provider')
    }

    if (!raw && process.env.GROQ_API_KEY) {
      try   { raw = await callGroq(query, systemPrompt); aiMode = 'groq' }
      catch (e) { console.warn('[AI] Groq failed, trying next provider:', e) }
    }
    if (!raw && process.env.ANTHROPIC_API_KEY) {
      try   { raw = await callAnthropic(query, systemPrompt); aiMode = 'anthropic' }
      catch (e) { console.warn('[AI] Anthropic failed, using scored fallback:', e) }
    }

    /* Parse AI response */
    if (raw) {
      let parsed: any = {}
      try {
        const clean = raw.replace(/```json|```/g, '').trim()
        parsed = JSON.parse(clean)
      } catch { parsed = {} }

      const recs = (parsed.recommendations || []).slice(0, 4).map((r: any) => {
        const p = products.find(x => x.id === r.id)
        if (!p) return null
        return {
          id: p.id, name: p.name, slug: p.slug, brand: p.brand,
          price: p.currentPrice, compare: p.comparePrice,
          image: p.images?.[0] || '', rating: p.rating,
          reviews: p.reviewCount, category: p.category?.name,
          reason: r.reason || `Great match for "${query}"`,
          score:  r.score  || 0.9,
        }
      }).filter(Boolean)

      if (recs.length > 0) {
        const result = { recommendations: recs, query, mode: aiMode }
        setCached(query, result)
        return NextResponse.json(result)
      }
    }

    /* Smart scored fallback — always works, no API key or AI call needed */
    let ranked = scoreFallback(products, query)

    // If literally nothing scored (very obscure/unrelated query), still
    // return something useful rather than an empty widget.
    if (ranked.length === 0) {
      ranked = products.slice(0, 4).map(p => ({ p, score: 0.5, matchedOn: ['popular'] as string[] }))
    }

    const keywordRecs = ranked.map(({ p, matchedOn }) => ({
      id: p.id, name: p.name, slug: p.slug, brand: p.brand,
      price: p.currentPrice, compare: p.comparePrice,
      image: p.images?.[0] || '', rating: p.rating,
      reviews: p.reviewCount, category: p.category?.name,
      reason: reasonFor(matchedOn, query, p.category?.name),
      score: 0.7,
    }))

    const result = { recommendations: keywordRecs, query, mode: 'keyword' }
    setCached(query, result)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('[/api/ai/recommend]', e)
    return NextResponse.json({ error: e.message, recommendations: [] }, { status: 500 })
  }
}
