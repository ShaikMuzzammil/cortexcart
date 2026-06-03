import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL || 'CortexCart <onboarding@resend.dev>'
const TO     = process.env.CONTACT_EMAIL_TO || 'admin@cortexcart.com'
const APP    = process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app'

const css = `
body{margin:0;padding:0;background:#080b14;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e8edf8;}
.wrap{max-width:600px;margin:0 auto;background:#0d1221;border:1px solid #1e2640;border-radius:20px;overflow:hidden;}
.header-bar{height:4px;background:linear-gradient(90deg,#10d988 0%,#8b5cf6 50%,#f5b731 100%);}
.head{background:linear-gradient(135deg,#0e1525 0%,#111927 100%);padding:32px;text-align:center;border-bottom:1px solid #1e2640;}
.logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#10d988,#38bdf8);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.logo-text{font-size:22px;font-weight:900;color:#fff;}
.logo-text span{color:#10d988;}
.head h1{color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px;}
.head p{color:#6b7fa3;margin:0;font-size:13px;}
.body{padding:28px 32px;}
.section-title{font-size:11px;font-weight:700;color:#5a6a8a;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;}
.card{background:#111827;border:1px solid #1e2640;border-radius:14px;padding:18px;margin:14px 0;}
.product-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #1e2640;}
.product-row:last-child{border-bottom:none;}
.product-img{width:60px;height:60px;border-radius:10px;object-fit:cover;border:1px solid #1e2640;background:#0e1220;}
.product-name{font-size:14px;font-weight:700;color:#fff;margin:0 0 4px;}
.product-meta{font-size:11px;color:#6b7fa3;}
.price{color:#10d988;font-weight:800;font-family:monospace;font-size:15px;}
.price-old{color:#5a6a8a;text-decoration:line-through;font-size:11px;font-family:monospace;}
.btn{display:inline-block;background:linear-gradient(135deg,#10d988,#0a9e62);color:#080b14;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;margin:6px 4px;}
.btn-outline{display:inline-block;background:transparent;color:#10d988;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;border:1.5px solid #10d988;margin:6px 4px;}
.badge{display:inline-block;background:rgba(16,217,136,0.12);color:#10d988;border:1px solid rgba(16,217,136,0.25);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;}
.badge-gold{background:rgba(245,183,49,0.12);color:#f5b731;border-color:rgba(245,183,49,0.25);}
.badge-violet{background:rgba(139,92,246,0.12);color:#8b5cf6;border-color:rgba(139,92,246,0.25);}
.badge-sky{background:rgba(56,189,248,0.12);color:#38bdf8;border-color:rgba(56,189,248,0.25);}
.badge-rose{background:rgba(244,63,110,0.12);color:#f43f6e;border-color:rgba(244,63,110,0.25);}
.row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1e2640;}
.row:last-child{border-bottom:none;}
.row.total{padding-top:14px;margin-top:6px;border-top:2px solid #1e2640;border-bottom:none;}
.label{color:#6b7fa3;font-size:12px;}
.val{color:#e8edf8;font-size:13px;font-weight:600;}
.val-big{color:#10d988;font-size:17px;font-weight:900;font-family:monospace;}
.timeline{padding:18px 0;}
.tl-step{display:flex;gap:14px;margin-bottom:20px;position:relative;}
.tl-dot{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;margin-top:2px;}
.tl-dot.done{background:#10d988;color:#080b14;}
.tl-dot.pending{background:#1e2640;color:#5a6a8a;border:2px solid #2a3356;}
.tl-content{flex:1;}
.tl-title{font-size:14px;font-weight:700;color:#fff;}
.tl-desc{font-size:12px;color:#6b7fa3;margin-top:2px;}
.tl-time{font-size:11px;color:#3a4a6a;margin-top:4px;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.info-box{background:#0e1220;border:1px solid #1e2640;border-radius:10px;padding:12px;}
.info-box-label{font-size:10px;color:#5a6a8a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
.info-box-val{font-size:13px;font-weight:700;color:#fff;}
.divider{height:1px;background:#1e2640;margin:20px 0;}
.footer{padding:20px 32px;text-align:center;color:#3a4a6a;font-size:11px;border-top:1px solid #1a2338;}
.footer a{color:#4a5a7a;text-decoration:none;}
.footer a:hover{color:#10d988;}
.green{color:#10d988;}
.highlight{background:linear-gradient(135deg,rgba(16,217,136,0.06),rgba(139,92,246,0.04));border:1px solid rgba(16,217,136,0.15);border-radius:12px;padding:16px 20px;margin:14px 0;}
`

function header(title: string, subtitle: string) {
  return `
    <div class="header-bar"></div>
    <div class="head">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">Cortex<span>Cart</span></div>
      </div>
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>`
}

function footer() {
  return `
    <div class="footer">
      <p>© ${new Date().getFullYear()} CortexCart. All rights reserved.</p>
      <p style="margin-top:6px;">
        <a href="${APP}/products">Shop</a> · 
        <a href="${APP}/orders">Orders</a> · 
        <a href="${APP}/contact">Support</a> · 
        <a href="${APP}/unsubscribe">Unsubscribe</a>
      </p>
      <p style="margin-top:8px;color:#2a3356;">This email was sent by CortexCart. Questions? <a href="mailto:${TO}">${TO}</a></p>
    </div>`
}

function wrap(content: string) {
  return `<html><head><style>${css}</style></head><body><div class="wrap">${content}${footer()}</div></body></html>`
}

// ─── CONTACT EMAIL ─────────────────────────────────────────────────────────
export async function sendContactEmail(data: { name:string; email:string; subject:string; message:string; category:string; priority:string }) {
  const priorityColor = data.priority === 'urgent' ? 'badge-rose' : data.priority === 'high' ? 'badge-gold' : 'badge'
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `[CortexCart] [${data.priority.toUpperCase()}] ${data.subject}`,
    html: wrap(`
      ${header('New Contact Message', `${data.category} inquiry`)}
      <div class="body">
        <div class="card">
          <div class="row"><span class="label">From</span><span class="val">${data.name} — <a href="mailto:${data.email}" style="color:#10d988;">${data.email}</a></span></div>
          <div class="row"><span class="label">Subject</span><span class="val">${data.subject}</span></div>
          <div class="row"><span class="label">Category</span><span class="badge">${data.category}</span></div>
          <div class="row"><span class="label">Priority</span><span class="${priorityColor}">${data.priority}</span></div>
        </div>
        <div class="card">
          <div class="section-title">Message</div>
          <p style="color:#c0cfe8;line-height:1.8;margin:0;white-space:pre-wrap;">${data.message}</p>
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn">Reply to ${data.name}</a>
        </div>
      </div>`)
  })

  return resend.emails.send({
    from: FROM, to: data.email,
    subject: `✅ Message received — CortexCart Support`,
    html: wrap(`
      ${header('Message Received ✅', "We'll respond within 24–48 hours")}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Hi <strong style="color:#fff;">${data.name}</strong>, thanks for reaching out! We've received your message and will respond shortly.</p>
        <div class="card">
          <div class="row"><span class="label">Subject</span><span class="val">${data.subject}</span></div>
          <div class="row"><span class="label">Category</span><span class="badge">${data.category}</span></div>
          <div class="row"><span class="label">Priority</span><span class="${priorityColor}">${data.priority}</span></div>
          <div class="row"><span class="label">Expected response</span><span class="val">24–48 business hours</span></div>
        </div>
        <div class="card"><div class="section-title">Your Message</div><p style="color:#6b7fa3;font-style:italic;line-height:1.7;margin:0;">${data.message}</p></div>
        <div class="highlight"><p style="margin:0;font-size:13px;color:#8896b3;">Need urgent help? Visit our <a href="${APP}/faq" style="color:#10d988;">FAQ page</a> or call our support line for immediate assistance.</p></div>
      </div>`)
  })
}

// ─── ORDER CONFIRMATION EMAIL ───────────────────────────────────────────────
export async function sendOrderConfirmationEmail(to: string, data: {
  customerName: string
  orderNumber: string
  orderId: string
  items: { name: string; image: string; quantity: number; price: number; brand?: string }[]
  subtotal: number; tax: number; shipping: number; total: number; discount?: number
  shippingAddress: any
  paymentMethod: string
  estimatedDelivery: string
}) {
  const trackUrl = `${APP}/track?q=${data.orderNumber}`
  const ordersUrl = `${APP}/orders`

  const itemsHtml = data.items.map(item => `
    <div class="product-row">
      <img src="${item.image || `${APP}/placeholder.png`}" alt="${item.name}" class="product-img" />
      <div style="flex:1;">
        <div class="product-name">${item.name}</div>
        <div class="product-meta">${item.brand ? item.brand + ' · ' : ''}Qty: ${item.quantity}</div>
      </div>
      <div style="text-align:right;">
        <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="product-meta">$${item.price.toFixed(2)} each</div>
      </div>
    </div>`).join('')

  const addr = data.shippingAddress
  const paymentBadge = data.paymentMethod === 'cod' ? '<span class="badge-gold">Cash on Delivery</span>' : '<span class="badge">Online Payment</span>'

  await resend.emails.send({
    from: FROM, to,
    subject: `✅ Order Confirmed #${data.orderNumber.slice(-8).toUpperCase()} — CortexCart`,
    html: wrap(`
      ${header('Order Confirmed! 🎉', `Order #${data.orderNumber.slice(-8).toUpperCase()}`)}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Hi <strong style="color:#fff;">${data.customerName}</strong>! Your order has been placed successfully. ${data.paymentMethod === 'cod' ? 'You\'ll pay on delivery.' : 'Your payment has been confirmed.'}</p>

        <div class="info-grid">
          <div class="info-box"><div class="info-box-label">Order Number</div><div class="info-box-val" style="color:#10d988;font-family:monospace;">#${data.orderNumber.slice(-8).toUpperCase()}</div></div>
          <div class="info-box"><div class="info-box-label">Payment</div><div style="margin-top:4px;">${paymentBadge}</div></div>
          <div class="info-box"><div class="info-box-label">Est. Delivery</div><div class="info-box-val">${data.estimatedDelivery}</div></div>
          <div class="info-box"><div class="info-box-label">Order Total</div><div class="info-box-val" style="color:#10d988;font-family:monospace;">$${data.total.toFixed(2)}</div></div>
        </div>

        <div style="margin:20px 0;">
          <div class="section-title">Items Ordered (${data.items.length})</div>
          <div class="card" style="padding:0 18px;">${itemsHtml}</div>
        </div>

        <div class="card">
          <div class="section-title">Order Summary</div>
          <div class="row"><span class="label">Subtotal</span><span class="val">$${data.subtotal.toFixed(2)}</span></div>
          ${data.discount ? `<div class="row"><span class="label" style="color:#10d988;">Discount</span><span class="val" style="color:#10d988;">−$${data.discount.toFixed(2)}</span></div>` : ''}
          <div class="row"><span class="label">Shipping</span><span class="val">${data.shipping === 0 ? '<span style="color:#10d988;">FREE</span>' : '$'+data.shipping.toFixed(2)}</span></div>
          <div class="row"><span class="label">Tax</span><span class="val">$${data.tax.toFixed(2)}</span></div>
          <div class="row total"><span style="font-size:15px;font-weight:800;color:#fff;">Total</span><span class="val-big">$${data.total.toFixed(2)}</span></div>
        </div>

        <div class="card">
          <div class="section-title">Shipping To</div>
          <p style="color:#c0cfe8;margin:0;font-size:13px;line-height:1.8;">
            <strong style="color:#fff;">${addr.firstName} ${addr.lastName}</strong><br/>
            ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br/>
            ${addr.city}, ${addr.state} ${addr.zip}<br/>
            ${addr.country}
          </p>
        </div>

        <div class="timeline">
          <div class="section-title">Order Timeline</div>
          <div class="tl-step">
            <div class="tl-dot done">✓</div>
            <div class="tl-content"><div class="tl-title">Order Placed</div><div class="tl-desc">Your order has been received</div><div class="tl-time">${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div></div>
          </div>
          <div class="tl-step">
            <div class="tl-dot ${data.paymentMethod !== 'cod' ? 'done' : 'pending'}">${data.paymentMethod !== 'cod' ? '✓' : '2'}</div>
            <div class="tl-content"><div class="tl-title">Payment ${data.paymentMethod === 'cod' ? 'Pending (COD)' : 'Confirmed'}</div><div class="tl-desc">${data.paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment processed'}</div></div>
          </div>
          <div class="tl-step">
            <div class="tl-dot pending">3</div>
            <div class="tl-content"><div class="tl-title">Processing</div><div class="tl-desc">Preparing your items for shipment</div></div>
          </div>
          <div class="tl-step">
            <div class="tl-dot pending">4</div>
            <div class="tl-content"><div class="tl-title">Shipped</div><div class="tl-desc">On its way to you with tracking updates</div></div>
          </div>
          <div class="tl-step">
            <div class="tl-dot pending">5</div>
            <div class="tl-content"><div class="tl-title">Delivered</div><div class="tl-desc">Estimated: ${data.estimatedDelivery}</div></div>
          </div>
        </div>

        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${trackUrl}" class="btn">📦 Track Your Order</a>
          <a href="${ordersUrl}" class="btn-outline">View All Orders</a>
        </div>

        <div class="highlight">
          <p style="margin:0;font-size:12px;color:#8896b3;">
            🔔 You'll receive email updates when your order ships and when it's out for delivery. Questions? Reply to this email or visit our <a href="${APP}/contact" style="color:#10d988;">support center</a>.
          </p>
        </div>
      </div>`)
  })
}

// ─── WELCOME EMAIL ──────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM, to,
    subject: `Welcome to CortexCart, ${name}! 🎉`,
    html: wrap(`
      ${header(`Welcome, ${name}! 🎉`, 'Your AI-powered shopping journey begins')}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">You've joined <strong style="color:#10d988;">50,000+</strong> smart shoppers who use CortexCart's AI to find the best products at the best prices.</p>
        <div class="highlight">
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#f5b731;">🎁 WELCOME GIFT</p>
          <p style="margin:0 0 8px;font-size:14px;color:#fff;">Use code <strong style="color:#f5b731;font-size:16px;letter-spacing:2px;">FIRST15</strong> for 15% off your first order!</p>
          <p style="margin:0;font-size:11px;color:#6b7fa3;">Valid for 30 days · One use per account · Minimum order $20</p>
        </div>
        <div class="card">
          <div class="section-title">What makes CortexCart special</div>
          ${[['🧠 AI Recommendations','Products chosen specifically for your taste and preferences'],['💰 Smart Pricing','Real-time price optimization so you always get the best deal'],['⚡ Instant Search','Describe what you need in natural language — AI finds it'],['🔒 Secure & Private','Military-grade encryption, zero data sold to third parties']].map(([t,d]) => `<div class="row"><div><div class="val">${t}</div><div style="font-size:11px;color:#6b7fa3;margin-top:2px;">${d}</div></div></div>`).join('')}
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${APP}/products" class="btn">Start Shopping →</a>
        </div>
      </div>`)
  })
}

// ─── SHIPPING UPDATE EMAIL ──────────────────────────────────────────────────
export async function sendShippingEmail(to: string, data: { customerName:string; orderNumber:string; trackingNumber:string; carrier:string; estimatedDelivery:string; items:any[] }) {
  await resend.emails.send({
    from: FROM, to,
    subject: `🚚 Your order #${data.orderNumber.slice(-8).toUpperCase()} has shipped!`,
    html: wrap(`
      ${header('Your Order Has Shipped! 🚚', `Order #${data.orderNumber.slice(-8).toUpperCase()}`)}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Great news, <strong style="color:#fff;">${data.customerName}</strong>! Your order is on its way.</p>
        <div class="info-grid">
          <div class="info-box"><div class="info-box-label">Tracking Number</div><div class="info-box-val" style="color:#10d988;font-family:monospace;">${data.trackingNumber}</div></div>
          <div class="info-box"><div class="info-box-label">Carrier</div><div class="info-box-val">${data.carrier}</div></div>
          <div class="info-box" style="grid-column:1/-1;"><div class="info-box-label">Estimated Delivery</div><div class="info-box-val">${data.estimatedDelivery}</div></div>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${APP}/track?q=${data.orderNumber}" class="btn">📦 Track Live</a>
          <a href="${APP}/orders" class="btn-outline">View Order</a>
        </div>
        <div class="highlight"><p style="margin:0;font-size:12px;color:#8896b3;">You'll get another notification when your order is out for delivery. Keep an eye on your phone!</p></div>
      </div>`)
  })
}

// ─── OUT FOR DELIVERY ───────────────────────────────────────────────────────
export async function sendOutForDeliveryEmail(to: string, data: { customerName:string; orderNumber:string; estimatedWindow:string }) {
  await resend.emails.send({
    from: FROM, to,
    subject: `📦 Out for Delivery Today — Order #${data.orderNumber.slice(-8).toUpperCase()}`,
    html: wrap(`
      ${header('Out for Delivery! 📦', 'Your order arrives today')}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Hi <strong style="color:#fff;">${data.customerName}</strong>! Your order is with your local delivery driver and will arrive today.</p>
        <div class="highlight">
          <p style="margin:0;font-size:14px;font-weight:800;color:#fff;">🕐 Estimated Delivery Window</p>
          <p style="margin:8px 0 0;font-size:16px;color:#10d988;font-weight:900;">${data.estimatedWindow}</p>
        </div>
        <div class="card">
          <p style="margin:0;font-size:13px;color:#c0cfe8;line-height:1.8;">Please ensure someone is available to receive the package. If you're not available, the driver may leave a delivery notice.</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${APP}/track?q=${data.orderNumber}" class="btn">Track Live Location</a>
        </div>
      </div>`)
  })
}

// ─── DELIVERY CONFIRMATION ──────────────────────────────────────────────────
export async function sendDeliveredEmail(to: string, data: { customerName:string; orderNumber:string; items:any[]; total:number }) {
  await resend.emails.send({
    from: FROM, to,
    subject: `✅ Delivered! Order #${data.orderNumber.slice(-8).toUpperCase()} — How was it?`,
    html: wrap(`
      ${header('Your Order is Delivered! ✅', 'We hope you love it!')}
      <div class="body">
        <p style="color:#c0cfe8;font-size:14px;line-height:1.7;">Hi <strong style="color:#fff;">${data.customerName}</strong>! Your order has been delivered. We hope you enjoy your purchase!</p>
        <div class="highlight">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f5b731;">⭐ Leave a Review</p>
          <p style="margin:0;font-size:12px;color:#8896b3;">Your feedback helps other shoppers and helps us improve. It takes less than a minute!</p>
        </div>
        <div class="card" style="padding:0 18px;">
          ${data.items.map(item => `
            <div class="product-row">
              <img src="${item.image || APP+'/placeholder.png'}" alt="${item.name}" class="product-img" />
              <div style="flex:1;"><div class="product-name">${item.name}</div><div class="product-meta">Qty: ${item.quantity}</div></div>
              <a href="${APP}/products/${item.slug}#reviews" class="btn-outline" style="padding:8px 14px;font-size:11px;">Review</a>
            </div>`).join('')}
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${APP}/orders" class="btn">View Order History</a>
        </div>
        <div class="card">
          <p style="margin:0;font-size:13px;color:#c0cfe8;">Need help? Our 30-day return policy covers you. <a href="${APP}/returns" style="color:#10d988;">Start a return →</a></p>
        </div>
      </div>`)
  })
}

// ─── ADMIN NEW ORDER ALERT ──────────────────────────────────────────────────
export async function sendAdminNewOrderAlert(data: { orderNumber:string; customerName:string; customerEmail:string; total:number; itemCount:number; paymentMethod:string; items:any[] }) {
  await resend.emails.send({
    from: FROM, to: TO,
    subject: `🛒 New Order #${data.orderNumber.slice(-8).toUpperCase()} — $${data.total.toFixed(2)} (${data.paymentMethod})`,
    html: wrap(`
      ${header(`New Order Alert 🛒`, `$${data.total.toFixed(2)} · ${data.itemCount} items`)}
      <div class="body">
        <div class="info-grid">
          <div class="info-box"><div class="info-box-label">Order #</div><div class="info-box-val" style="color:#10d988;font-family:monospace;">${data.orderNumber.slice(-8).toUpperCase()}</div></div>
          <div class="info-box"><div class="info-box-label">Total</div><div class="info-box-val" style="color:#10d988;">$${data.total.toFixed(2)}</div></div>
          <div class="info-box"><div class="info-box-label">Customer</div><div class="info-box-val">${data.customerName}</div></div>
          <div class="info-box"><div class="info-box-label">Payment</div><div style="margin-top:4px;">${data.paymentMethod === 'cod' ? '<span class="badge-gold">COD</span>' : '<span class="badge">Online</span>'}</div></div>
        </div>
        <div class="card" style="padding:0 18px;">
          ${data.items.map(item => `<div class="product-row"><img src="${item.image||''}" alt="${item.name}" class="product-img"/><div style="flex:1;"><div class="product-name">${item.name}</div><div class="product-meta">Qty: ${item.quantity} · $${item.price}</div></div><div class="price">$${(item.price*item.quantity).toFixed(2)}</div></div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="${APP}/admin" class="btn">Open Admin Dashboard</a>
        </div>
      </div>`)
  })
}

// ─── PRICE DROP EMAIL ───────────────────────────────────────────────────────
export async function sendPriceDropEmail(to: string, data: { customerName:string; productName:string; productSlug:string; oldPrice:number; newPrice:number; image:string }) {
  const saving = data.oldPrice - data.newPrice
  const pct = Math.round((saving / data.oldPrice) * 100)
  await resend.emails.send({
    from: FROM, to,
    subject: `📉 Price Drop! ${data.productName} is now $${data.newPrice.toFixed(2)}`,
    html: wrap(`
      ${header('Price Drop Alert! 📉', `Save ${pct}% on your wishlist item`)}
      <div class="body">
        <div class="product-row card">
          <img src="${data.image}" alt="${data.productName}" class="product-img" style="width:80px;height:80px;" />
          <div style="flex:1;">
            <div class="product-name">${data.productName}</div>
            <div style="margin-top:8px;">
              <span class="price">$${data.newPrice.toFixed(2)}</span>
              <span class="price-old" style="margin-left:8px;">was $${data.oldPrice.toFixed(2)}</span>
              <span class="badge-rose" style="margin-left:8px;">−${pct}%</span>
            </div>
            <div style="font-size:12px;color:#10d988;margin-top:4px;">You save $${saving.toFixed(2)}</div>
          </div>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${APP}/products/${data.productSlug}" class="btn">🛒 Buy Now at $${data.newPrice.toFixed(2)}</a>
        </div>
        <div class="highlight"><p style="margin:0;font-size:12px;color:#8896b3;">⚡ This deal may not last. Stock is limited — order now to lock in this price!</p></div>
      </div>`)
  })
}
