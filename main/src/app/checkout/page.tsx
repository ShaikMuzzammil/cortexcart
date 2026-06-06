'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useNotifStore } from '@/store/notifications'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBag, CreditCard, Truck, CheckCircle2, ArrowLeft, ArrowRight,
  Loader2, Shield, Lock, Zap, BadgeCheck, Package, MapPin, Clock,
  Banknote, ChevronRight, Check, AlertCircle, RotateCcw, Copy
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 1, label: 'Contact',  icon: ShoppingBag },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Payment',  icon: CreditCard },
  { id: 4, label: 'Confirm',  icon: CheckCircle2 },
]

const SHIP_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', desc: '5–7 business days', price: 9.99,  freeOver: 99,   icon: Truck },
  { id: 'express',  label: 'Express Delivery',  desc: '2–3 business days', price: 19.99, freeOver: null, icon: Zap },
  { id: 'overnight',label: 'Overnight',         desc: 'Next business day', price: 39.99, freeOver: null, icon: Clock },
]

interface Addr {
  firstName: string; lastName: string; email: string; phone: string
  line1: string; line2: string; city: string; state: string; zip: string; country: string
}
const empty: Addr = { firstName: '', lastName: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US' }

function InputField({ label, value, onChange, type = 'text', placeholder = '', required = false, hint }:
  { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-cx-rose ml-1">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={cn('w-full bg-cx-surface border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 focus:ring-2 focus:ring-cx-emerald/10 transition-all',
          hint ? 'border-cx-rose' : 'border-cx-border'
        )} />
      {hint && <p className="text-[10px] text-cx-rose mt-1">{hint}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const { addNotification } = useNotifStore()
  const [step,       setStep]       = useState(1)
  const [addr,       setAddr]       = useState<Addr>(empty)
  const [ship,       setShip]       = useState('standard')
  const [payMethod,  setPayMethod]  = useState<'cod' | 'card'>('cod')
  const [processing, setProc]       = useState(false)
  const [orderNum,   setOrderNum]   = useState<string | null>(null)
  const [orderId,    setOrderId]    = useState<string | null>(null)
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [confetti,   setConfetti]   = useState(false)
  const [copied,     setCopied]     = useState(false)

  const sub          = subtotal()
  const selectedShip = SHIP_OPTIONS.find(s => s.id === ship)!
  const shipCost     = (selectedShip.freeOver && sub >= selectedShip.freeOver) ? 0 : selectedShip.price
  const tax          = sub * 0.08
  const total        = sub + shipCost + tax
  const setA         = (k: keyof Addr, v: string) => setAddr(a => ({ ...a, [k]: v }))

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email && !addr.email) {
      setAddr(a => ({ ...a, email: session.user!.email!, name: (session.user as any)?.name || '' }))
    }
  }, [session])

  const copyOrderNum = () => {
    if (orderNum) {
      navigator.clipboard.writeText(orderNum)
      setCopied(true)
      toast.success('Order number copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!addr.firstName) e.firstName = 'Required'
    if (!addr.lastName)  e.lastName  = 'Required'
    if (!addr.email || !/\S+@\S+\.\S+/.test(addr.email)) e.email = 'Valid email required'
    if (!addr.phone) e.phone = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!addr.line1) e.line1 = 'Required'
    if (!addr.city)  e.city  = 'Required'
    if (!addr.state) e.state = 'Required'
    if (!addr.zip)   e.zip   = 'Required'
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
    setProc(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity, unitPrice: i.price })),
          shippingAddress: addr, subtotal: sub, tax, shipping: shipCost, total,
          paymentMethod: payMethod,
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
        message: `Order ${data.orderNumber} placed. Pay on delivery.`,
        link: `/account?tab=orders`,
        orderId: data.orderId,
      })
    } catch (e: any) {
      toast.error(e.message || 'Order failed. Please try again.')
    }
    setProc(false)
  }

  useEffect(() => {
    if (!confetti) return
    import('canvas-confetti').then(({ default: confettiLib }) => {
      confettiLib({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ['#10d988', '#8b5cf6', '#f5b731', '#38bdf8'] })
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
          <Zap size={15} /> Browse Products
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

        {/* 4-Step Stepper — always visible */}
        {step < 4 && (
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-0 overflow-x-auto">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                const done   = step > s.id
                const active = step === s.id
                return (
                  <div key={s.id} className="flex items-center">
                    <div className={cn('flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300',
                      active ? 'bg-cx-emerald/10 border border-cx-emerald/30' :
                      done   ? 'bg-cx-emerald/5' : 'opacity-40'
                    )}>
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
                        done   ? 'bg-cx-emerald' :
                        active ? 'bg-cx-emerald/20 border border-cx-emerald/50' :
                        'bg-cx-surface border border-cx-border'
                      )}>
                        {done ? <Check size={13} className="text-cx-bg" /> : <Icon size={13} className={active ? 'text-cx-emerald' : 'text-cx-muted'} />}
                      </div>
                      <span className={cn('text-[12px] sm:text-[13px] font-700 whitespace-nowrap',
                        active ? 'text-cx-emerald' : done ? 'text-cx-dim' : 'text-cx-muted'
                      )}>{s.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && <ChevronRight size={14} className="text-cx-border mx-0.5 sm:mx-1 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Main Form */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Contact */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="cx-card p-6 space-y-4">
                  <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-cx-emerald" /> Contact Information
                  </h2>
                  {authStatus === 'unauthenticated' && (
                    <div className="flex items-center gap-3 p-3 bg-cx-gold/8 border border-cx-gold/20 rounded-xl">
                      <AlertCircle size={14} className="text-cx-gold flex-shrink-0" />
                      <p className="text-[12px] text-cx-gold">
                        <Link href={`/auth/login?callbackUrl=/checkout`} className="font-700 underline">Sign in</Link> to save your order history and get personalized updates.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" value={addr.firstName} onChange={v => setA('firstName', v)} required hint={errors.firstName} />
                    <InputField label="Last Name"  value={addr.lastName}  onChange={v => setA('lastName', v)}  required hint={errors.lastName} />
                  </div>
                  <InputField label="Email Address" type="email" value={addr.email} onChange={v => setA('email', v)} required placeholder="you@example.com" hint={errors.email} />
                  <InputField label="Phone Number"  type="tel"   value={addr.phone} onChange={v => setA('phone', v)} required placeholder="+1 (555) 555-5555" hint={errors.phone} />
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6">
                  <div className="cx-card p-6 space-y-4">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2">
                      <MapPin size={18} className="text-cx-emerald" /> Shipping Address
                    </h2>
                    <InputField label="Address Line 1" value={addr.line1} onChange={v => setA('line1', v)} required placeholder="123 Main St" hint={errors.line1} />
                    <InputField label="Address Line 2" value={addr.line2} onChange={v => setA('line2', v)} placeholder="Apt, Suite, etc (optional)" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="City"  value={addr.city}  onChange={v => setA('city', v)}  required hint={errors.city} />
                      <InputField label="State" value={addr.state} onChange={v => setA('state', v)} required hint={errors.state} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="ZIP Code" value={addr.zip}     onChange={v => setA('zip', v)}     required hint={errors.zip} />
                      <InputField label="Country"  value={addr.country} onChange={v => setA('country', v)} required />
                    </div>
                  </div>

                  <div className="cx-card p-6">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2 mb-4">
                      <Truck size={18} className="text-cx-emerald" /> Shipping Method
                    </h2>
                    <div className="space-y-3">
                      {SHIP_OPTIONS.map(opt => {
                        const free = opt.freeOver && sub >= opt.freeOver
                        const Icon = opt.icon
                        return (
                          <label key={opt.id} className={cn('flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                            ship === opt.id ? 'border-cx-emerald/50 bg-cx-emerald/8' : 'border-cx-border hover:border-cx-border/80'
                          )}>
                            <input type="radio" name="ship" value={opt.id} checked={ship === opt.id} onChange={() => setShip(opt.id)} className="hidden" />
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                              ship === opt.id ? 'bg-cx-emerald/20' : 'bg-cx-surface'
                            )}>
                              <Icon size={18} className={ship === opt.id ? 'text-cx-emerald' : 'text-cx-muted'} />
                            </div>
                            <div className="flex-1">
                              <p className={cn('text-[14px] font-700', ship === opt.id ? 'text-white' : 'text-cx-text')}>{opt.label}</p>
                              <p className="text-[12px] text-cx-muted">{opt.desc}</p>
                            </div>
                            <span className={cn('font-700 text-[14px]', ship === opt.id ? 'text-cx-emerald' : 'text-cx-text')}>
                              {free ? <span className="text-cx-emerald">FREE</span> : `$${opt.price}`}
                            </span>
                            {ship === opt.id && (
                              <div className="w-5 h-5 rounded-full bg-cx-emerald flex items-center justify-center">
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

              {/* Step 3: Payment — Cash on Delivery default */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-cx-emerald/8 border border-cx-emerald/20 rounded-xl">
                    <Shield size={14} className="text-cx-emerald flex-shrink-0" />
                    <p className="text-[12px] text-cx-emerald font-600">256-bit SSL encrypted · Your payment data is never stored</p>
                  </div>

                  <div className="cx-card p-6">
                    <h2 className="font-display font-800 text-[18px] text-white flex items-center gap-2 mb-4">
                      <CreditCard size={18} className="text-cx-emerald" /> Payment Method
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {/* Pay on Delivery — shown first, default */}
                      <label className={cn('cursor-pointer p-4 rounded-xl border-2 transition-all text-center',
                        payMethod === 'cod' ? 'border-cx-emerald bg-cx-emerald/8' : 'border-cx-border hover:border-cx-border/80'
                      )}>
                        <input type="radio" value="cod" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} className="hidden" />
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2',
                          payMethod === 'cod' ? 'bg-cx-emerald/20' : 'bg-cx-surface'
                        )}>
                          <Banknote size={20} className={payMethod === 'cod' ? 'text-cx-emerald' : 'text-cx-muted'} />
                        </div>
                        <p className={cn('text-[13px] font-700', payMethod === 'cod' ? 'text-cx-emerald' : 'text-cx-text')}>Pay Cash</p>
                        <p className="text-[10px] text-cx-muted mt-0.5">Pay when delivered</p>
                      </label>

                      {/* Pay Online — secondary */}
                      <label className={cn('cursor-pointer p-4 rounded-xl border-2 transition-all text-center',
                        payMethod === 'card' ? 'border-cx-violet bg-cx-violet/8' : 'border-cx-border hover:border-cx-border/80'
                      )}>
                        <input type="radio" value="card" checked={payMethod === 'card'} onChange={() => setPayMethod('card')} className="hidden" />
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2',
                          payMethod === 'card' ? 'bg-cx-violet/20' : 'bg-cx-surface'
                        )}>
                          <CreditCard size={20} className={payMethod === 'card' ? 'text-cx-violet' : 'text-cx-muted'} />
                        </div>
                        <p className={cn('text-[13px] font-700', payMethod === 'card' ? 'text-cx-violet' : 'text-cx-text')}>Pay Online</p>
                        <p className="text-[10px] text-cx-muted mt-0.5">Card / UPI / Wallet</p>
                      </label>
                    </div>

                    <AnimatePresence mode="wait">
                      {payMethod === 'cod' && (
                        <motion.div key="cod" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden">
                          <div className="bg-cx-emerald/6 border border-cx-emerald/20 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-cx-emerald/15 flex items-center justify-center">
                                <Banknote size={22} className="text-cx-emerald" />
                              </div>
                              <div>
                                <p className="text-[15px] font-700 text-white">Pay on Delivery</p>
                                <p className="text-[12px] text-cx-muted">Pay with cash when your order arrives</p>
                              </div>
                            </div>
                            <ul className="space-y-2.5">
                              {[
                                'Pay only when you receive your order',
                                'Keep exact change ready for delivery person',
                                'COD available for orders up to $500',
                                'Order tracking sent to your email',
                                'No hidden fees or extra charges',
                              ].map(item => (
                                <li key={item} className="flex items-center gap-2.5 text-[12px] text-cx-dim">
                                  <Check size={12} className="text-cx-emerald flex-shrink-0" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}

                      {payMethod === 'card' && (
                        <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[12px] font-600 text-cx-muted">Visa</span>
                            <span className="text-[12px] font-600 text-cx-muted">Mastercard</span>
                            <span className="text-[12px] font-600 text-cx-muted">Amex</span>
                            <div className="ml-auto flex items-center gap-1 text-[10px] text-cx-muted">
                              <Lock size={10} /> Secure
                            </div>
                          </div>
                          <div className="bg-cx-sky/8 border border-cx-sky/20 rounded-xl px-4 py-3">
                            <p className="text-[11px] text-cx-sky font-600 flex items-center gap-2">
                              <AlertCircle size={12} /> Demo mode — No real payment processed.
                            </p>
                          </div>
                          <InputField label="Cardholder Name" value="" onChange={() => {}} placeholder="Name on card" />
                          <InputField label="Card Number" value="" onChange={() => {}} placeholder="1234 5678 9012 3456" />
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Expiry Date" value="" onChange={() => {}} placeholder="MM/YY" />
                            <InputField label="CVC" value="" onChange={() => {}} placeholder="• • •" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="cx-card p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    className="w-20 h-20 rounded-3xl bg-cx-emerald/15 border-2 border-cx-emerald/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-cx-emerald" />
                  </motion.div>
                  <h2 className="font-display font-800 text-[28px] text-white mb-2">Order Confirmed! 🎉</h2>
                  <p className="text-cx-muted mb-6 text-[14px] leading-relaxed">
                    Your order is placed! Pay when it arrives at your door. A confirmation email has been sent to <strong className="text-cx-emerald">{addr.email}</strong>
                  </p>

                  <div className="bg-cx-surface border border-cx-border rounded-2xl p-5 mb-6 text-left space-y-4">
                    <div>
                      <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Order Number</p>
                      <div className="flex items-center gap-3">
                        <p className="font-800 text-cx-emerald font-mono text-lg">{orderNum}</p>
                        <button onClick={copyOrderNum}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-700 transition-all',
                            copied ? 'bg-cx-emerald/20 text-cx-emerald' : 'bg-cx-surface border border-cx-border text-cx-muted hover:text-cx-text'
                          )}>
                          <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[13px]">
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Payment</p>
                        <p className="font-700 text-white">Cash on Delivery</p>
                      </div>
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Total</p>
                        <p className="font-800 text-cx-emerald">{formatPrice(total)}</p>
                      </div>
                      <div>
                        <p className="text-cx-muted text-[11px] uppercase tracking-wide mb-1">Delivery</p>
                        <p className="font-700 text-white">{selectedShip.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={`/track?q=${orderNum}`} className="btn-em px-6 py-3 text-[14px] rounded-xl inline-flex items-center justify-center gap-2 font-800">
                      <Package size={15} /> Track Your Order
                    </Link>
                    <Link href="/account?tab=orders" className="btn-outline-em px-6 py-3 text-[14px] rounded-xl inline-flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} /> View My Orders
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 4 && (
              <div className="flex items-center justify-between mt-6">
                <button onClick={() => { setErrors({}); setStep(s => s - 1) }} disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cx-border text-cx-dim hover:text-cx-text transition-all disabled:opacity-30 text-[13px] font-600">
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={nextStep} disabled={processing}
                  className="btn-em flex items-center gap-2 px-7 py-3 text-[14px] rounded-xl font-800 min-w-[160px] justify-center">
                  {processing ? <Loader2 size={16} className="animate-spin" /> :
                   step === 3 ? <><Shield size={15} /> Place Order</> :
                   <>Next <ArrowRight size={15} /></>}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
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
                  <div className="flex justify-between text-cx-dim"><span>Shipping</span><span>{shipCost === 0 ? <span className="text-cx-emerald">FREE</span> : formatPrice(shipCost)}</span></div>
                  <div className="flex justify-between text-cx-dim"><span>Tax (8%)</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between text-[16px] font-800 text-white pt-2 border-t border-cx-border">
                    <span>Total</span><span className="text-cx-emerald">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <div className="cx-card p-4 space-y-3">
                {[
                  { icon: Shield,    text: '256-bit SSL encryption' },
                  { icon: BadgeCheck,text: 'Secure checkout' },
                  { icon: RotateCcw, text: '30-day return guarantee' },
                ].map(({ icon: Icon, text }) => (
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
