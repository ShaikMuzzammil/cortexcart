export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [orders, users, products, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    ])
    return NextResponse.json({ orders, users, products, revenue: revenue._sum.total || 0 })
  } catch {
    return NextResponse.json({ orders: 0, users: 0, products: 0, revenue: 0 })
  }
}
