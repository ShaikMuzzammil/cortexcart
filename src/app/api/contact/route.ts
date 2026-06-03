import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message, category='General Inquiry', priority='medium', phone='' } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await sendContactEmail({ name, email, subject: subject || 'No subject', message, category, priority })

    return NextResponse.json({ success: true, message: 'Message sent successfully! We\'ll respond within 24–48 hours.' })
  } catch(err: any) {
    console.error('[CONTACT]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
