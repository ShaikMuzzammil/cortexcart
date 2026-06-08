export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

    const products = await prisma.product.findMany({
      where:   { isActive: true },
      select:  { id: true, name: true, slug: true, brand: true, description: true,
                 currentPrice: true, comparePrice: true,
                 images: true, rating: true, reviewCount: true, tags: true,
                 category: { select: { name: true } } },
      orderBy: { reviewCount: 'desc' },
      take:    80,
    })

    const productList = products.map((p, i) =>
      `${i+1}. ID:${p.id} | "${p.name}" by ${p.brand||'Unknown'} | ` +
      `Category: ${p.category?.name||'General'} | Price: $${p.currentPrice} | ` +
      `Rating: ${p.rating}/5 (${p.reviewCount} reviews) | ` +
      `Tags: ${p.tags?.join(', ')||''} | Desc: ${p.description?.slice(0,80)||''}`
    ).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: `You are CortexCart AI shopping assistant. Pick the 4 best matching products from this catalog for the user's query. Return ONLY valid JSON, no other text:
{"recommendations":[{"id":"exact_product_id","name":"product name","reason":"one sentence why it matches","score":0.95}]}

CATALOG:
${productList}`,
        messages: [{ role: 'user', content: query }],
      }),
    })

    const aiData = await response.json()
    const raw    = aiData.content?.[0]?.text || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch {}

    const recs   = (parsed.recommendations || []).map((r: any) => {
      const p = products.find(p => p.id === r.id)
      if (!p) return null
      return { id: p.id, name: p.name, slug: p.slug, brand: p.brand,
               price: p.currentPrice, compare: p.comparePrice,
               image: p.images?.[0] || '', rating: p.rating,
               reviews: p.reviewCount, category: p.category?.name,
               reason: r.reason, score: r.score }
    }).filter(Boolean)

    return NextResponse.json({ recommendations: recs, query })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
