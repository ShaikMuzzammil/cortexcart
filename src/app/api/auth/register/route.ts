import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 8)          return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, password: hash, role: 'CUSTOMER' } })

    // Send welcome email (fire and forget)
    sendWelcomeEmail(email, name).catch(console.error)

    return NextResponse.json({ success: true, id: user.id })
  } catch (err: any) {
    console.error('[Register]', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
