export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ─────────────────────────────────────────────────────────────
   Priority: Gemini (free forever) → Anthropic → Keyword search
   Get free Gemini key: https://aistudio.google.com/apikey
   ───────────────────────────────────────────────────────────── */

async function callGemini(prompt: string, system: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

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

    /* Try Gemini first, then Anthropic, then keyword fallback */
    let raw    = ''
    let aiMode = 'keyword'

    if (process.env.GEMINI_API_KEY) {
      try   { raw = await callGemini(query, systemPrompt); aiMode = 'gemini' }
      catch (e) { console.warn('[AI] Gemini failed, trying Anthropic:', e) }
    }
    if (!raw && process.env.ANTHROPIC_API_KEY) {
      try   { raw = await callAnthropic(query, systemPrompt); aiMode = 'anthropic' }
      catch (e) { console.warn('[AI] Anthropic failed, using keyword:', e) }
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
        return NextResponse.json({ recommendations: recs, query, mode: aiMode })
      }
    }

    /* Keyword fallback — always works, no API key needed */
    const words   = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const orClauses = words.flatMap(w => [
      { name:        { contains: w, mode: 'insensitive' as const } },
      { brand:       { contains: w, mode: 'insensitive' as const } },
      { description: { contains: w, mode: 'insensitive' as const } },
      { tags:        { has: w } },
      { category:    { name: { contains: w, mode: 'insensitive' as const } } },
    ])

    const fallback = await prisma.product.findMany({
      where: { isActive: true, OR: orClauses.length ? orClauses : [{ isActive: true }] },
      include: { category: { select: { name: true } } },
      take: 4,
      orderBy: { reviewCount: 'desc' },
    })

    const keywordRecs = fallback.map(p => ({
      id: p.id, name: p.name, slug: p.slug, brand: p.brand,
      price: p.currentPrice, compare: p.comparePrice,
      image: p.images?.[0] || '', rating: p.rating,
      reviews: p.reviewCount, category: p.category?.name,
      reason: `Matches your search for "${query}"`,
      score: 0.7,
    }))

    return NextResponse.json({ recommendations: keywordRecs, query, mode: 'keyword' })
  } catch (e: any) {
    console.error('[/api/ai/recommend]', e)
    return NextResponse.json({ error: e.message, recommendations: [] }, { status: 500 })
  }
}
