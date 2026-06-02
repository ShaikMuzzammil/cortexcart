export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Try by orderNumber first, then by id
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: id },
          { id: id },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true, brand: true, images: true },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found. Check your order number.' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error('[Orders GET]', err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
