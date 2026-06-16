import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message, category = 'General', priority = 'medium' } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Save to DB so the host dashboard can see all messages
    const saved = await prisma.contactMessage.create({
      data: { name, email, subject: subject || 'No subject', message, category, priority, status: 'new' }
    })

    // Send admin notification email (best-effort — DB save already succeeded)
    sendContactEmail({ name, email, subject: subject || 'No subject', message, category, priority })
      .catch(err => console.error('[CONTACT EMAIL]', err?.message || err))

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: "Message sent! Our team will get back to you within 24–48 hours.",
    })
  } catch (err: any) {
    console.error('[CONTACT]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
