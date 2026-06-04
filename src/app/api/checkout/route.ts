import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from '@/lib/email'
import { InteractionType } from '@prisma/client'

export const dynamic = 'force-dynamic'

function addBusinessDays(date: Date, days: number): Date {
  let count = 0
  const d = new Date(date)
  while (count < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) count++
  }
  return d
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()
    const { items, shippingAddress, subtotal, tax, shipping, total, couponCode, paymentMethod = 'card' } = body

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify products exist and have stock
    const productIds = items.map((i: any) => i.productId)
    const products   = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } })
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }
    for (const item of items) {
      const p = products.find(p => p.id === item.productId)
      if (!p || p.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${p?.name || item.productId}` }, { status: 400 })
      }
    }

    const orderNumber       = generateOrderNumber()
    const estimatedDelivery = addBusinessDays(new Date(), 5)

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId:        (session?.user as any)?.id || null,
        status:        'PENDING',
        subtotal, tax, shipping,
        discount:      0,
        total,
        currency:      'USD',
        paymentStatus: paymentMethod === 'cod' ? 'pending_cod' : 'pending',
        paymentMethod,
        shippingAddress,
        estimatedDelivery,
        notes:         paymentMethod === 'cod' ? 'Cash on Delivery' : null,
        items: {
          create: items.map((i: any) => ({
            productId:  i.productId,
            quantity:   i.quantity,
            unitPrice:  i.unitPrice,
            totalPrice: i.unitPrice * i.quantity,
          }))
        }
      },
      include: { items: { include: { product: true } } }
    })

    // Decrement stock
    await Promise.all(items.map((i: any) =>
      prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } })
    ))

    // Track purchase interactions
    if ((session?.user as any)?.id) {
      await prisma.interaction.createMany({
        data: items.map((i: any) => ({
          userId:    (session!.user as any).id,
          productId: i.productId,
          type:      InteractionType.PURCHASE,
          value:     i.unitPrice * i.quantity,
        }))
      })
    }

    // Send emails
    const customerEmail = shippingAddress.email
    const customerName  = `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim()

    if (customerEmail) {
      const emailItems = order.items.map(oi => ({
        name:     oi.product.name,
        image:    oi.product.images[0] || '',
        slug:     oi.product.slug,
        quantity: oi.quantity,
        price:    oi.unitPrice,
        brand:    oi.product.brand || '',
      }))

      try {
        await sendOrderConfirmationEmail(customerEmail, {
          customerName,
          orderNumber:       order.orderNumber,
          orderId:           order.id,
          items:             emailItems,
          subtotal, tax, shipping, total,
          shippingAddress,
          paymentMethod,
          estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }),
        })
      } catch (emailErr) { console.error('[EMAIL_ORDER]', emailErr) }

      try {
        await sendAdminNewOrderAlert({
          orderNumber:   order.orderNumber,
          customerName,
          customerEmail,
          total,
          itemCount:     items.length,
          paymentMethod,
          items:         emailItems,
        })
      } catch (emailErr) { console.error('[EMAIL_ADMIN]', emailErr) }

      // Log email event
      try {
        await prisma.emailEvent.create({
          data: {
            orderId:   order.id,
            userId:    (session?.user as any)?.id || null,
            type:      'ORDER_CONFIRMATION',
            recipient: customerEmail,
            subject:   `Order Confirmed #${order.orderNumber.slice(-8).toUpperCase()}`,
            status:    'sent',
          }
        })
      } catch (dbErr) { console.error('[EMAIL_LOG]', dbErr) }
    }

    return NextResponse.json({
      orderNumber:       order.orderNumber,
      orderId:           order.id,
      estimatedDelivery: estimatedDelivery.toISOString(),
    })
  } catch (err: any) {
    console.error('[CHECKOUT]', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
