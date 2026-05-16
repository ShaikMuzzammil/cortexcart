import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q        = searchParams.get('q')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit    = parseInt(searchParams.get('limit') || '20')
    const skip     = parseInt(searchParams.get('skip')  || '0')
    const sort     = searchParams.get('sort') || 'popular'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = { isActive: true }
    if (category)           where.category = { slug: category }
    if (featured === 'true') where.isFeatured = true
    if (q)                  where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { tags: { has: q.toLowerCase() } },
    ]
    if (minPrice || maxPrice) {
      where.currentPrice = {}
      if (minPrice) where.currentPrice.gte = parseFloat(minPrice)
      if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice)
    }

    const orderBy: any =
      sort === 'price_asc'  ? { currentPrice: 'asc' } :
      sort === 'price_desc' ? { currentPrice: 'desc' } :
      sort === 'newest'     ? { createdAt: 'desc' } :
      sort === 'rating'     ? { rating: 'desc' } :
      { reviewCount: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, take: limit, skip, include: { category: { select: { name: true, slug: true } } } }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, limit, skip })
  } catch (err) {
    console.error('[Products API]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
