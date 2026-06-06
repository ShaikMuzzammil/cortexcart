export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true, slug: true, brand: true } },
        },
      },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Return public-safe fields only
  return NextResponse.json({
    id:               order.id,
    orderNumber:      order.orderNumber,
    status:           order.status,
    total:            order.total,
    subtotal:         order.subtotal,
    tax:              order.tax,
    shipping:         order.shipping,
    paymentMethod:    order.paymentMethod,
    shippingAddress:  order.shippingAddress,
    estimatedDelivery:order.estimatedDelivery,
    trackingNumber:   order.trackingNumber,
    carrier:          order.carrier,
    createdAt:        order.createdAt,
    shippedAt:        order.shippedAt,
    deliveredAt:      order.deliveredAt,
    items:            order.items,
  })
}
