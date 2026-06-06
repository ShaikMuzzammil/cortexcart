export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const orders = await prisma.order.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true, slug: true, brand: true } },
        },
      },
    },
  })

  return NextResponse.json({ orders })
}
