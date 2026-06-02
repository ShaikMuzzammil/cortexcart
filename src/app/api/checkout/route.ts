export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, shippingAddress, subtotal, tax, shipping, total, paymentMethod, paymentStatus } = body

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
        paymentMethod: paymentMethod || 'card',
        paymentStatus: paymentStatus || 'paid',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        items: {
          include: {
            product: { select: { name: true, brand: true, images: true } },
          },
        },
      },
    })

    // Decrement stock (non-fatal)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      }).catch(() => {})
    }

    // Send full confirmation email with product images
    const recipientEmail = shippingAddress?.email || (session?.user?.email ?? null)
    if (recipientEmail) {
      const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

      sendOrderConfirmationEmail(recipientEmail, {
        orderNumber,
        name: `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim() || session?.user?.name || 'Customer',
        items: order.items.map(i => ({
          name:   i.product.name,
          brand:  i.product.brand || undefined,
          qty:    i.quantity,
          price:  i.unitPrice,
          image:  i.product.images?.[0] || undefined,
        })),
        total,
        subtotal,
        tax,
        shipping,
        estimatedDelivery: deliveryDate,
        shippingAddress,
        paymentMethod: paymentMethod || 'card',
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, orderNumber, orderId: order.id })
  } catch (err: any) {
    console.error('[Checkout]', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
