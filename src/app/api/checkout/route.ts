import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { items, shippingAddress, subtotal, tax, shipping, total } = await req.json()
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber, status:'PAYMENT_CONFIRMED', subtotal, tax, shipping, total,
        shippingAddress, paymentStatus:'paid',
        estimatedDelivery: new Date(Date.now() + 5*24*60*60*1000),
        items: { create: items.map((i:any) => ({ productId:i.productId, quantity:i.quantity, unitPrice:i.unitPrice, totalPrice:i.unitPrice*i.quantity })) },
      },
      include: { items:{ include:{ product:{ select:{ name:true } } } } },
    })

    for (const item of items) {
      await prisma.product.update({ where:{ id:item.productId }, data:{ stock:{ decrement:item.quantity } } })
    }

    if (shippingAddress?.email) {
      sendOrderConfirmationEmail(shippingAddress.email, {
        orderNumber,
        name: `${shippingAddress.firstName||''} ${shippingAddress.lastName||''}`.trim()||'Customer',
        items: order.items.map(i => ({ name:i.product.name, qty:i.quantity, price:i.unitPrice })),
        total,
        estimatedDelivery: new Date(Date.now()+5*24*60*60*1000).toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' }),
      }).catch(console.error)
    }

    return NextResponse.json({ success:true, orderNumber, orderId:order.id })
  } catch(err:any) {
    console.error('[Checkout]', err)
    return NextResponse.json({ error:'Failed to place order' }, { status:500 })
  }
}
