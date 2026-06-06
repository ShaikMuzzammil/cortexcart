export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusUpdateEmail } from '@/lib/email'

// GET — list all orders
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    // Allow host app via API key too
    const apiKey = req.headers ? (req as any).headers?.get?.('x-api-key') : null
    if (apiKey !== process.env.HOST_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(req.url)
  const page  = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip:    (page - 1) * limit,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true, slug: true, brand: true } } } },
      },
    }),
    prisma.order.count(),
  ])

  return NextResponse.json({ orders, total, page, limit })
}

// PATCH — update order status
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  const apiKey  = req.headers ? (req as any).headers?.get?.('x-api-key') : null
  const isAdmin = session && (session.user as any)?.role === 'ADMIN'
  const isHost  = apiKey === process.env.HOST_API_KEY

  if (!isAdmin && !isHost) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { orderId, status, trackingNumber, carrier, estimatedDelivery, notes } = body

  if (!orderId || !status) {
    return NextResponse.json({ error: 'orderId and status required' }, { status: 400 })
  }

  const updateData: any = {
    status,
    ...(trackingNumber  && { trackingNumber }),
    ...(carrier         && { carrier }),
    ...(notes           && { notes }),
    ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
    ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    ...(status === 'SHIPPED'   && { shippedAt:   new Date() }),
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data:  updateData,
    include: {
      user:  { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
    },
  })

  const customerEmail = (order.shippingAddress as any)?.email || order.user?.email
  const customerName  = order.user?.name || `${(order.shippingAddress as any)?.firstName || ''} ${(order.shippingAddress as any)?.lastName || ''}`.trim() || 'Customer'

  if (customerEmail) {
    sendOrderStatusUpdateEmail(customerEmail, {
      customerName,
      orderNumber:       order.orderNumber,
      orderId:           order.id,
      newStatus:         status,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : undefined,
      trackingNumber:    trackingNumber || undefined,
      carrier:           carrier || undefined,
      notes:             notes || undefined,
    }).catch(console.error)
  }

  return NextResponse.json({ order, success: true })
}
