'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { useNotifStore } from '@/store/notifications'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, CreditCard, Truck, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Shield, Lock, Zap, BadgeCheck, Package, MapPin, Clock, Banknote, ChevronRight, Check, Star, AlertCircle, Phone, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id:1, label:'Contact',  icon:ShoppingBag },
  { id:2, label:'Shipping', icon:Truck },
  { id:3, label:'Payment',  icon:CreditCard },
  { id:4, label:'Confirm',  icon:CheckCircle2 },
]

const SHIP_OPTIONS = [
  { id:'standard', label:'Standard Delivery', desc:'5–7 business days', price:9.99, freeOver:99, icon:Truck },
  { id:'express',  label:'Express Delivery',  desc:'2–3 business days', price:19.99, freeOver:null, icon:Zap },
  { id:'overnight',label:'Overnight',         desc:'Next business day', price:39.99, freeOver:null, icon:Clock },
]

type PaymentMethod = 'card' | 'cod'

interface Addr {
  firstName:string; lastName:string; email:string; phone:string
  line1:string; line2:string; city:string; state:string; zip:string; country:string
}
const empty: Addr = { firstName:'',lastName:'',email:'',phone:'',line1:'',line2:'',city:'',state:'',zip:'',country:'US' }

function InputField({ label, value, onChange, type='text', placeholder='', required=false, pattern, hint }:
  { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; required?:boolean; pattern?:string; hint?:string }) {
  return (
    <div>
      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">{label}{required && <span className="text-cx-rose ml-1">*</span>}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} pattern={pattern}
        className="w-full bg-cx-surface border border-cx-border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 focus:ring-2 focus:ring-cx-emerald/10 transition-all"
      />
      {hint && <p className="text-[10px] text-cx-muted mt-1">{hint}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, couponCode, couponType, couponDiscount, discountedSubtotal } = useCartStore()
  const { addNotification } = useNotifStore()
  const [step,        setStep]        = useState(1)
  const [addr,        setAddr]        = useState<Addr>(empty)
  const [ship,        setShip]        = useState('standard')
  const [payMethod,   setPayMethod]   = useState<PaymentMethod>('card')
  const [cardNum,     setCardNum]     = useState('')
  const [cardExp,     setCardExp]     = useState('')
  const [cardCvc,     setCardCvc]     = useState('')
  const [cardName,    setCardName]    = useState('')
  const [processing,  setProc]        = useState(false)
  const [orderNum,    setOrderNum]    = useState<string|null>(null)
  const [orderId,     setOrderId]     = useState<string|null>(null)
  const [errors,      setErrors]      = useState<Record<string,string>>({})
  const [confetti,    setConfetti]    = useState(false)

  const sub         = subtotal()
  const discSub     = discountedSubtotal()
  const selectedShip = SHIP_OPTIONS.find(s => s.id === ship)!
  const shipCost    = (selectedShip.freeOver && discSub >= selectedShip.freeOver) || couponType === 'freeship' ? 0 : selectedShip.price
  const tax         = discSub * 0.08
  const couponSave  = couponType === 'percent' ? sub * couponDiscount/100 : couponType === 'fixed' ? Math.min(sub, couponDiscount) : 0
  const total       = discSub + shipCost + tax
  const set         = (k: keyof Addr, v: string) => setAddr(a => ({ ...a, [k]: v }))

  const handleCardNum = (v: string) => {
    const clean = v.replace(/\D/g,'').slice(0,16)
    setCardNum(clean.replace(/(.{4})/g,'$1 ').trim())
  }
  const handleCardExp = (v: string) => {
    const clean = v.replace(/\D/g,'').slice(0,4)
    setCardExp(clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean)
  }

  const validateStep1 = () => {
    const e: Record<string,string> = {}
    if (!addr.firstName) e.firstName = 'Required'
    if (!addr.lastName)  e.lastName  = 'Required'
    if (!addr.email || !/\S+@\S+\.\S+/.test(addr.email)) e.email = 'Valid email required'
    if (!addr.phone) e.phone = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validateStep2 = () => {
    const e: Record<string,string> = {}
    if (!addr.line1) e.line1 = 'Required'
    if (!addr.city)  e.city  = 'Required'
    if (!addr.state) e.state = 'Required'
    if (!addr.zip)   e.zip   = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validateStep3 = () => {
    if (payMethod === 'cod') return true
    const e: Record<string,string> = {}
    if (!cardName) e.cardName = 'Required'
    if (cardNum.replace(/\s/g,'').length < 16) e.cardNum = 'Invalid card number'
    if (!cardExp || cardExp.length < 5) e.cardExp = 'Invalid expiry'
    if (!cardCvc || cardCvc.length < 3) e.cardCvc = 'Invalid CVC'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3) { placeOrder(); return }
    setStep(s => s + 1)
  }

  const placeOrder = async () => {
    if (!validateStep3()) return
    setProc(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId:i.id, quantity:i.quantity, unitPrice:i.price })),
          shippingAddress: addr, subtotal: sub, tax, shipping: shipCost, total,
          couponCode, paymentMethod: payMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderNum(data.orderNumber)
      setOrderId(data.orderId)
      clearCart()
      setStep(4)
      setConfetti(true)
      addNotification({
        type: 'order',
        title: 'Order Confirmed! 🎉',
        message: `Order #${data.orderNumber.slice(-8).toUpperCase()} placed successfully. ${payMethod === 'cod' ? 'Pay on delivery.' : 'Payment confirmed.'}`,
        link: `/orders`,
        orderId: data.orderId,
      })
    } catch(e: any) {
      toast.error(e.message || 'Order failed. Please try again.')
    }
    setProc(false)
  }

  // Canvas confetti on success
  useEffect(() => {
    if (!confetti) return
    import('canvas-confetti').then(({ default: confettiLib }) => {
      confettiLib({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#10d988','#8b5cf6','#f5b731','#38bdf8'] })
    }).catch(() => {})
  }, [confetti])

  if (items.length === 0 && !orderNum) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-cx-surface/60 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={32} className="text-cx-muted" />
        </div>
        <h2 className="font-display font-700 text-2xl text-white mb-2">Your cart is empty</h2>
        <p className="text-cx-muted mb-6">Add products before checking out</p>
        <Link href="/products" className="btn-em px-6 py-3 text-[14px] rounded-xl inline-flex items-center gap-2">
          <Zap size={15}/> Browse Products
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cx-bg py-8 px-4 pb-24 sm:pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="p-2 hover:bg-cx-surface/60 rounded-xl transition-all">
            <ArrowLeft size={18} className="text-cx-dim" />
          </Link>
          <div>
            <h1 className="font-display font-800 text-2xl text-white">Checkout</h1>
            <p className="text-cx-muted text-[13px]">Secure & encrypted checkout</p>
          </div>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.slice(0,3).map((s, idx) => {
              const Icon = s.icon
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} className="flex items-center">
                  <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                    active ? 'bg-cx-emerald/10 border border-cx-emerald/30' : done ? 'bg-cx-emerald/5' : 'opacity-40'
                  )}>
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                      done ? 'bg-cx-emerald' : active ? 'bg-cx-emerald/20 border border-cx-emerald/50' : 'bg-cx-surface border border-cx-border'
                    )}>
                      {done ? <Check size={13} className="text-cx-bg" /> : <Icon size={13} className={active ? 'text-cx-emerald' : 'text-cx-muted'} />}
                    </div>
                    <span className={cn('text-[13px] font-700 hidden sm:block', active ? 'text-cx-emerald' : done ? 'text-cx-dim' : 'text-cx-muted')}>{s.label}</span>
                  </div>
                  {idx < 2 && <ChevronRight size={14} className="text-cx-border mx-1" />}
                </div>
              )
            })}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Main Form */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Contact */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                  className="cx-card p-6 space-y-4">
                  <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-cx-emerald" /> Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" value={addr.firstName} onChange={v=>set('firstName',v)} required hint={errors.firstName} />
                    <InputField label="Last Name"  value={addr.lastName}  onChange={v=>set('lastName',v)}  required hint={errors.lastName} />
                  </div>
                  <InputField label="Email Address" type="email" value={addr.email} onChange={v=>set('email',v)} required placeholder="you@example.com" hint={errors.email} />
                  <InputField label="Phone Number" type="tel" value={addr.phone} onChange={v=>set('phone',v)} required placeholder="+1 (555) 555-5555" hint={errors.phone} />
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                  className="space-y-6">
                  <div className="cx-card p-6 space-y-4">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2">
                      <MapPin size={18} className="text-cx-emerald" /> Shipping Address
                    </h2>
                    <InputField label="Address Line 1" value={addr.line1} onChange={v=>set('line1',v)} required placeholder="123 Main St" hint={errors.line1} />
                    <InputField label="Address Line 2" value={addr.line2} onChange={v=>set('line2',v)} placeholder="Apt, Suite, etc (optional)" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="City"  value={addr.city}  onChange={v=>set('city',v)}  required hint={errors.city} />
                      <InputField label="State" value={addr.state} onChange={v=>set('state',v)} required hint={errors.state} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="ZIP Code" value={addr.zip}     onChange={v=>set('zip',v)}     required hint={errors.zip} />
                      <InputField label="Country"  value={addr.country} onChange={v=>set('country',v)} required />
                    </div>
                  </div>

                  {/* Shipping method */}
                  <div className="cx-card p-6">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2 mb-4">
                      <Truck size={18} className="text-cx-emerald" /> Shipping Method
                    </h2>
                    <div className="space-y-3">
                      {SHIP_OPTIONS.map(opt => {
                        const free = opt.freeOver && discSub >= opt.freeOver
                        const Icon = opt.icon
                        return (
                          <label key={opt.id} className={cn('flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                            ship === opt.id ? 'border-cx-emerald/50 bg-cx-emerald/8' : 'border-cx-border hover:border-cx-border/80 hover:bg-cx-surface/40'
                          )}>
                            <input type="radio" name="ship" value={opt.id} checked={ship===opt.id} onChange={()=>setShip(opt.id)} className="hidden" />
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                              ship === opt.id ? 'bg-cx-emerald/20' : 'bg-cx-surface'
                            )}>
                              <Icon size={18} className={ship===opt.id ? 'text-cx-emerald' : 'text-cx-muted'} />
                            </div>
                            <div className="flex-1">
                              <p className={cn('text-[14px] font-700', ship===opt.id ? 'text-white' : 'text-cx-text')}>{opt.label}</p>
                              <p className="text-[12px] text-cx-muted">{opt.desc}</p>
                            </div>
                            <div className="text-right">
                              {free ? (
                                <span className="text-cx-emerald font-700 text-[13px]">FREE</span>
                              ) : (
                                <span className={cn('font-700 text-[14px]', ship===opt.id ? 'text-cx-emerald' : 'text-cx-text')}>${opt.price}</span>
                              )}
                            </div>
                            {ship===opt.id && (
                              <div className="w-5 h-5 rounded-full bg-cx-emerald flex items-center justify-center flex-shrink-0">
                                <Check size={11} className="text-cx-bg" />
                              </div>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                  className="space-y-5">
                  {/* Security badge */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-cx-emerald/8 border border-cx-emerald/20 rounded-xl">
                    <Shield size={14} className="text-cx-emerald flex-shrink-0" />
                    <p className="text-[12px] text-cx-emerald font-600">256-bit SSL encrypted · Your payment data is never stored</p>
                  </div>

                  {/* Payment method selector */}
                  <div className="cx-card p-6">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2 mb-4">
                      <CreditCard size={18} className="text-cx-emerald" /> Payment Method
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {/* Online Payment */}
                      <label className={cn('cursor-pointer p-4 rounded-xl border-2 transition-all text-center',
                        payMethod === 'card' ? 'border-cx-emerald bg-cx-emerald/8' : 'border-cx-border hover:border-cx-border/80'
                      )}>
                        <input type="radio" value="card" checked={payMethod==='card'} onChange={()=>setPayMethod('card')} className="hidden" />
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2',
                          payMethod==='card' ? 'bg-cx-emerald/20' : 'bg-cx-surface'
                        )}>
                          <CreditCard size={20} className={payMethod==='card' ? 'text-cx-emerald' : 'text-cx-muted'} />
                        </div>
                        <p className={cn('text-[13px] font-700', payMethod==='card' ? 'text-cx-emerald' : 'text-cx-text')}>Pay Online</p>
                        <p className="text-[10px] text-cx-muted mt-0.5">Card / UPI / Wallet</p>
                      </label>

                      {/* Cash on Delivery */}
                      <label className={cn('cursor-pointer p-4 rounded-xl border-2 transition-all text-center',
                        payMethod === 'cod' ? 'border-cx-gold bg-cx-gold/8' : 'border-cx-border hover:border-cx-border/80'
                      )}>
                        <input type="radio" value="cod" checked={payMethod==='cod'} onChange={()=>setPayMethod('cod')} className="hidden" />
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2',
                          payMethod==='cod' ? 'bg-cx-gold/20' : 'bg-cx-surface'
                        )}>
                          <Banknote size={20} className={payMethod==='cod' ? 'text-cx-gold' : 'text-cx-muted'} />
                        </div>
                        <p className={cn('text-[13px] font-700', payMethod==='cod' ? 'text-cx-gold' : 'text-cx-text')}>Pay on Delivery</p>
                        <p className="text-[10px] text-cx-muted mt-0.5">Cash when delivered</p>
                      </label>
                    </div>

                    {/* Card form */}
                    <AnimatePresence mode="wait">
                      {payMethod === 'card' && (
                        <motion.div key="card-form" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                          className="space-y-4 overflow-hidden">
                          <div className="flex items-center gap-3 mb-2">
                            {['Visa','Mastercard','Amex'].map(brand => (
                              <img key={brand} src={`https://upload.wikimedia.org/wikipedia/commons/thumb/${
                                brand==='Visa' ? '5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png' :
                                brand==='Mastercard' ? '2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png' :
                                'f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png'
                              }`} alt={brand} className="h-6 object-contain opacity-80" />
                            ))}
                            <div className="ml-auto flex items-center gap-1 text-[10px] text-cx-muted">
                              <Lock size={10}/> Secure
                            </div>
                          </div>
                          <InputField label="Cardholder Name" value={cardName} onChange={setCardName} required placeholder="Name on card" hint={errors.cardName} />
                          <div>
                            <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Card Number <span className="text-cx-rose">*</span></label>
                            <input value={cardNum} onChange={e=>handleCardNum(e.target.value)} placeholder="1234 5678 9012 3456"
                              className={cn('w-full bg-cx-surface border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all font-mono tracking-wider',
                                errors.cardNum ? 'border-cx-rose' : 'border-cx-border'
                              )} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Expiry Date</label>
                              <input value={cardExp} onChange={e=>handleCardExp(e.target.value)} placeholder="MM/YY"
                                className="w-full bg-cx-surface border border-cx-border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">CVC</label>
                              <input value={cardCvc} onChange={e=>setCardCvc(e.target.value.slice(0,4))} placeholder="• • •"
                                type="password"
                                className="w-full bg-cx-surface border border-cx-border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all" />
                            </div>
                          </div>
                          <div className="bg-cx-sky/8 border border-cx-sky/20 rounded-xl px-4 py-3">
                            <p className="text-[11px] text-cx-sky font-600 flex items-center gap-2">
                              <AlertCircle size={12}/> Demo mode: Enter any valid-format card. No real payment processed.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {payMethod === 'cod' && (
                        <motion.div key="cod-info" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                          className="overflow-hidden">
                          <div className="bg-cx-gold/8 border border-cx-gold/20 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cx-gold/20 flex items-center justify-center">
                                <Banknote size={20} className="text-cx-gold" />
                              </div>
                              <div>
                                <p className="text-[14px] font-700 text-white">Pay on Delivery</p>
                                <p className="text-[12px] text-cx-muted">Pay with cash when your order arrives</p>
                              </div>
                            </div>
                            <ul className="space-y-2 text-[12px] text-cx-dim">
                              {['Pay only when you receive your order','Keep exact change ready for delivery person','COD available for orders up to $500','Order tracking link sent to your email'].map(item => (
                                <li key={item} className="flex items-center gap-2">
                                  <Check size={11} className="text-cx-gold flex-shrink-0" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                  className="cx-card p-8 text-center">
                  <motion.div
                    initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', damping:15 }}
                    className="w-20 h-20 rounded-3xl bg-cx-emerald/15 border-2 border-cx-emerald/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 size={40} className="text-cx-emerald" />
                  </motion.div>
                  <h2 className="font-display font-800 text-[28px] text-white mb-2">Order Confirmed! 🎉</h2>
                  <p className="text-cx-muted mb-6 text-[14px] leading-relaxed">
                    {payMethod === 'cod'
                      ? 'Your order is placed! Pay when it arrives at your door.'
                      : 'Payment successful! Your order is being processed.'}
                  </p>

                  <div className="bg-cx-surface border border-cx-border rounded-2xl p-4 mb-6 text-left">
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Order Number</p>
                        <p className="font-800 text-cx-emerald font-mono">{orderNum?.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Payment</p>
                        <p className="font-700 text-white">{payMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      </div>
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Total</p>
                        <p className="font-800 text-white">{formatPrice(total)}</p>
                      </div>
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Delivery</p>
                        <p className="font-700 text-white">{selectedShip.desc}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[12px] text-cx-muted mb-6">
                    📧 A detailed confirmation email has been sent to <strong className="text-cx-text">{addr.email}</strong> with your order details, tracking info, and itemized receipt.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/orders" className="btn-em px-6 py-3 text-[14px] rounded-xl inline-flex items-center justify-center gap-2 font-800">
                      <Package size={15} /> Track Your Order
                    </Link>
                    <Link href="/products" className="btn-outline-em px-6 py-3 text-[14px] rounded-xl inline-flex items-center justify-center gap-2">
                      Continue Shopping
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex items-center justify-between mt-6">
                <button onClick={() => { setErrors({}); setStep(s => s-1) }} disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cx-border text-cx-dim hover:text-cx-text hover:border-cx-border/80 transition-all disabled:opacity-30 text-[13px] font-600">
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={nextStep} disabled={processing}
                  className="btn-em flex items-center gap-2 px-7 py-3 text-[14px] rounded-xl font-800 min-w-[160px] justify-center">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : step === 3 ? (<><Shield size={15}/>{payMethod === 'cod' ? 'Place Order' : 'Pay & Order'}</>) : (<>Next <ArrowRight size={15}/></>)}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 4 && (
            <div className="space-y-4">
              <div className="cx-card p-5">
                <h3 className="font-700 text-[15px] text-white mb-4 flex items-center gap-2">
                  <ShoppingBag size={15} className="text-cx-emerald" /> Order Summary
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cx-surface flex-shrink-0 border border-cx-border/50">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-cx-emerald text-cx-bg text-[10px] font-800 rounded-full flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-600 text-cx-text truncate">{item.name}</p>
                        <p className="text-[11px] text-cx-muted">{item.brand}</p>
                      </div>
                      <span className="text-[13px] font-700 text-cx-emerald flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cx-border pt-3 space-y-2 text-[13px]">
                  <div className="flex justify-between text-cx-dim"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
                  {couponSave > 0 && <div className="flex justify-between text-cx-emerald"><span>Coupon ({couponCode})</span><span>−{formatPrice(couponSave)}</span></div>}
                  <div className="flex justify-between text-cx-dim"><span>Shipping</span><span>{shipCost === 0 ? <span className="text-cx-emerald">FREE</span> : formatPrice(shipCost)}</span></div>
                  <div className="flex justify-between text-cx-dim"><span>Tax</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between text-[16px] font-800 text-white pt-2 border-t border-cx-border">
                    <span>Total</span><span className="text-cx-emerald">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              {/* Trust */}
              <div className="cx-card p-4 space-y-3">
                {[{ icon:Shield, text:'256-bit SSL encryption' },{ icon:BadgeCheck, text:'Verified secure payments' },{ icon:RotateCcw||Lock, text:'30-day return guarantee' }].map(({icon: Icon, text}) => (
                  <div key={text} className="flex items-center gap-3 text-[12px] text-cx-muted">
                    <Icon size={14} className="text-cx-emerald" />{text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
