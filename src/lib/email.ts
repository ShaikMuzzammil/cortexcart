import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
const TO     = process.env.CONTACT_EMAIL_TO!

const base = `
body{margin:0;padding:0;background:#080b14;font-family:'Helvetica Neue',sans-serif;color:#e8edf8;}
.wrap{max-width:580px;margin:0 auto;background:#131829;border:1px solid #1e2640;border-radius:20px;overflow:hidden;}
.head{background:linear-gradient(135deg,#10d988 0%,#0a9e62 100%);padding:36px 32px;text-align:center;}
.head h1{color:#080b14;font-size:26px;font-weight:900;margin:0;letter-spacing:-0.5px;}
.head p{color:rgba(8,11,20,0.75);margin:6px 0 0;font-size:13px;}
.body{padding:28px 32px;}
.card{background:#0e1220;border:1px solid #1e2640;border-radius:14px;padding:18px;margin:14px 0;}
.btn{display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#080b14;padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;margin:14px 0;}
.price{color:#10d988;font-weight:800;font-size:18px;font-family:monospace;}
.badge{display:inline-block;background:rgba(16,217,136,0.1);color:#10d988;border:1px solid rgba(16,217,136,0.25);border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;}
.badge-gold{background:rgba(245,183,49,0.1);color:#f5b731;border-color:rgba(245,183,49,0.25);}
hr{border:none;border-top:1px solid #1e2640;margin:20px 0;}
.footer{padding:20px 32px;text-align:center;color:#5a6a8a;font-size:11px;border-top:1px solid #1e2640;}
.row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1e2640;}
.row:last-child{border-bottom:none;}
.label{color:#5a6a8a;font-size:11px;text-transform:uppercase;letter-spacing:.5px;}
`

// ── Contact email ─────────────────────────
export async function sendContactEmail(data: { name:string; email:string; subject:string; message:string; category:string; priority:string }) {
  // Deliver to host (your Gmail)
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `[CortexCart] [${data.priority.toUpperCase()}] ${data.subject}`,
    html: `<html><head><style>${base}</style></head><body><div class="wrap">
      <div class="head"><h1>📬 New Message</h1><p>${data.category} · ${data.priority}</p></div>
      <div class="body">
        <div class="card">
          <div class="row"><div><div class="label">From</div><strong>${data.name}</strong></div><a href="mailto:${data.email}" style="color:#10d988;">${data.email}</a></div>
          <div class="row"><div class="label">Category</div><span class="badge">${data.category}</span></div>
          <div class="row"><div class="label">Priority</div><span class="badge badge-gold">${data.priority}</span></div>
        </div>
        <div class="card"><div class="label">Message</div><p style="color:#e8edf8;line-height:1.7;margin:8px 0 0;">${data.message}</p></div>
        <p style="color:#5a6a8a;font-size:12px;">Reply to: <a href="mailto:${data.email}" style="color:#10d988;">${data.email}</a></p>
      </div>
      <div class="footer">CortexCart — All contact messages forwarded to host</div>
    </div></body></html>`,
  })

  // Confirmation to user
  return resend.emails.send({
    from: FROM, to: data.email,
    subject: `✅ We received your message — CortexCart`,
    html: `<html><head><style>${base}</style></head><body><div class="wrap">
      <div class="head"><h1>Message Received ✅</h1><p>We'll get back to you soon</p></div>
      <div class="body">
        <p>Hi <strong>${data.name}</strong>,</p>
        <p style="color:#8896b3;line-height:1.7;">Thank you for reaching out. Your message has been received and delivered to our team. An advanced notification has been sent to our host.</p>
        <div class="card">
          <div class="row"><div class="label">Subject</div><span style="color:#e8edf8;">${data.subject}</span></div>
          <div class="row"><div class="label">Category</div><span class="badge">${data.category}</span></div>
          <div class="row"><div class="label">Priority</div><span class="badge badge-gold">${data.priority}</span></div>
        </div>
        <div class="card"><div class="label">Your message</div><p style="color:#5a6a8a;font-style:italic;margin:8px 0 0;">"${data.message}"</p></div>
        <p style="color:#5a6a8a;font-size:13px;">Expected response: <strong style="color:#e8edf8;">24–48 hours</strong></p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} CortexCart · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#5a6a8a;">Visit Store</a></div>
    </div></body></html>`,
  })
}

// ── Order confirmation ────────────────────
export async function sendOrderConfirmationEmail(to: string, order: { orderNumber:string; name:string; items:{name:string;qty:number;price:number}[]; total:number; estimatedDelivery?:string }) {
  const rows = order.items.map(i => `<div class="row"><span style="color:#e8edf8;">${i.name}</span><span style="color:#8896b3;">×${i.qty}</span><span class="price">$${i.price}</span></div>`).join('')

  // Notify host
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `[CortexCart Order] #${order.orderNumber} — $${order.total}`,
    html: `<div style="font-family:sans-serif;padding:20px;background:#131829;color:#e8edf8;border-radius:12px;max-width:500px;">
      <h2 style="color:#10d988;">🛍️ New Order #${order.orderNumber}</h2>
      <p><strong>Customer:</strong> ${order.name} (${to})</p>
      <p><strong>Total:</strong> $${order.total}</p>
      <p><strong>Items:</strong> ${order.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</p>
    </div>`,
  })

  return resend.emails.send({
    from: FROM, to,
    subject: `✅ Order Confirmed #${order.orderNumber} — CortexCart`,
    html: `<html><head><style>${base}</style></head><body><div class="wrap">
      <div class="head"><h1>Order Confirmed! ✅</h1><p>#${order.orderNumber}</p></div>
      <div class="body">
        <p>Hi <strong>${order.name}</strong>, your order has been confirmed.</p>
        <div class="card">${rows}<hr><div class="row"><strong style="color:#e8edf8;">Total</strong><span class="price">$${order.total}</span></div></div>
        ${order.estimatedDelivery ? `<div class="card"><div class="label">Estimated Delivery</div><p style="color:#e8edf8;margin:6px 0 0;">${order.estimatedDelivery}</p></div>` : ''}
        <div style="text-align:center;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" class="btn">Track Order →</a></div>
      </div>
      <div class="footer">© ${new Date().getFullYear()} CortexCart · All order notifications sent to host</div>
    </div></body></html>`,
  })
}

// ── Welcome email ─────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Welcome to CortexCart, ${name}! 🚀`,
    html: `<html><head><style>${base}</style></head><body><div class="wrap">
      <div class="head"><h1>Welcome, ${name}! 🎉</h1><p>Your AI Shopping Universe is Ready</p></div>
      <div class="body">
        <div class="card">
          <div class="row"><span>🧠 AI Recommendations</span><span class="badge">Active</span></div>
          <div class="row"><span>💰 Dynamic Pricing</span><span class="badge">Live</span></div>
          <div class="row"><span>📦 Order Tracking</span><span class="badge">Ready</span></div>
          <div class="row"><span>❤️ Wishlist</span><span class="badge">Enabled</span></div>
        </div>
        <div style="text-align:center;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Start Shopping →</a></div>
      </div>
      <div class="footer">© ${new Date().getFullYear()} CortexCart</div>
    </div></body></html>`,
  })
}

// ── Price drop alert ──────────────────────
export async function sendPriceDropEmail(to: string, data: { name:string; productName:string; oldPrice:number; newPrice:number; productSlug:string }) {
  const saving = data.oldPrice - data.newPrice
  const pct = Math.round((saving / data.oldPrice) * 100)
  return resend.emails.send({
    from: FROM, to,
    subject: `📉 Price Drop: ${data.productName} is now $${data.newPrice}`,
    html: `<html><head><style>${base}</style></head><body><div class="wrap">
      <div class="head"><h1>Price Drop Alert 📉</h1><p>A wishlisted item got cheaper</p></div>
      <div class="body">
        <div class="card" style="text-align:center;">
          <p style="color:#e8edf8;font-weight:700;font-size:16px;">${data.productName}</p>
          <div style="display:flex;justify-content:center;align-items:center;gap:16px;margin:12px 0;">
            <div><div style="text-decoration:line-through;color:#5a6a8a;">$${data.oldPrice}</div><div style="color:#5a6a8a;font-size:11px;">Was</div></div>
            <div style="font-size:28px;">→</div>
            <div><div class="price" style="font-size:28px;">$${data.newPrice}</div><div style="color:#10d988;font-size:11px;">Now</div></div>
          </div>
          <span class="badge">Save $${saving} (${pct}% off)</span>
        </div>
        <div style="text-align:center;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/products/${data.productSlug}" class="btn">Grab It Now →</a></div>
      </div>
      <div class="footer">© ${new Date().getFullYear()} CortexCart</div>
    </div></body></html>`,
  })
}
