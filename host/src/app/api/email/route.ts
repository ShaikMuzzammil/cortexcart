export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendCustomEmail } from '@/lib/email'

function isAuthed() {
  return cookies().get('host_auth')?.value === (process.env.HOST_SECRET || 'cx-host-secret')
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { to, subject, message, orderNumber } = await req.json()
    if (!to?.trim() || !subject?.trim() || !message?.trim())
      return NextResponse.json({ error: 'to, subject, and message are all required' }, { status: 400 })

    await sendCustomEmail(to.trim(), subject.trim(), message.trim(), orderNumber)
    return NextResponse.json({ ok: true, message: `Email sent to ${to}` })
  } catch (e: any) {
    console.error('[POST /api/email]', e)
    return NextResponse.json({ error: e.message || 'Email failed to send' }, { status: 500 })
  }
}
