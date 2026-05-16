'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatPrice }  from '@/lib/utils'
import { ShoppingBag, CreditCard, Truck, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Shield, Lock, Zap } from 'lucide-react'
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

interface Addr { firstName:string; lastName:string; email:string; phone:string; line1:string; line2:string; city:string; state:string; zip:string; country:string }
const empty: Addr = { firstName:'', lastName:'', email:'', phone:'', line1:'', line2:'', city:'', state:'', zip:'', country:'US' }

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore()
  const [step,    setStep]    = useState(1)
  const [addr,    setAddr]    = useState<Addr>(empty)
  const [ship,    setShip]    = useState('standard')
  const [processing, setProc] = useState(false)
  const [orderNum, setOrderNum] = useState<string|null>(null)

  const sub      = subtotal()
  const shipCost = sub >= 99 ? 0 : ship==='express' ? 19.99 : 9.99
  const tax      = sub * 0.08
  const total    = sub + shipCost + tax
  const set      = (k: keyof Addr, v: string) => setAddr(a=>({...a,[k]:v}))

  const placeOrder = async () => {
    setProc(true)
    try {
      const res  = await fetch('/api/checkout', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ items:items.map(i=>({ productId:i.id, quantity:i.quantity, unitPrice:i.price })), shippingAddress:addr, subtotal:sub, tax, shipping:shipCost, total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderNum(data.orderNumber)
      clearCart()
      setStep(4)
    } catch(e:any) { toast.error(e.message||'Order failed') }
    setProc(false)
  }

  if (items.length===0 && !orderNum) return (
    <div className="min-h-screen pt-28 flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag size={48} className="text-cx-muted mx-auto mb-4"/>
        <h2 className="font-display font-700 text-2xl text-white mb-2">Your cart is empty</h2>
        <Link href="/products" className="btn-em px-6 py-3 rounded-xl inline-flex items-center gap-2 mt-4 text-[13px] font-700">Shop Now <ArrowRight size={14}/></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s,i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-600">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-700',
                  step > s.id  ? 'bg-cx-emerald/20 text-cx-emerald border border-cx-emerald/40' :
                  step === s.id ? 'bg-cx-emerald/15 text-cx-emerald border border-cx-emerald/50' :
                  'bg-cx-border text-cx-muted')}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={cn('hidden sm:block', step>=s.id?'text-cx-text':'text-cx-muted')}>{s.label}</span>
              </div>
              {i < STEPS.length-1 && <div className={cn('w-6 sm:w-12 h-px', step>s.id?'bg-cx-emerald/40':'bg-cx-border')}/>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form area */}
          <div className="lg:col-span-2">

            {/* Step 1 – Contact */}
            {step===1 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <h2 className="font-display font-700 text-xl text-white mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([['firstName','First Name'],['lastName','Last Name'],['email','Email Address'],['phone','Phone Number']] as const).map(([k,l]) => (
                    <div key={k}>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">{l}</label>
                      <input value={addr[k]} onChange={e=>set(k,e.target.value)} type={k==='email'?'email':k==='phone'?'tel':'text'} className="cx-input w-full px-4 py-3 text-[13px]"/>
                    </div>
                  ))}
                </div>
                <button onClick={() => { if(!addr.firstName||!addr.email){toast.error('Fill required fields');return}; setStep(2) }}
                  className="btn-em mt-6 px-8 py-3.5 text-[13px] font-700 rounded-2xl flex items-center gap-2">
                  Continue to Shipping <ArrowRight size={15}/>
                </button>
              </div>
            )}

            {/* Step 2 – Shipping */}
            {step===2 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <h2 className="font-display font-700 text-xl text-white mb-6">Shipping Address</h2>
                <div className="space-y-4 mb-6">
                  {([['line1','Street Address'],['line2','Apt, Suite (optional)'],['city','City'],['state','State / Province'],['zip','ZIP / Postal Code'],['country','Country']] as const).map(([k,l]) => (
                    <div key={k}>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">{l}</label>
                      <input value={addr[k]} onChange={e=>set(k,e.target.value)} className="cx-input w-full px-4 py-3 text-[13px]"/>
                    </div>
                  ))}
                </div>

                <h3 className="font-600 text-[13px] text-cx-text mb-3">Shipping Method</h3>
                <div className="space-y-2 mb-6">
                  {[
                    { id:'standard', label:'Standard', sub:'3–7 business days', price: sub>=99?'FREE':'$9.99' },
                    { id:'express',  label:'Express',  sub:'1–2 business days', price: sub>=99?'FREE':'$19.99' },
                  ].map(opt => (
                    <label key={opt.id} className={cn('flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all', ship===opt.id?'border-cx-emerald/40 bg-cx-emerald/5':'border-cx-border hover:border-cx-emerald/20')}>
                      <input type="radio" name="ship" value={opt.id} checked={ship===opt.id} onChange={()=>setShip(opt.id)} className="accent-cx-emerald"/>
                      <div className="flex-1">
                        <p className="font-600 text-[13px] text-cx-text">{opt.label}</p>
                        <p className="text-[11px] text-cx-muted">{opt.sub}</p>
                      </div>
                      <span className="font-700 text-[13px] text-cx-emerald">{opt.price}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={()=>setStep(1)} className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
                  <button onClick={()=>{if(!addr.line1||!addr.city){toast.error('Fill your address');return};setStep(3)}}
                    className="btn-em flex-1 py-3.5 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2">
                    Continue to Payment <ArrowRight size={15}/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 – Payment */}
            {step===3 && (
              <div className="p-6 rounded-3xl cx-card-flat animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-700 text-xl text-white">Payment</h2>
                  <div className="flex items-center gap-1.5 text-[11px] text-cx-emerald badge-em">
                    <Lock size={11}/> Stripe Encrypted
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cx-bg border border-cx-border mb-6">
                  <p className="text-[11px] text-cx-muted uppercase tracking-wider mb-4">Demo Mode — Test Card</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Card Number</label>
                      <input defaultValue="4242 4242 4242 4242" readOnly className="cx-input w-full px-4 py-3 text-[13px] font-mono opacity-60"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Expiry</label>
                        <input defaultValue="12/27" readOnly className="cx-input w-full px-4 py-3 text-[13px] font-mono opacity-60"/>
                      </div>
                      <div>
                        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">CVC</label>
                        <input defaultValue="123" readOnly className="cx-input w-full px-4 py-3 text-[13px] font-mono opacity-60"/>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-cx-muted mt-3">Add your Stripe keys in <code className="text-cx-emerald">.env.local</code> for live payments</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={()=>setStep(2)} className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
                  <button onClick={placeOrder} disabled={processing}
                    className="btn-em flex-1 py-3.5 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {processing?<><Loader2 size={15} className="animate-spin"/>Processing…</>:<><Shield size={15}/> Place Order — {formatPrice(total)}</>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 – Confirmation */}
            {step===4 && orderNum && (
              <div className="p-8 rounded-3xl cx-card-flat text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={36} className="text-cx-emerald"/>
                </div>
                <h2 className="font-display font-900 text-3xl text-white mb-2">Order Confirmed!</h2>
                <p className="text-cx-muted mb-2">Order <strong className="text-cx-emerald font-mono">#{orderNum}</strong></p>
                <p className="text-[13px] text-cx-muted mb-8 leading-relaxed max-w-sm mx-auto">A confirmation email has been sent to <strong>{addr.email}</strong>. Our team has been notified.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/orders?q=${orderNum}`} className="btn-em px-6 py-3 text-[13px] font-700 rounded-2xl inline-flex items-center gap-2">Track Order <ArrowRight size={14}/></Link>
                  <Link href="/products" className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl">Continue Shopping</Link>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          {step < 4 && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl cx-card-flat">
                <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2"><ShoppingBag size={13}/> Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cx-card flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px"/>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cx-violet text-white text-[9px] font-700 flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-600 text-cx-text truncate">{item.name}</p>
                        <p className="text-[11px] grad-emerald font-700 num">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cx-border pt-3 space-y-2">
                  <div className="flex justify-between text-[12px] text-cx-muted"><span>Subtotal</span><span className="text-cx-text">{formatPrice(sub)}</span></div>
                  <div className="flex justify-between text-[12px] text-cx-muted"><span>Shipping</span><span className={shipCost===0?'text-cx-emerald':'text-cx-text'}>{shipCost===0?'FREE':formatPrice(shipCost)}</span></div>
                  <div className="flex justify-between text-[12px] text-cx-muted"><span>Tax</span><span className="text-cx-text">{formatPrice(tax)}</span></div>
                  <div className="flex justify-between font-700 text-[14px] pt-2 border-t border-cx-border">
                    <span className="text-cx-text">Total</span>
                    <span className="grad-emerald num text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-cx-emerald/5 border border-cx-emerald/15 text-[12px] text-cx-emerald flex items-center gap-2">
                <Shield size={13}/> Secure checkout powered by Stripe
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
