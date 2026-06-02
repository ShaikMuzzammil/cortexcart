import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
const TO     = process.env.CONTACT_EMAIL_TO!

// ── Shared styles ──────────────────────────────────────────────────────────
const css = `
body{margin:0;padding:0;background:#050810;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8edf8;}
.outer{background:#050810;padding:32px 16px;}
.wrap{max-width:620px;margin:0 auto;background:#0d1120;border:1px solid #1e2640;border-radius:24px;overflow:hidden;}
.head{background:linear-gradient(135deg,#0b1528 0%,#0f1e3a 50%,#0b1528 100%);padding:40px 36px;text-align:center;border-bottom:1px solid #1e2640;position:relative;overflow:hidden;}
.head-accent{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:300px;height:150px;background:radial-gradient(ellipse,rgba(16,217,136,0.12) 0%,transparent 70%);pointer-events:none;}
.logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#10d988,#38bdf8);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;}
.logo-text{font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px;}
.logo-em{color:#10d988;}
.head h1{color:#fff;font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;}
.head-sub{color:#8896b3;font-size:13px;margin:0;}
.body{padding:32px 36px;}
.section-title{font-size:11px;font-weight:700;color:#5a6a8a;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;}
.card{background:#070d1a;border:1px solid #1e2640;border-radius:16px;padding:20px;margin:16px 0;}
.card-green{background:rgba(16,217,136,0.04);border-color:rgba(16,217,136,0.2);}
.card-gold{background:rgba(245,183,49,0.04);border-color:rgba(245,183,49,0.2);}
.card-violet{background:rgba(139,92,246,0.04);border-color:rgba(139,92,246,0.2);}
.row{display:flex;align-items:flex-start;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(30,38,64,0.8);}
.row:last-child{border-bottom:none;}
.label{color:#5a6a8a;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
.value{color:#e8edf8;font-size:13px;font-weight:600;}
.price{color:#10d988;font-weight:800;font-size:18px;font-family:monospace;}
.price-sm{color:#10d988;font-weight:700;font-size:14px;font-family:monospace;}
.badge{display:inline-block;background:rgba(16,217,136,0.1);color:#10d988;border:1px solid rgba(16,217,136,0.3);border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;}
.badge-gold{background:rgba(245,183,49,0.1);color:#f5b731;border-color:rgba(245,183,49,0.3);}
.badge-rose{background:rgba(244,63,110,0.1);color:#f43f6e;border-color:rgba(244,63,110,0.3);}
.badge-sky{background:rgba(56,189,248,0.1);color:#38bdf8;border-color:rgba(56,189,248,0.3);}
.btn{display:inline-block;background:linear-gradient(135deg,#10d988,#0fbf74);color:#050810 !important;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:-0.2px;box-shadow:0 4px 20px rgba(16,217,136,0.3);}
.btn-gold{background:linear-gradient(135deg,#f5b731,#e69c1a);color:#050810 !important;}
.product-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid rgba(30,38,64,0.6);}
.product-row:last-child{border-bottom:none;}
.product-img{width:60px;height:60px;border-radius:10px;object-fit:cover;background:#131829;border:1px solid #1e2640;flex-shrink:0;}
.product-img-placeholder{width:60px;height:60px;border-radius:10px;background:linear-gradient(135deg,#131829,#1e2640);border:1px solid #1e2640;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;}
.product-name{color:#e8edf8;font-size:13px;font-weight:600;margin:0 0 3px;}
.product-brand{color:#5a6a8a;font-size:11px;margin:0;}
.step-row{display:flex;align-items:center;gap:12px;padding:10px 0;}
.step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.step-done{background:rgba(16,217,136,0.15);border:1.5px solid #10d988;color:#10d988;}
.step-active{background:rgba(245,183,49,0.15);border:1.5px solid #f5b731;color:#f5b731;}
.step-next{background:rgba(30,38,64,0.6);border:1.5px solid #1e2640;color:#5a6a8a;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(30,38,64,0.9),rgba(16,217,136,0.15),rgba(30,38,64,0.9),transparent);margin:20px 0;}
.footer{padding:20px 36px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1e2640;background:#070d1a;}
.footer a{color:#10d988;text-decoration:none;}
.totals-row{display:flex;justify-content:space-between;padding:7px 0;font-size:13px;}
.totals-label{color:#5a6a8a;}
.totals-value{color:#e8edf8;font-weight:600;}
.total-final{display:flex;justify-content:space-between;padding:12px 0;font-size:15px;border-top:1.5px solid #1e2640;margin-top:8px;}
.total-label{color:#e8edf8;font-weight:700;}
`

// ── Logo HTML ──────────────────────────────────────────────────────────────
const LOGO = `
<div class="logo">
  <div class="logo-icon">⚡</div>
  <span class="logo-text">Cortex<span class="logo-em">Cart</span></span>
</div>`

// ── Header builder ─────────────────────────────────────────────────────────
const head = (title: string, subtitle: string, icon = '✅') => `
<div class="head">
  <div class="head-accent"></div>
  ${LOGO}
  <h1>${icon} ${title}</h1>
  <p class="head-sub">${subtitle}</p>
</div>`

// ── Footer ─────────────────────────────────────────────────────────────────
const footer = (year = new Date().getFullYear()) => `
<div class="footer">
  © ${year} CortexCart Inc. · <a href="${process.env.NEXT_PUBLIC_APP_URL}">cortexcart.com</a> · 
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy</a>
</div>`

// ── Product rows (with image) ──────────────────────────────────────────────
function productRows(items: { name:string; qty:number; price:number; image?:string; brand?:string }[]) {
  return items.map(i => `
    <div class="product-row">
      ${i.image
        ? `<img src="${i.image}" alt="${i.name}" class="product-img" />`
        : `<div class="product-img-placeholder">📦</div>`}
      <div style="flex:1;">
        <p class="product-name">${i.name}</p>
        ${i.brand ? `<p class="product-brand">${i.brand}</p>` : ''}
        <p style="color:#5a6a8a;font-size:11px;margin:3px 0 0;">Qty: ${i.qty}</p>
      </div>
      <span class="price-sm">$${(i.price * i.qty).toFixed(2)}</span>
    </div>`
  ).join('')
}

// ── Delivery status stepper ────────────────────────────────────────────────
function statusStepper(currentStatus: string) {
  const steps = [
    { key:'PAYMENT_CONFIRMED', label:'Order Confirmed',  icon:'✅' },
    { key:'PROCESSING',        label:'Processing',       icon:'⚙️' },
    { key:'SHIPPED',           label:'Shipped',          icon:'📦' },
    { key:'OUT_FOR_DELIVERY',  label:'Out for Delivery', icon:'🚚' },
    { key:'DELIVERED',         label:'Delivered',        icon:'🏠' },
  ]
  const idx = steps.findIndex(s => s.key === currentStatus)
  return steps.map((s, i) => {
    const cls = i < idx ? 'step-done' : i === idx ? 'step-active' : 'step-next'
    return `<div class="step-row">
      <div class="step-dot ${cls}">${s.icon}</div>
      <span style="color:${i<=idx?'#e8edf8':'#3a4a6a'};font-size:13px;font-weight:${i===idx?700:400};">${s.label}</span>
      ${i===idx?'<span class="badge" style="margin-left:auto;font-size:10px;">Current</span>':''}
    </div>`
  }).join('')
}

// ══════════════════════════════════════════════════════════════════════════
// CONTACT EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendContactEmail(data: {
  name:string; email:string; subject:string; message:string; category:string; priority:string
}) {
  // Admin notification
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `[CortexCart] [${data.priority.toUpperCase()}] New Message — ${data.subject}`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('New Contact Message', `${data.category} · Priority: ${data.priority}`, '📬')}
      <div class="body">
        <div class="card">
          <div class="row"><div><div class="label">From</div><div class="value">${data.name}</div></div><a href="mailto:${data.email}" style="color:#10d988;font-size:13px;">${data.email}</a></div>
          <div class="row"><div class="label">Category</div><span class="badge">${data.category}</span></div>
          <div class="row"><div class="label">Priority</div><span class="badge badge-gold">${data.priority.toUpperCase()}</span></div>
        </div>
        <div class="card"><div class="label">Message</div><p style="color:#e8edf8;line-height:1.75;margin:10px 0 0;white-space:pre-wrap;font-size:13px;">${data.message}</p></div>
        <div style="text-align:center;margin:24px 0;"><a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn">Reply to ${data.name} →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })

  // Sender confirmation
  return resend.emails.send({
    from: FROM, to: data.email,
    subject: `✅ Message received — CortexCart Support`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('Message Received!', "We'll get back to you within 24–48 hours", '✅')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 16px;">Hi <strong>${data.name}</strong>, your message has been received and our team has been notified.</p>
        <div class="card card-green">
          <div class="row"><div class="label">Subject</div><div class="value">${data.subject}</div></div>
          <div class="row"><div class="label">Category</div><span class="badge">${data.category}</span></div>
          <div class="row"><div class="label">Priority</div><span class="badge badge-gold">${data.priority}</span></div>
        </div>
        <div class="card"><div class="label">Your Message</div><p style="color:#8896b3;font-style:italic;margin:10px 0 0;white-space:pre-wrap;font-size:13px;line-height:1.7;">${data.message}</p></div>
        <div class="card card-violet" style="text-align:center;">
          <p style="color:#e8edf8;font-size:13px;margin:0;">Expected response: <strong style="color:#8b5cf6;">24–48 hours</strong></p>
        </div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// ORDER CONFIRMATION EMAIL (customer + admin)
// ══════════════════════════════════════════════════════════════════════════
export async function sendOrderConfirmationEmail(to: string, order: {
  orderNumber: string; name: string
  items: { name:string; qty:number; price:number; image?:string; brand?:string }[]
  total: number; estimatedDelivery?: string; shippingAddress?: any
  subtotal?: number; tax?: number; shipping?: number; paymentMethod?: string
}) {
  const addrBlock = order.shippingAddress ? `
    <div class="card"><div class="label" style="margin-bottom:10px;">Delivery Address</div>
      <p class="value" style="margin:0;">${order.shippingAddress.firstName||''} ${order.shippingAddress.lastName||''}</p>
      <p style="color:#8896b3;margin:4px 0 0;font-size:12px;">${order.shippingAddress.line1||''}${order.shippingAddress.line2?', '+order.shippingAddress.line2:''}</p>
      <p style="color:#8896b3;margin:2px 0 0;font-size:12px;">${order.shippingAddress.city||''}${order.shippingAddress.state?', '+order.shippingAddress.state:''} ${order.shippingAddress.zip||''}</p>
      <p style="color:#8896b3;margin:2px 0 0;font-size:12px;">${order.shippingAddress.country||''}</p>
    </div>` : ''

  const isCOD = order.paymentMethod === 'cod'

  // Admin full-detail email
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `🛒 New Order #${order.orderNumber} — $${order.total.toFixed(2)} ${isCOD?'[COD]':'[PAID]'}`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head(`Order #${order.orderNumber}`, `New order received — ${isCOD?'Cash on Delivery':'Payment confirmed'}`, '🛒')}
      <div class="body">
        <div class="card">
          <div class="row"><div><div class="label">Customer</div><div class="value">${order.name}</div></div><a href="mailto:${to}" style="color:#10d988;font-size:12px;">${to}</a></div>
          <div class="row"><div class="label">Order Total</div><span class="price">$${order.total.toFixed(2)}</span></div>
          <div class="row"><div class="label">Payment</div><span class="${isCOD?'badge-gold':'badge'} badge">${isCOD?'💵 Pay on Delivery':'✅ Paid Online'}</span></div>
          <div class="row"><div class="label">Est. Delivery</div><div class="value">${order.estimatedDelivery||'5–7 business days'}</div></div>
        </div>
        <div class="card"><div class="label" style="margin-bottom:10px;">Items Ordered (${order.items.length})</div>
          ${productRows(order.items)}
          <div class="divider"></div>
          ${order.subtotal!==undefined?`
          <div class="totals-row"><span class="totals-label">Subtotal</span><span class="totals-value">$${order.subtotal?.toFixed(2)}</span></div>
          <div class="totals-row"><span class="totals-label">Shipping</span><span class="totals-value">${order.shipping===0?'FREE':'$'+order.shipping?.toFixed(2)}</span></div>
          <div class="totals-row"><span class="totals-label">Tax</span><span class="totals-value">$${order.tax?.toFixed(2)}</span></div>`:''}
          <div class="total-final"><span class="total-label">Total</span><span class="price">$${order.total.toFixed(2)}</span></div>
        </div>
        ${addrBlock}
        <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" class="btn">View in Admin Panel →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })

  // Customer confirmation email
  return resend.emails.send({
    from: FROM, to,
    subject: `${isCOD?'📦':'✅'} Order Confirmed #${order.orderNumber} — CortexCart`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head(`Order Confirmed! ${isCOD?'📦':'✅'}`, `Order #${order.orderNumber}`, isCOD?'📦':'✅')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 20px;">Hi <strong>${order.name}</strong>, ${isCOD?'your order has been placed and will be collected on delivery!':'your order is confirmed and being prepared for shipment!'}</p>

        ${isCOD?`<div class="card card-gold">
          <p style="color:#f5b731;font-weight:700;font-size:14px;margin:0 0 6px;">💵 Payment: Cash on Delivery</p>
          <p style="color:#8896b3;font-size:12px;margin:0;">Please keep the exact amount ready when your order arrives. You can also pay by card.</p>
        </div>`:''}

        <div class="card card-green">
          <div class="label" style="margin-bottom:10px;">Delivery Progress</div>
          ${statusStepper('PAYMENT_CONFIRMED')}
        </div>

        <div class="card"><div class="label" style="margin-bottom:12px;">Your Order (${order.items.length} items)</div>
          ${productRows(order.items)}
          <div class="divider"></div>
          ${order.subtotal!==undefined?`
          <div class="totals-row"><span class="totals-label">Subtotal</span><span class="totals-value">$${order.subtotal?.toFixed(2)}</span></div>
          <div class="totals-row"><span class="totals-label">Shipping</span><span class="totals-value">${order.shipping===0?'FREE':'$'+order.shipping?.toFixed(2)}</span></div>
          <div class="totals-row"><span class="totals-label">Tax</span><span class="totals-value">$${order.tax?.toFixed(2)}</span></div>`:''}
          <div class="total-final"><span class="total-label">Total</span><span class="price">$${order.total.toFixed(2)}</span></div>
        </div>

        ${addrBlock}
        ${order.estimatedDelivery?`<div class="card"><div class="label">Estimated Delivery</div><p style="color:#10d988;font-weight:700;margin:8px 0 0;font-size:15px;">📅 ${order.estimatedDelivery}</p></div>`:''}

        <div style="text-align:center;margin:28px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders?q=${order.orderNumber}" class="btn">Track Your Order →</a>
        </div>
        <p style="text-align:center;color:#3a4a6a;font-size:11px;margin:0;">Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color:#10d988;">Contact Support</a></p>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// SHIPPING UPDATE EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendShippingEmail(to: string, data: {
  name:string; orderNumber:string; trackingNumber?:string; carrier?:string; estimatedDelivery:string
  items?: { name:string; qty:number; price:number; image?:string }[]
}) {
  return resend.emails.send({
    from: FROM, to,
    subject: `🚚 Your order #${data.orderNumber} has shipped — Track it now`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('Your Order Has Shipped! 🚚', `Estimated delivery: ${data.estimatedDelivery}`, '🚚')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 20px;">Hi <strong>${data.name}</strong>, great news! Your order is on its way.</p>
        <div class="card card-green">
          <div class="label" style="margin-bottom:10px;">Delivery Progress</div>
          ${statusStepper('SHIPPED')}
        </div>
        <div class="card">
          <div class="row"><div class="label">Order Number</div><span style="font-family:monospace;color:#e8edf8;font-size:13px;">#${data.orderNumber}</span></div>
          ${data.carrier?`<div class="row"><div class="label">Carrier</div><div class="value">${data.carrier}</div></div>`:''}
          ${data.trackingNumber?`<div class="row"><div class="label">Tracking Number</div><span style="color:#10d988;font-family:monospace;font-size:13px;font-weight:700;">${data.trackingNumber}</span></div>`:''}
          <div class="row"><div class="label">Estimated Delivery</div><div class="value" style="color:#10d988;">📅 ${data.estimatedDelivery}</div></div>
        </div>
        ${data.items && data.items.length ? `<div class="card"><div class="label" style="margin-bottom:10px;">Items Shipped</div>${productRows(data.items)}</div>` : ''}
        <div style="text-align:center;margin:28px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders?q=${data.orderNumber}" class="btn">Track Live Status →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// OUT FOR DELIVERY EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendOutForDeliveryEmail(to: string, data: {
  name:string; orderNumber:string; estimatedTime?:string
  items?: { name:string; qty:number; price:number; image?:string }[]
}) {
  return resend.emails.send({
    from: FROM, to,
    subject: `🚚 Out for Delivery — Order #${data.orderNumber} arriving today!`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('Out for Delivery! 🚚', 'Your order is arriving today', '🚚')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 20px;">Hi <strong>${data.name}</strong>, your order is out for delivery and will arrive soon!</p>
        <div class="card card-gold">
          <p style="color:#f5b731;font-weight:700;font-size:15px;margin:0 0 6px;">📍 Your package is nearby</p>
          ${data.estimatedTime?`<p style="color:#8896b3;font-size:12px;margin:0;">Expected arrival: <strong style="color:#f5b731;">${data.estimatedTime}</strong></p>`:''}
        </div>
        <div class="card card-green">
          <div class="label" style="margin-bottom:10px;">Delivery Progress</div>
          ${statusStepper('OUT_FOR_DELIVERY')}
        </div>
        ${data.items && data.items.length ? `<div class="card"><div class="label" style="margin-bottom:10px;">Your Items</div>${productRows(data.items)}</div>` : ''}
        <div style="text-align:center;margin:28px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders?q=${data.orderNumber}" class="btn">Track Order →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// DELIVERY CONFIRMED EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendDeliveredEmail(to: string, data: {
  name:string; orderNumber:string; deliveredAt?:string
  items?: { name:string; qty:number; price:number; image?:string }[]
  total?: number
}) {
  return resend.emails.send({
    from: FROM, to,
    subject: `✅ Delivered! Order #${data.orderNumber} — CortexCart`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('Order Delivered! ✅', 'Your order has been successfully delivered', '✅')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 20px;">Hi <strong>${data.name}</strong>, your order has been delivered! We hope you love your purchase.</p>
        <div class="card card-green">
          <div class="label" style="margin-bottom:10px;">Delivery Status</div>
          ${statusStepper('DELIVERED')}
        </div>
        <div class="card">
          <div class="row"><div class="label">Order Number</div><span style="font-family:monospace;color:#e8edf8;">#${data.orderNumber}</span></div>
          ${data.deliveredAt?`<div class="row"><div class="label">Delivered At</div><div class="value" style="color:#10d988;">${data.deliveredAt}</div></div>`:''}
          ${data.total?`<div class="row"><div class="label">Order Total</div><span class="price">$${data.total.toFixed(2)}</span></div>`:''}
        </div>
        ${data.items && data.items.length ? `<div class="card"><div class="label" style="margin-bottom:10px;">Delivered Items</div>${productRows(data.items)}</div>` : ''}
        <div class="card card-violet" style="text-align:center;">
          <p style="color:#8b5cf6;font-weight:700;font-size:14px;margin:0 0 8px;">Enjoying your order?</p>
          <p style="color:#8896b3;font-size:12px;margin:0 0 16px;">Leave a review and help others make great choices.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders?q=${data.orderNumber}" class="btn" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);">Write a Review →</a>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn btn-gold">Shop Again →</a>
        </div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// WELCOME EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `🚀 Welcome to CortexCart, ${name}! Your AI shopping experience awaits`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head(`Welcome, ${name}! 🎉`, 'Your AI Shopping Universe is Ready', '🎉')}
      <div class="body">
        <p style="font-size:14px;margin:0 0 20px;">Your account is ready. Here's what's available for you:</p>
        <div class="card card-green">
          <div class="row"><span style="font-size:13px;">🧠 AI Recommendations</span><span class="badge">Active</span></div>
          <div class="row"><span style="font-size:13px;">💰 Smart Pricing</span><span class="badge">Live</span></div>
          <div class="row"><span style="font-size:13px;">📦 Real-time Order Tracking</span><span class="badge">Ready</span></div>
          <div class="row"><span style="font-size:13px;">❤️ Wishlist & Alerts</span><span class="badge">Enabled</span></div>
          <div class="row"><span style="font-size:13px;">🚚 Pay on Delivery option</span><span class="badge badge-gold">Available</span></div>
        </div>
        <div style="text-align:center;margin:28px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Start Shopping →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// PRICE DROP EMAIL
// ══════════════════════════════════════════════════════════════════════════
export async function sendPriceDropEmail(to: string, data: {
  name:string; productName:string; oldPrice:number; newPrice:number; productSlug:string; productImage?:string
}) {
  const saving = data.oldPrice - data.newPrice
  const pct    = Math.round((saving / data.oldPrice) * 100)
  return resend.emails.send({
    from: FROM, to,
    subject: `📉 Price Drop! ${data.productName} is now $${data.newPrice.toFixed(2)} (save ${pct}%)`,
    html: `<html><head><style>${css}</style></head><body><div class="outer"><div class="wrap">
      ${head('Price Drop Alert! 📉', 'A wishlisted item just got cheaper', '📉')}
      <div class="body">
        <div class="card" style="text-align:center;">
          ${data.productImage?`<img src="${data.productImage}" alt="${data.productName}" style="width:120px;height:120px;border-radius:14px;object-fit:cover;margin:0 auto 16px;display:block;"/>`:''}
          <p style="color:#e8edf8;font-weight:700;font-size:16px;margin:0 0 16px;">${data.productName}</p>
          <div style="display:inline-flex;align-items:center;gap:24px;background:rgba(30,38,64,0.6);border-radius:16px;padding:16px 24px;">
            <div><div style="text-decoration:line-through;color:#5a6a8a;font-size:18px;">$${data.oldPrice.toFixed(2)}</div><div style="color:#5a6a8a;font-size:10px;text-transform:uppercase;letter-spacing:.5px;">Was</div></div>
            <div style="font-size:20px;color:#5a6a8a;">→</div>
            <div><div class="price" style="font-size:30px;">$${data.newPrice.toFixed(2)}</div><div style="color:#10d988;font-size:10px;text-transform:uppercase;letter-spacing:.5px;">Now</div></div>
          </div>
          <div style="margin-top:16px;"><span class="badge">Save $${saving.toFixed(2)} (${pct}% off)</span></div>
        </div>
        <div style="text-align:center;margin:28px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/products/${data.productSlug}" class="btn">Grab It Now →</a></div>
      </div>
      ${footer()}
    </div></div></body></html>`,
  })
}
