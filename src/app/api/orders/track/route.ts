import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Order number required' }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { id: q },
      ]
    },
    include: {
      items: {
        include: {
          product: { select: { id:true, name:true, slug:true, images:true, brand:true } }
        }
      }
    }
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  return NextResponse.json({
    id:               order.id,
    orderNumber:      order.orderNumber,
    status:           order.status,
    paymentStatus:    order.paymentStatus,
    paymentMethod:    order.paymentMethod,
    trackingNumber:   order.trackingNumber,
    carrier:          order.carrier,
    estimatedDelivery:order.estimatedDelivery,
    shippedAt:        order.shippedAt,
    deliveredAt:      order.deliveredAt,
    total:            order.total,
    shippingAddress:  order.shippingAddress,
    createdAt:        order.createdAt,
    items:            order.items,
  })
}
