'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatPrice }  from '@/lib/utils'
import { ShoppingBag, CreditCard, Truck, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Shield, Lock, Zap, BadgeCheck, Banknote, Smartphone, Building2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link  from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STEPS = [
  { id:1, label:'Contact',  icon:ShoppingBag },
  { id:2, label:'Shipping', icon:Truck },
  { id:3, label:'Payment',  icon:CreditCard },
  { id:4, label:'Confirm',  icon:CheckCircle2 },
]

const PAYMENT_METHODS = [
  { id:'card',   label:'Credit / Debit Card',     icon:CreditCard, desc:'Visa, Mastercard, Amex — paid securely now', badge:'Recommended', badgeColor:'badge-em' },
  { id:'upi',    label:'UPI / Online Transfer',   icon:Smartphone, desc:'Pay instantly via UPI, Net Banking, or Wallet', badge:'Instant', badgeColor:'badge-sky' },
  { id:'cod',    label:'Pay on Delivery (COD)',   icon:Banknote,   desc:'Pay cash or card when your order arrives', badge:'No card needed', badgeColor:'badge-gold' },
]

const CARD_BRANDS = [
  { name:'Visa',       src:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png' },
  { name:'Mastercard', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png' },
  { name:'Amex',       src:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png' },
]

interface Addr { firstName:string; lastName:string; email:string; phone:string; line1:string; line2:string; city:string; state:string; zip:string; country:string }
const empty: Addr = { firstName:'',lastName:'',email:'',phone:'',line1:'',line2:'',city:'',state:'',zip:'',country:'India' }

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore()
  const [step,       setStep]      = useState(1)
  const [addr,       setAddr]      = useState<Addr>(empty)
  const [ship,       setShip]      = useState('standard')
  const [payMethod,  setPayMethod] = useState('card')
  const [cardNum,    setCardNum]   = useState('')
  const [cardExp,    setCardExp]   = useState('')
  const [cardCvc,    setCardCvc]   = useState('')
  const [cardName,   setCardName]  = useState('')
  const [upiId,      setUpiId]     = useState('')
  const [processing, setProc]      = useState(false)
  const [orderNum,   setOrderNum]  = useState<string|null>(null)
  const [orderId,    setOrderId]   = useState<string|null>(null)

  const sub      = subtotal()
  const shipCost = sub >= 99 ? 0 : ship === 'express' ? 19.99 : ship === 'overnight' ? 39.99 : 9.99
  const tax      = sub * 0.08
  const total    = sub + shipCost + tax
  const set      = (k: keyof Addr, v: string) => setAddr(a => ({ ...a, [k]: v }))

  const handleCardNum = (v: string) => {
    const clean = v.replace(/\D/g,'').slice(0,16)
    setCardNum(clean.replace(/(.{4})/g,'$1 ').trim())
  }
  const handleCardExp = (v: string) => {
    const clean = v.replace(/\D/g,'').slice(0,4)
    setCardExp(clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean)
  }

  const placeOrder = async () => {
    // Validate payment
    if (payMethod === 'card') {
      if (!cardNum || !cardExp || !cardCvc || !cardName) {
        toast.error('Please fill all card details'); return
      }
    }
    if (payMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID'); return
    }

    setProc(true)
    try {
      const res = await fetch('/api/checkout', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId:i.id, quantity:i.quantity, unitPrice:i.price })),
          shippingAddress: addr, subtotal: sub, tax, shipping: shipCost, total,
          paymentMethod: payMethod,
          paymentStatus: payMethod === 'cod' ? 'pending' : 'paid',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderNum(data.orderNumber)
      setOrderId(data.orderId)
      clearCart()
      setStep(4)
      toast.success('Order placed successfully! 🎉', { duration: 5000 })
    } catch(e: any) {
      toast.error(e.message || 'Order failed. Please try again.')
    }
    setProc(false)
  }

  if (items.length === 0 && !orderNum) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag size={48} className="text-cx-muted mx-auto mb-4"/>
        <h2 className="font-display font-700 text-2xl text-white mb-2">Your cart is empty</h2>
        <Link href="/products" className="btn-em px-6 py-3 rounded-xl inline-flex items-center gap-2 mt-4 text-[13px] font-700">
          Start Shopping <ArrowRight size={14}/>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Steps */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s,i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-full">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-700 transition-all',
                  step > s.id  ? 'bg-cx-emerald text-cx-bg' :
                  step === s.id ? 'bg-cx-emerald/15 text-cx-emerald border-2 border-cx-emerald/50 animate-glow-pulse' :
                  'bg-cx-border text-cx-muted')}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={cn('text-[12px] font-600 hidden sm:block', step >= s.id ? 'text-cx-text' : 'text-cx-muted')}>{s.label}</span>
              </div>
              {i < STEPS.length-1 && (
                <div className={cn('w-8 sm:w-14 h-0.5 transition-all duration-500', step > s.id ? 'bg-cx-emerald' : 'bg-cx-border')}/>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* Step 1 — Contact */}
            {step === 1 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <h2 className="font-display font-700 text-xl text-white mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([['firstName','First Name'],['lastName','Last Name'],['email','Email Address'],['phone','Phone Number']] as const).map(([k,l]) => (
                    <div key={k}>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">{l} *</label>
                      <input value={addr[k]} onChange={e => set(k, e.target.value)}
                        type={k==='email'?'email':k==='phone'?'tel':'text'}
                        className="cx-input w-full px-4 py-3 text-[13px]"
                        placeholder={k==='email'?'your@email.com':k==='phone'?'+91 9876543210':''}/>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  if (!addr.firstName || !addr.email) { toast.error('Fill required fields'); return }
                  setStep(2)
                }}
                  className="btn-em mt-6 px-8 py-3.5 text-[13px] font-700 rounded-2xl flex items-center gap-2">
                  Continue to Shipping <ArrowRight size={15}/>
                </button>
              </div>
            )}

            {/* Step 2 — Shipping */}
            {step === 2 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <h2 className="font-display font-700 text-xl text-white mb-6">Shipping Address</h2>
                <div className="space-y-4 mb-6">
                  {([['line1','Street Address'],['line2','Apt, Suite (optional)'],['city','City'],['state','State / Province'],['zip','ZIP / Postal Code'],['country','Country']] as const).map(([k,l]) => (
                    <div key={k}>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">{l}</label>
                      <input value={addr[k]} onChange={e => set(k, e.target.value)}
                        className="cx-input w-full px-4 py-3 text-[13px]"
                        placeholder={k==='country'?'India':''}/>
                    </div>
                  ))}
                </div>

                <h3 className="font-600 text-[13px] text-cx-text mb-3">Shipping Method</h3>
                <div className="space-y-2 mb-6">
                  {[
                    { id:'standard',  label:'Standard Shipping', sub:'5–7 business days',  price: sub>=99 ? 'FREE' : '$9.99',  badge:'Most Popular' },
                    { id:'express',   label:'Express Shipping',  sub:'2–3 business days',  price: sub>=99 ? 'FREE' : '$19.99', badge:'Fast' },
                    { id:'overnight', label:'Overnight Delivery',sub:'Next business day',  price: sub>=99 ? 'FREE' : '$39.99', badge:'Fastest' },
                  ].map(opt => (
                    <label key={opt.id} className={cn('flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all', ship===opt.id ? 'border-cx-emerald/40 bg-cx-emerald/5' : 'border-cx-border hover:border-cx-emerald/20')}>
                      <input type="radio" name="ship" value={opt.id} checked={ship===opt.id} onChange={() => setShip(opt.id)} className="accent-cx-emerald"/>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-600 text-[13px] text-cx-text">{opt.label}</p>
                          <span className="badge-em text-[9px] py-0.5">{opt.badge}</span>
                        </div>
                        <p className="text-[11px] text-cx-muted">{opt.sub}</p>
                      </div>
                      <span className="font-700 text-[13px] text-cx-emerald">{opt.price}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl flex items-center gap-2">
                    <ArrowLeft size={14}/> Back
                  </button>
                  <button onClick={() => { if (!addr.line1 || !addr.city) { toast.error('Fill your address'); return } setStep(3) }}
                    className="btn-em flex-1 py-3.5 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2">
                    Continue to Payment <ArrowRight size={15}/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Payment */}
            {step === 3 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-700 text-xl text-white">Payment Method</h2>
                  <div className="flex items-center gap-1.5 badge-em text-[11px] px-2.5 py-1">
                    <Lock size={10}/> 256-bit SSL
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon
                    return (
                      <label key={method.id} className={cn(
                        'flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all',
                        payMethod===method.id ? 'border-cx-emerald/50 bg-cx-emerald/5 shadow-[0_0_20px_rgba(16,217,136,0.08)]' : 'border-cx-border hover:border-cx-emerald/20 hover:bg-white/2'
                      )}>
                        <input type="radio" name="paymethod" value={method.id}
                          checked={payMethod===method.id} onChange={() => setPayMethod(method.id)}
                          className="accent-cx-emerald mt-1"/>
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                          payMethod===method.id ? 'bg-cx-emerald/15 text-cx-emerald' : 'bg-cx-surface text-cx-muted')}>
                          <Icon size={17}/>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-700 text-[13px] text-cx-text">{method.label}</p>
                            <span className={cn(method.badgeColor, 'text-[9px] py-0.5')}>{method.badge}</span>
                          </div>
                          <p className="text-[11px] text-cx-muted">{method.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* Card Fields */}
                {payMethod === 'card' && (
                  <div className="space-y-4 mb-6 p-4 rounded-2xl bg-cx-surface border border-cx-border animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                      {CARD_BRANDS.map(b => (
                        <div key={b.name} className="px-3 py-1.5 rounded-lg bg-cx-card border border-cx-border flex items-center justify-center h-9 w-14 opacity-70 hover:opacity-100 transition-opacity">
                          <img src={b.src} alt={b.name} className="max-h-5 max-w-full object-contain"/>
                        </div>
                      ))}
                      <span className="text-[11px] text-cx-muted">& more</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Cardholder Name</label>
                      <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name as on card"
                        className="cx-input w-full px-4 py-3 text-[13px]"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Card Number</label>
                      <div className="relative">
                        <input value={cardNum} onChange={e => handleCardNum(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19}
                          className="cx-input w-full px-4 py-3 text-[13px] font-mono tracking-wider"/>
                        <CreditCard size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Expiry Date</label>
                        <input value={cardExp} onChange={e => handleCardExp(e.target.value)} placeholder="MM/YY" maxLength={5}
                          className="cx-input w-full px-4 py-3 text-[13px] font-mono"/>
                      </div>
                      <div>
                        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">CVC</label>
                        <input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123" maxLength={4}
                          className="cx-input w-full px-4 py-3 text-[13px] font-mono"/>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {payMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-cx-surface border border-cx-border animate-fade-in mb-6">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">UPI ID</label>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                        className="cx-input w-full px-4 py-3 text-[13px]"/>
                    </div>
                    <p className="text-[11px] text-cx-muted mt-2 flex items-center gap-1.5">
                      <AlertCircle size={11}/> Payment request will be sent to your UPI app for approval
                    </p>
                  </div>
                )}

                {/* COD Info */}
                {payMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-cx-gold/5 border border-cx-gold/25 animate-fade-in mb-6">
                    <div className="flex items-start gap-3">
                      <Banknote size={18} className="text-cx-gold mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="font-700 text-[13px] text-cx-text mb-1">Pay on Delivery Details</p>
                        <ul className="space-y-1 text-[11px] text-cx-muted">
                          <li>✓ Pay cash or card when the delivery arrives</li>
                          <li>✓ No advance payment required</li>
                          <li>✓ Additional ₹49 COD handling fee applies</li>
                          <li>✓ Order can be cancelled before dispatch</li>
                          <li>✓ 30-day return policy still applies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security badge */}
                <div className="p-3 rounded-xl bg-cx-emerald/5 border border-cx-emerald/15 mb-5 flex items-start gap-2 text-[11px] text-cx-muted">
                  <BadgeCheck size={14} className="text-cx-emerald flex-shrink-0 mt-0.5"/>
                  <span>Your information is protected with 256-bit SSL encryption. We never store card numbers or share personal data.</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl flex items-center gap-2">
                    <ArrowLeft size={14}/> Back
                  </button>
                  <button onClick={placeOrder} disabled={processing}
                    className="btn-em flex-1 py-3.5 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {processing
                      ? <><Loader2 size={15} className="animate-spin"/> Processing…</>
                      : payMethod === 'cod'
                      ? <><Banknote size={15}/> Place Order — Pay on Delivery</>
                      : <><Shield size={15}/> Pay Securely — {formatPrice(total)}</>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Confirmed */}
            {step === 4 && orderNum && (
              <div className="p-8 rounded-3xl cx-card-flat text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
                  <CheckCircle2 size={36} className="text-cx-emerald"/>
                </div>
                <h2 className="font-display font-800 text-3xl text-white mb-2">Order Confirmed!</h2>
                <p className="text-cx-muted mb-1 text-[14px]">Order <strong className="text-cx-emerald font-mono text-[15px]">#{orderNum}</strong></p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cx-gold/10 border border-cx-gold/20 mb-5">
                  {payMethod === 'cod'
                    ? <><Banknote size={12} className="text-cx-gold"/><span className="text-[11px] text-cx-gold font-600">Pay on Delivery</span></>
                    : <><Shield size={12} className="text-cx-emerald"/><span className="text-[11px] text-cx-emerald font-600">Payment Successful</span></>}
                </div>
                <p className="text-[13px] text-cx-muted mb-8 leading-relaxed max-w-sm mx-auto">
                  A confirmation email with full order details has been sent to <strong className="text-cx-text">{addr.email}</strong>.
                  {payMethod === 'cod' && ' Please keep cash ready for delivery.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/orders?q=${orderNum}`} className="btn-em px-6 py-3 text-[13px] font-700 rounded-2xl inline-flex items-center gap-2">
                    Track Order <ArrowRight size={14}/>
                  </Link>
                  <Link href="/products" className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl">Continue Shopping</Link>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          {step < 4 && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl cx-card-flat">
                <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                  <ShoppingBag size={13}/> Order Summary ({items.length} {items.length===1?'item':'items'})
                </h3>
                <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cx-surface flex-shrink-0 border border-cx-border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px"
                          onError={(e) => { (e.target as any).style.display='none' }}/>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cx-violet text-white text-[9px] font-700 flex items-center justify-center z-10">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-600 text-cx-text truncate">{item.name}</p>
                        <p className="text-[11px] grad-emerald font-700 num">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cx-border pt-3 space-y-2">
                  <div className="flex justify-between text-[12px] text-cx-muted">
                    <span>Subtotal</span><span className="text-cx-text">{formatPrice(sub)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-cx-muted">
                    <span>Shipping</span>
                    <span className={shipCost===0?'text-cx-emerald':'text-cx-text'}>{shipCost===0?'FREE':formatPrice(shipCost)}</span>
                  </div>
                  {payMethod === 'cod' && (
                    <div className="flex justify-between text-[12px] text-cx-muted">
                      <span>COD Fee</span><span className="text-cx-gold">₹49</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[12px] text-cx-muted">
                    <span>Tax (8%)</span><span className="text-cx-text">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-700 text-[14px] pt-2 border-t border-cx-border">
                    <span className="text-cx-text">Total</span>
                    <span className="grad-emerald num text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-cx-emerald/5 border border-cx-emerald/15 text-[11px] text-cx-emerald flex items-center gap-2">
                <Shield size={13}/> Secure checkout · SSL encrypted
              </div>
              {sub < 99 && (
                <div className="p-3.5 rounded-2xl bg-cx-sky/5 border border-cx-sky/20 text-[11px] text-cx-sky">
                  Add {formatPrice(99 - sub)} more for <strong>FREE shipping!</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
