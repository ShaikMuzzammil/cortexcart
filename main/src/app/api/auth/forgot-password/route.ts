import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
const APP    = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success — never reveal if email exists
    if (!user || !user.password) {
      return NextResponse.json({ ok: true })
    }

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data:  { used: true },
    })

    // Create new token (expires in 1 hour)
    const token     = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    })

    const resetUrl = `${APP}/auth/reset-password?token=${token}`

    await resend.emails.send({
      from: FROM,
      to:   email,
      subject: '🔐 Reset your CortexCart password',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:20px;background:#080b14;font-family:Helvetica Neue,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#0d1221;border:1px solid #1e2640;border-radius:20px;overflow:hidden">
  <div style="height:4px;background:linear-gradient(90deg,#10d988,#8b5cf6,#f5b731)"></div>
  <div style="padding:32px;text-align:center;border-bottom:1px solid #1e2640">
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:10px">Cortex<span style="color:#10d988">Cart</span></div>
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 6px">Reset your password 🔐</h1>
    <p style="color:#6b7fa3;font-size:13px;margin:0">We received a request to reset the password for <strong style="color:#c0cfe8">${email}</strong></p>
  </div>
  <div style="padding:28px 32px">
    <p style="color:#c0cfe8;font-size:14px;line-height:1.7;margin:0 0 20px">
      Click the button below to set a new password. This link is valid for <strong style="color:#fff">1 hour</strong> and can only be used once.
    </p>
    <div style="text-align:center;margin:24px 0">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#07090f;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px">
        Reset My Password →
      </a>
    </div>
    <div style="background:#111827;border:1px solid #1e2640;border-radius:10px;padding:14px;margin:16px 0">
      <p style="color:#6b7fa3;font-size:11px;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Or copy this link:</p>
      <p style="color:#10d988;font-size:11px;word-break:break-all;margin:0;font-family:monospace">${resetUrl}</p>
    </div>
    <p style="color:#4a5a7a;font-size:12px;line-height:1.6;margin:16px 0 0">
      If you didn't request this, you can safely ignore this email. Your password will not change until you click the link above.<br><br>
      This link expires at <strong style="color:#c0cfe8">${expiresAt.toUTCString()}</strong>
    </p>
  </div>
  <div style="padding:16px 32px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1a2338">
    © ${new Date().getFullYear()} CortexCart · <a href="${APP}/contact" style="color:#10d988">Need help?</a>
  </div>
</div></body></html>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[forgot-password]', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
