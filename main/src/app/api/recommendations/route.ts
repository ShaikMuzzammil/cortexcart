import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const excludeId  = searchParams.get('exclude')
    const categoryId = searchParams.get('category')
    const cluster    = searchParams.get('cluster') || 'general'

    // Simulate cluster-based recommendation weighting
    const clusterOrderBy: any =
      cluster === 'Tech Enthusiast'  ? { rating: 'desc' } :
      cluster === 'Impulse Buyer'    ? { reviewCount: 'desc' } :
      cluster === 'Price Sensitive'  ? { currentPrice: 'asc' } :
      cluster === 'Luxury Seeker'    ? { currentPrice: 'desc' } :
      { reviewCount: 'desc' }

    const where: any = { isActive: true }
    if (excludeId)  where.id = { not: excludeId }
    if (categoryId) where.categoryId = categoryId

    const products = await prisma.product.findMany({
      where,
      orderBy: clusterOrderBy,
      take: 8,
      select: {
        id: true, slug: true, name: true, brand: true,
        currentPrice: true, basePrice: true, comparePrice: true,
        images: true, rating: true, reviewCount: true, stock: true,
        isFeatured: true, tags: true,
        category: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json({ products, cluster, count: products.length })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
