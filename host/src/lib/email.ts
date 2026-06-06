import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL || 'CortexCart <noreply@resend.dev>'
const APP    = process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app'

const css = `body{margin:0;padding:0;background:#080b14;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e8edf8;}.wrap{max-width:600px;margin:0 auto;background:#0d1221;border:1px solid #1e2640;border-radius:20px;overflow:hidden;}.header-bar{height:4px;background:linear-gradient(90deg,#10d988 0%,#8b5cf6 50%,#f5b731 100%);}.head{background:linear-gradient(135deg,#0e1525 0%,#111927 100%);padding:32px;text-align:center;border-bottom:1px solid #1e2640;}.logo-text{font-size:22px;font-weight:900;color:#fff;}.logo-text span{color:#10d988;}.head h1{color:#ffffff;font-size:20px;font-weight:800;margin:0 0 6px;}.head p{color:#6b7fa3;margin:0;font-size:13px;}.body{padding:28px 32px;}.card{background:#111827;border:1px solid #1e2640;border-radius:14px;padding:18px;margin:14px 0;}.row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1e2640;}.row:last-child{border-bottom:none;}.label{color:#6b7fa3;font-size:12px;}.val{color:#e8edf8;font-size:13px;font-weight:600;}.badge{display:inline-block;background:rgba(16,217,136,0.12);color:#10d988;border:1px solid rgba(16,217,136,0.25);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;}.btn{display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#080b14;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;}.footer{padding:20px 32px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1a2338;}.product-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #1e2640;}.product-row:last-child{border-bottom:none;}.product-img{width:50px;height:50px;border-radius:8px;object-fit:cover;}.product-name{font-size:13px;font-weight:700;color:#fff;}.product-meta{font-size:11px;color:#6b7fa3;}`

function wrap(content: string) {
  return `<html><head><style>${css}</style></head><body><div class="wrap">${content}<div class="footer"><p>© ${new Date().getFullYear()} CortexCart Host Admin. This is an automated email.</p></div></div></body></html>`
}

function header(title: string, subtitle: string) {
  return `<div class="header-bar"></div><div class="head"><div class="logo-text">Cortex<span>Cart</span></div><h1>${title}</h1><p>${subtitle}</p></div>`
}

export async function sendStatusUpdateEmail(to: string, data: {
  customerName: string
  orderNumber: string
  orderId: string
  newStatus: string
  estimatedDelivery?: string
  trackingNumber?: string
  carrier?: string
  notes?: string
}) {
  const trackUrl = `${APP}/track?q=${data.orderNumber}`
  const statusLabels: Record<string, string> = {
    PENDING: 'Order Placed', PAYMENT_CONFIRMED: 'Payment Confirmed', PROCESSING: 'Processing',
    SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled', REFUNDED: 'Refunded',
  }
  const statusEmojis: Record<string, string> = {
    PENDING: '📋', PAYMENT_CONFIRMED: '✅', PROCESSING: '⚙️',
    SHIPPED: '🚚', OUT_FOR_DELIVERY: '🛵', DELIVERED: '🎉',
    CANCELLED: '❌', REFUNDED: '💰',
  }
  const label = statusLabels[data.newStatus] || data.newStatus
  const emoji = statusEmojis[data.newStatus] || '📦'

  return resend.emails.send({
    from: FROM, to,
    subject: `${emoji} Your Order Update: ${label} — #${data.orderNumber.slice(-8)}`,
    html: wrap(`
      ${header(`${emoji} Order ${label}`, `Order #${data.orderNumber.slice(-8).toUpperCase()} update`)}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Hi <strong style="color:#fff;">${data.customerName}</strong>,</p>
        <div class="card">
          <div class="row"><span class="label">Order Number</span><span class="val" style="font-family:monospace;color:#10d988;">${data.orderNumber}</span></div>
          <div class="row"><span class="label">Status</span><span class="badge">${emoji} ${label}</span></div>
          ${data.estimatedDelivery ? `<div class="row"><span class="label">Est. Delivery</span><span class="val" style="color:#10d988;font-weight:700;">${data.estimatedDelivery}</span></div>` : ''}
          ${data.trackingNumber ? `<div class="row"><span class="label">Tracking #</span><span class="val" style="font-family:monospace;">${data.trackingNumber}</span></div>` : ''}
          ${data.carrier ? `<div class="row"><span class="label">Carrier</span><span class="val">${data.carrier}</span></div>` : ''}
          ${data.notes ? `<div class="row"><span class="label">Note from Team</span><span class="val">${data.notes}</span></div>` : ''}
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="${trackUrl}" class="btn">Track Order Live 📍</a>
        </div>
        <p style="text-align:center;font-size:11px;color:#5a6a8a;margin-top:12px;">
          Questions? Visit <a href="${APP}/contact" style="color:#10d988;">our support page</a>
        </p>
      </div>`
    )
  })
}

export async function sendCustomEmail(to: string, subject: string, message: string, orderNumber?: string) {
  return resend.emails.send({
    from: FROM, to,
    subject,
    html: wrap(`
      ${header('Message from CortexCart', 'A message from our team')}
      <div class="body">
        ${orderNumber ? `<div class="card"><div class="row"><span class="label">Order</span><span class="val" style="font-family:monospace;color:#10d988;">${orderNumber}</span></div></div>` : ''}
        <div class="card">
          <p style="color:#c0cfe8;font-size:14px;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="${APP}/contact" class="btn">Contact Support</a>
        </div>
      </div>`
    )
  })
}
