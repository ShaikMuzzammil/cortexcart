import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendCustomEmail } from '@/lib/email'

function isAuthed() {
  const c = cookies()
  return c.get('host_auth')?.value === (process.env.HOST_SECRET || 'cx-host-secret')
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { to, subject, message, orderNumber } = await req.json()
  if (!to || !subject || !message)
    return NextResponse.json({ error: 'to, subject, message required' }, { status: 400 })
  try {
    await sendCustomEmail(to, subject, message, orderNumber)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
