export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function isAuthed() {
  const auth   = cookies().get('host_auth')?.value
  const secret = process.env.HOST_SECRET || 'cx-host-secret'
  return auth === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')   || undefined
  const priority = searchParams.get('priority') || undefined
  const search   = searchParams.get('search')   || ''

  const [messages, rawCounts] = await Promise.all([
    prisma.contactMessage.findMany({
      where: {
        ...(status   ? { status }   : {}),
        ...(priority ? { priority } : {}),
        ...(search   ? {
          OR: [
            { name:    { contains: search, mode: 'insensitive' } },
            { email:   { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ]
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.contactMessage.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ])

  const counts: Record<string, number> = {}
  rawCounts.forEach(r => { counts[r.status] = r._count.id })

  return NextResponse.json({ messages, counts })
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const message = await prisma.contactMessage.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes  !== undefined ? { notes  } : {}),
    },
  })
  return NextResponse.json({ message, success: true })
}
