export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendShippingEmail, sendOutForDeliveryEmail, sendDeliveredEmail } from '@/lib/email'

// GET — list all orders for admin
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page  = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
      },
    }),
    prisma.order.count(),
  ])

  return NextResponse.json({ orders, total, page, limit })
}

// PATCH — update order status (admin only)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { orderId, status, trackingNumber, carrier } = body

  if (!orderId || !status) {
    return NextResponse.json({ error: 'orderId and status required' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(carrier        && { carrier }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  })

  const customerEmail = order.shippingAddress
    ? (order.shippingAddress as any).email
    : order.user?.email

  const customerName = order.user?.name
    || `${(order.shippingAddress as any)?.firstName||''} ${(order.shippingAddress as any)?.lastName||''}`.trim()
    || 'Customer'

  const orderItems = order.items.map(i => ({
    name:  i.product.name,
    qty:   i.quantity,
    price: i.unitPrice,
    image: i.product.images?.[0] || undefined,
  }))

  // Send status-specific notification email
  if (customerEmail) {
    if (status === 'SHIPPED') {
      sendShippingEmail(customerEmail, {
        name: customerName,
        orderNumber: order.orderNumber,
        trackingNumber,
        carrier,
        estimatedDelivery: order.estimatedDelivery?.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) || '5–7 business days',
        items: orderItems,
      }).catch(console.error)
    }

    if (status === 'OUT_FOR_DELIVERY') {
      sendOutForDeliveryEmail(customerEmail, {
        name: customerName,
        orderNumber: order.orderNumber,
        estimatedTime: 'Today between 9 AM – 6 PM',
        items: orderItems,
      }).catch(console.error)
    }

    if (status === 'DELIVERED') {
      sendDeliveredEmail(customerEmail, {
        name: customerName,
        orderNumber: order.orderNumber,
        deliveredAt: new Date().toLocaleString('en-US', { dateStyle:'full', timeStyle:'short' }),
        items: orderItems,
        total: order.total,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true, order })
}
