import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function isAuthed() {
  return cookies().get('host_auth')?.value === (process.env.HOST_SECRET || 'cx-host-secret')
}
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') || '15'))
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('q')?.trim() || undefined

  const where: any = {}
  if (status) where.status = status
  if (search) where.OR = [
    { orderNumber: { contains: search, mode:'insensitive' } },
    { user: { email: { contains: search, mode:'insensitive' } } },
    { user: { name:  { contains: search, mode:'insensitive' } } },
  ]

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip:(page-1)*limit, take:limit, orderBy:{createdAt:'desc'},
      include:{
        user:  { select:{ name:true, email:true } },
        items: { include:{ product:{ select:{ name:true, images:true, slug:true, brand:true } } } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total/limit) })
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const body = await req.json()
  const { orderId, status, trackingNumber, carrier, estimatedDelivery, notes } = body
  if (!orderId) return NextResponse.json({ error:'orderId required' }, { status:400 })

  const data: any = {}
  if (status !== undefined)                    data.status            = status
  if (trackingNumber !== undefined && trackingNumber !== '') data.trackingNumber = trackingNumber
  if (carrier        !== undefined && carrier !== '')        data.carrier        = carrier
  if (notes          !== undefined && notes !== '')          data.notes          = notes
  if (estimatedDelivery)                       data.estimatedDelivery = new Date(estimatedDelivery)
  if (status === 'DELIVERED') data.deliveredAt = new Date()
  if (status === 'SHIPPED')   data.shippedAt   = new Date()

  const order = await prisma.order.update({
    where:   { id:orderId }, data,
    include: {
      user:  { select:{ name:true, email:true } },
      items: { include:{ product:{ select:{ name:true, images:true } } } },
    },
  })

  const to   = (order.shippingAddress as any)?.email || order.user?.email
  const name = order.user?.name ||
    `${(order.shippingAddress as any)?.firstName||''} ${(order.shippingAddress as any)?.lastName||''}`.trim() ||
    'Customer'

  let emailSent = false
  if (to && status) {
    try {
      const { sendStatusUpdateEmail } = await import('@/lib/email')
      await sendStatusUpdateEmail(to, {
        customerName:     name,
        orderNumber:      order.orderNumber,
        orderId:          order.id,
        newStatus:        status,
        estimatedDelivery:estimatedDelivery
          ? new Date(estimatedDelivery).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})
          : undefined,
        trackingNumber:   trackingNumber || undefined,
        carrier:          carrier || undefined,
        notes:            notes || undefined,
      })
      emailSent = true
    } catch(err) {
      console.error('[PATCH /api/orders email]', err)
    }
  }

  return NextResponse.json({ order, success:true, emailSent })
}
