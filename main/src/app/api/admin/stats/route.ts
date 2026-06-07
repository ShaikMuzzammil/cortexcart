export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalOrders, monthOrders,
      totalUsers, monthUsers,
      totalProducts, lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: 'CANCELLED' } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { stock: { lte: 5, gt: 0 }, isActive: true }, select: { id: true, name: true, stock: true, sku: true } }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: { take: 1, include: { product: { select: { name: true } } } } } }),
    ])

    const revenueGrowth = lastMonthRevenue._sum.total
      ? (((monthRevenue._sum.total || 0) - lastMonthRevenue._sum.total) / lastMonthRevenue._sum.total) * 100
      : 0

    return NextResponse.json({
      revenue: { total: totalRevenue._sum.total || 0, month: monthRevenue._sum.total || 0, growth: revenueGrowth },
      orders: { total: totalOrders, month: monthOrders },
      users: { total: totalUsers, month: monthUsers },
      products: { total: totalProducts, lowStock: lowStockProducts },
      recentOrders,
    })
  } catch (err) {
    console.error('[Admin Stats API]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
