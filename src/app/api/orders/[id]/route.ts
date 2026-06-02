import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params:{ id:string } }) {
  try {
    const order = await prisma.order.findFirst({
      where: { OR:[{ orderNumber:params.id },{ id:params.id }] },
      include: { items:{ include:{ product:{ select:{ name:true, images:true, slug:true } } } } },
    })
    if (!order) return NextResponse.json({ error:'Order not found. Please check your order number.' }, { status:404 })
    return NextResponse.json(order)
  } catch(err) {
    return NextResponse.json({ error:'Failed to fetch order' }, { status:500 })
  }
}
