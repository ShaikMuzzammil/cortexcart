export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body    = await req.json()
    const { items, shippingAddress, subtotal, tax, shipping, total } = body

    // Get logged in user if any
    const session = await getServerSession(authOptions)
    let userId: string | undefined

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user) userId = user.id
    }

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        status: 'PAYMENT_CONFIRMED',
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        paymentStatus: 'paid',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        items: {
          create: items.map((i: any) => ({
            productId:  i.productId,
            quantity:   i.quantity,
            unitPrice:  i.unitPrice,
            totalPrice: i.unitPrice * i.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    })

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      }).catch(() => {}) // non-fatal
    }

    // Send confirmation email with full order details
    const recipientEmail = shippingAddress?.email || (session?.user?.email ?? null)
    if (recipientEmail) {
      sendOrderConfirmationEmail(recipientEmail, {
        orderNumber,
        name: `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim() || session?.user?.name || 'Customer',
        items: order.items.map(i => ({
          name:  i.product.name,
          qty:   i.quantity,
          price: i.unitPrice,
        })),
        total,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      }).catch(console.error) // fire and forget
    }

    return NextResponse.json({ success: true, orderNumber, orderId: order.id })
  } catch (err: any) {
    console.error('[Checkout]', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
