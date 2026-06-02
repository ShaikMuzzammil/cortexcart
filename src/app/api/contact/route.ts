export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message, category, priority } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }

    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || '(No subject)',
      message: message.trim(),
      category: category || 'General Inquiry',
      priority: priority || 'Normal',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Contact]', err)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}
