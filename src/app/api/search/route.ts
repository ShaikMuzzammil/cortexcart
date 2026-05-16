import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json({ results: [] })

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: 8,
      select: {
        id: true, slug: true, name: true, brand: true,
        currentPrice: true, images: true, rating: true,
        category: { select: { name: true } },
      },
      orderBy: { reviewCount: 'desc' },
    })

    return NextResponse.json({ results: products, query: q })
  } catch (err) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
