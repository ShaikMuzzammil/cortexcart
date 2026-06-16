import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP    = (process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app').replace(/\/$/, '')

// ── Safe "from" address ─────────────────────────────────────────────────────
// Same logic as main/host: never let an unverifiable RESEND_FROM_EMAIL domain
// (gmail.com etc.) hard-fail a send — fall back to Resend's test sender.
const UNVERIFIABLE_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com']
function resolveFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
  const match = raw.match(/<([^>]+)>/) || raw.match(/([^\s<>]+@[^\s<>]+)/)
  const addr  = (match?.[1] || raw).toLowerCase()
  const domain = addr.split('@')[1]
  if (domain && UNVERIFIABLE_DOMAINS.includes(domain)) {
    console.warn(`[RESET EMAIL] RESEND_FROM_EMAIL uses "${domain}", which can never be verified on Resend. ` +
      `Falling back to onboarding@resend.dev.`)
    return 'CortexCart <onboarding@resend.dev>'
  }
  return raw
}
const FROM = resolveFrom()

// Send a "your password was changed" confirmation. Best-effort — failures
// are logged but never block the password-reset flow itself.
export async function sendPasswordChangedEmail(to: string) {
  try {
    const result = await resend.emails.send({
      from: FROM, to,
      subject: '✅ Your CortexCart password was changed',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#07090f;font-family:Helvetica Neue,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#0d1018;border:1px solid #1a2035;border-radius:20px;overflow:hidden">
  <div style="height:4px;background:linear-gradient(90deg,#10d988,#8b5cf6,#f5b731)"></div>
  <div style="padding:32px;text-align:center;border-bottom:1px solid #1a2035">
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:10px">Cortex<span style="color:#10d988">Cart</span></div>
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 6px">Password changed ✅</h1>
    <p style="color:#6b7fa3;font-size:13px;margin:0">For account <strong style="color:#c0cfe8">${to}</strong></p>
  </div>
  <div style="padding:28px 32px">
    <p style="color:#c0cfe8;font-size:14px;line-height:1.7;margin:0 0 16px">
      Your CortexCart password was just changed successfully. You can now sign in with your new password.
    </p>
    <div style="background:rgba(244,63,110,0.08);border:1px solid rgba(244,63,110,0.2);border-radius:10px;padding:14px;margin:16px 0">
      <p style="color:#f43f6e;font-size:12px;line-height:1.6;margin:0">
        <strong>Wasn't you?</strong> If you didn't make this change, contact support immediately —
        someone else may have access to your account.
      </p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="${APP}/auth/login" style="display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#07090f;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px">
        Sign In →
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1a2035">
    © ${new Date().getFullYear()} CortexCart · <a href="${APP}" style="color:#10d988">Visit Store</a>
  </div>
</div></body></html>`,
    })
    if (result.error) console.error('[RESET EMAIL] send failed:', result.error)
  } catch (err) {
    console.error('[RESET EMAIL] send error:', err)
  }
}
