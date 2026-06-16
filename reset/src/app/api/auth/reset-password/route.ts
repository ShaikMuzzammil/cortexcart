export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordChangedEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

// GET — verify token is valid (used on page load before showing the form)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false, error: 'No token' })

  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' })
    }
    return NextResponse.json({ valid: true, email: record.email })
  } catch (e) {
    console.error('[reset-password GET]', e)
    return NextResponse.json({ valid: false, error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!record)          return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    if (record.used)      return NextResponse.json({ error: 'This reset link has already been used' }, { status: 400 })
    if (record.expiresAt < new Date()) return NextResponse.json({ error: 'Reset link has expired. Please request a new one' }, { status: 400 })

    // Update password + mark token used — atomic
    const hashed = await bcrypt.hash(password, 12)
    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data:  { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data:  { used: true },
      }),
    ])

    // Confirmation email — best effort, never blocks the response
    sendPasswordChangedEmail(record.email).catch(err => console.error('[reset-password] confirm email', err))

    return NextResponse.json({ ok: true, email: record.email })
  } catch (e) {
    console.error('[reset-password POST]', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
