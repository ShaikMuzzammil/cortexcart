import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q     = searchParams.get('q')?.trim()
    const limit = parseInt(searchParams.get('limit') || '8')
    if (!q || q.length < 2) return NextResponse.json({ products: [], query: '' })

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name:        { contains: q, mode: 'insensitive' } },
          { brand:       { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category:    { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: Math.min(limit, 20),
      select: {
        id: true, slug: true, name: true, brand: true,
        currentPrice: true, comparePrice: true, images: true, rating: true, stock: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { reviewCount: 'desc' },
    })

    return NextResponse.json({ products, query: q })
  } catch (err) {
    console.error('[SEARCH]', err)
    return NextResponse.json({ products: [], query: '' })
  }
}
