import { Resend } from 'resend'

const resend   = new Resend(process.env.RESEND_API_KEY)
const FROM     = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
const APP      = (process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app').replace(/\/$/, '')

const STATUS_LABELS: Record<string,string> = {
  PENDING:'Order Placed', PAYMENT_CONFIRMED:'Payment Confirmed',
  PROCESSING:'Processing', SHIPPED:'Shipped',
  OUT_FOR_DELIVERY:'Out for Delivery', DELIVERED:'Delivered',
  CANCELLED:'Cancelled', REFUNDED:'Refunded',
}
const STATUS_EMOJIS: Record<string,string> = {
  PENDING:'📋', PAYMENT_CONFIRMED:'✅', PROCESSING:'⚙️',
  SHIPPED:'🚚', OUT_FOR_DELIVERY:'🛵', DELIVERED:'🎉',
  CANCELLED:'❌', REFUNDED:'💰',
}

function html(body: string, title: string, subtitle: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#080b14;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e8edf8;padding:20px}
.wrap{max-width:580px;margin:0 auto;background:#0d1221;border:1px solid #1e2640;border-radius:20px;overflow:hidden}
.bar{height:4px;background:linear-gradient(90deg,#10d988 0%,#8b5cf6 50%,#f5b731 100%)}
.head{background:#0e1525;padding:28px 32px;text-align:center;border-bottom:1px solid #1e2640}
.logo{font-size:20px;font-weight:900;color:#fff;margin-bottom:12px}
.logo span{color:#10d988}
h1{color:#fff;font-size:19px;font-weight:800;margin-bottom:4px}
.sub{color:#6b7fa3;font-size:13px}
.body{padding:24px 28px}
.card{background:#111827;border:1px solid #1e2640;border-radius:12px;padding:16px;margin:12px 0}
.row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #1e2640}
.row:last-child{border-bottom:none}
.lbl{color:#6b7fa3;font-size:12px}
.val{color:#e8edf8;font-size:12px;font-weight:600}
.badge{display:inline-block;background:rgba(16,217,136,0.12);color:#10d988;border:1px solid rgba(16,217,136,0.25);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700}
.btn{display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#07090f;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:800;font-size:13px}
.center{text-align:center;margin:16px 0}
.footer{padding:16px 28px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1a2338}
.msg{font-size:14px;line-height:1.75;color:#c0cfe8;white-space:pre-wrap}
</style></head><body><div class="wrap">
<div class="bar"></div>
<div class="head">
  <div class="logo">Cortex<span>Cart</span></div>
  <h1>${title}</h1><p class="sub">${subtitle}</p>
</div>
<div class="body">${body}</div>
<div class="footer">© ${new Date().getFullYear()} CortexCart · <a href="${APP}" style="color:#10d988">Visit Store</a></div>
</div></body></html>`
}

export async function sendStatusUpdateEmail(to: string, data: {
  customerName: string; orderNumber: string; orderId: string
  newStatus: string; estimatedDelivery?: string
  trackingNumber?: string; carrier?: string; notes?: string
}) {
  const label    = STATUS_LABELS[data.newStatus] || data.newStatus
  const emoji    = STATUS_EMOJIS[data.newStatus] || '📦'
  const trackUrl = `${APP}/track?q=${encodeURIComponent(data.orderNumber)}`

  const bodyHtml = `
    <p style="color:#c0cfe8;font-size:14px;line-height:1.7;margin-bottom:16px;">
      Hi <strong style="color:#fff">${data.customerName}</strong>,<br>
      There's an update on your CortexCart order.
    </p>
    <div class="card">
      <div class="row"><span class="lbl">Order #</span><span class="val" style="font-family:monospace;color:#10d988">${data.orderNumber}</span></div>
      <div class="row"><span class="lbl">New Status</span><span class="badge">${emoji} ${label}</span></div>
      ${data.estimatedDelivery ? `<div class="row"><span class="lbl">Est. Delivery</span><span class="val" style="color:#10d988;font-weight:700">${data.estimatedDelivery}</span></div>` : ''}
      ${data.trackingNumber    ? `<div class="row"><span class="lbl">Tracking #</span><span class="val" style="font-family:monospace">${data.trackingNumber}</span></div>` : ''}
      ${data.carrier           ? `<div class="row"><span class="lbl">Carrier</span><span class="val">${data.carrier}</span></div>` : ''}
      ${data.notes             ? `<div class="row"><span class="lbl">Note</span><span class="val">${data.notes}</span></div>` : ''}
    </div>
    <div class="center"><a href="${trackUrl}" class="btn">Track Order Live 📍</a></div>
    <p style="text-align:center;font-size:11px;color:#5a6a8a;margin-top:12px">
      Questions? <a href="${APP}/contact" style="color:#10d988">Contact support</a>
    </p>`

  const result = await resend.emails.send({
    from: FROM, to,
    subject: `${emoji} Order Update: ${label} — #${data.orderNumber.slice(-8).toUpperCase()}`,
    html: html(bodyHtml, `${emoji} ${label}`, `Order #${data.orderNumber.slice(-8).toUpperCase()} update`),
  })

  if (result.error) {
    console.error('[HOST EMAIL ERROR]', result.error)
    throw new Error(result.error.message || 'Email send failed')
  }
  return result
}

export async function sendCustomEmail(to: string, subject: string, message: string, orderNumber?: string) {
  const bodyHtml = `
    ${orderNumber ? `<div class="card"><div class="row"><span class="lbl">Order #</span><span class="val" style="font-family:monospace;color:#10d988">${orderNumber}</span></div></div>` : ''}
    <div class="card"><p class="msg">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</p></div>
    <div class="center"><a href="${APP}/contact" class="btn">Reply via Support</a></div>`

  const result = await resend.emails.send({
    from: FROM, to, subject,
    html: html(bodyHtml, 'Message from CortexCart', 'A personal note from our team'),
  })

  if (result.error) {
    console.error('[HOST EMAIL ERROR]', result.error)
    throw new Error(result.error.message || 'Email send failed')
  }
  return result
}
