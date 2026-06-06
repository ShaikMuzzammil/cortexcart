import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function isAuthed() {
  const cookieStore = cookies()
  const auth = cookieStore.get('host_auth')
  return auth?.value === (process.env.HOST_SECRET || 'cx-host-secret')
}

export const dynamic = 'force-dynamic'

// GET all orders
export async function GET(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = parseInt(searchParams.get('page') || '1')
  const limit   = parseInt(searchParams.get('limit') || '20')
  const status  = searchParams.get('status') || undefined
  const search  = searchParams.get('q') || undefined

  const where: any = {}
  if (status) where.status = status
  if (search) where.OR = [
    { orderNumber: { contains: search, mode: 'insensitive' } },
    { user: { email: { contains: search, mode: 'insensitive' } } },
    { user: { name:  { contains: search, mode: 'insensitive' } } },
  ]

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip:    (page - 1) * limit,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true, slug: true, brand: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total / limit) })
}

// PATCH — update order
export async function PATCH(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { orderId, status, trackingNumber, carrier, estimatedDelivery, notes } = body

  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const updateData: any = {}
  if (status)            updateData.status            = status
  if (trackingNumber)    updateData.trackingNumber    = trackingNumber
  if (carrier)           updateData.carrier           = carrier
  if (notes)             updateData.notes             = notes
  if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery)
  if (status === 'DELIVERED') updateData.deliveredAt  = new Date()
  if (status === 'SHIPPED')   updateData.shippedAt    = new Date()

  const order = await prisma.order.update({
    where:   { id: orderId },
    data:    updateData,
    include: {
      user:  { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  })

  // Send status update email
  const customerEmail = (order.shippingAddress as any)?.email || order.user?.email
  const customerName  = order.user?.name || `${(order.shippingAddress as any)?.firstName || ''} ${(order.shippingAddress as any)?.lastName || ''}`.trim() || 'Customer'

  if (customerEmail && status) {
    try {
      const { sendStatusUpdateEmail } = await import('@/lib/email')
      await sendStatusUpdateEmail(customerEmail, {
        customerName,
        orderNumber:       order.orderNumber,
        orderId:           order.id,
        newStatus:         status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : undefined,
        trackingNumber:    trackingNumber || undefined,
        carrier:           carrier || undefined,
        notes:             notes || undefined,
      })
    } catch (err) { console.error('[EMAIL]', err) }
  }

  return NextResponse.json({ order, success: true })
}
