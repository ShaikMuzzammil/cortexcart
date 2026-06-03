'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Check, Truck, Clock, MapPin, AlertCircle, Loader2, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

const STATUS_STEPS = [
  { key:'PENDING',           label:'Order Placed',      icon:'📦', desc:'Your order has been received' },
  { key:'PROCESSING',        label:'Processing',        icon:'⚡', desc:'Your items are being prepared' },
  { key:'SHIPPED',           label:'Shipped',           icon:'🚚', desc:'On its way to you' },
  { key:'OUT_FOR_DELIVERY',  label:'Out for Delivery',  icon:'🏠', desc:'Your driver is nearby' },
  { key:'DELIVERED',         label:'Delivered',         icon:'✅', desc:'Package delivered successfully' },
]
const STATUS_ORDER = ['PENDING','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED']

function formatPrice(n: number) { return `$${n.toFixed(2)}` }

export default function TrackPage() {
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(false)
  const [order,   setOrder]   = useState<any>(null)
  const [error,   setError]   = useState('')

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res  = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrder(data)
    } catch (err: any) { setError(err.message || 'Order not found') }
    setLoading(false)
  }

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1

  return (
    <div className="min-h-screen py-12 px-4 pb-24 sm:pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/20 flex items-center justify-center mx-auto mb-5">
            <Package size={26} className="text-cx-emerald" />
          </div>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Track Your Order</h1>
          <p className="text-cx-muted text-[14px]">Enter your order number for real-time updates</p>
        </div>

        <form onSubmit={track} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cx-muted" />
            <input value={query} onChange={e=>setQuery(e.target.value.toUpperCase())}
              placeholder="e.g. CC-ABC12345"
              className="w-full bg-cx-surface border border-cx-border rounded-2xl pl-11 pr-4 py-4 text-[14px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all font-mono tracking-wide" />
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="btn-em px-6 py-4 rounded-2xl text-[14px] font-800 flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <><Search size={15}/> Track</>}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className="flex items-center gap-3 p-4 bg-cx-rose/10 border border-cx-rose/20 rounded-2xl mb-6">
              <AlertCircle size={18} className="text-cx-rose flex-shrink-0"/>
              <p className="text-[14px] text-cx-rose">{error}. Please check your order number.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {order && (
            <motion.div key="order" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <div className="cx-card p-6 mb-5">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[11px] text-cx-muted uppercase tracking-wide mb-1">Order Number</p>
                    <p className="font-display font-800 text-xl text-cx-emerald font-mono">#{order.orderNumber?.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[12px] font-700 ${
                    order.status==='DELIVERED'?'bg-cx-emerald/15 text-cx-emerald border border-cx-emerald/30':
                    order.status==='SHIPPED'?'bg-cx-sky/15 text-cx-sky border border-cx-sky/30':
                    order.status==='CANCELLED'?'bg-cx-rose/15 text-cx-rose border border-cx-rose/30':
                    'bg-cx-gold/15 text-cx-gold border border-cx-gold/30'}`}>
                    {order.status?.replace(/_/g,' ')}
                  </span>
                </div>

                <div className="space-y-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const done    = idx <= currentIdx
                    const current = idx === currentIdx
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all text-[16px] ${
                            done?'bg-cx-emerald border-cx-emerald':'bg-cx-surface border-cx-border'
                          } ${current?'ring-4 ring-cx-emerald/20':''}`}>
                            {done ? '✓' : step.icon}
                          </div>
                          {idx < STATUS_STEPS.length-1 && (
                            <div className={`w-0.5 h-6 my-1 rounded-full ${done?'bg-cx-emerald':'bg-cx-border'}`}/>
                          )}
                        </div>
                        <div className="pb-4 flex-1">
                          <p className={`text-[14px] font-700 ${done?'text-white':'text-cx-muted'}`}>{step.label}</p>
                          <p className={`text-[12px] mt-0.5 ${current?'text-cx-emerald':done?'text-cx-dim':'text-cx-muted/50'}`}>{step.desc}</p>
                          {current && order.trackingNumber && step.key==='SHIPPED' && (
                            <p className="text-[11px] text-cx-sky mt-1 font-mono">Tracking: {order.trackingNumber} · {order.carrier}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="cx-card p-5 mb-5">
                  <h3 className="font-700 text-[15px] text-white mb-4">Items in This Order</h3>
                  <div className="space-y-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-cx-surface border border-cx-border flex-shrink-0">
                          {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-600 text-cx-text truncate">{item.product?.name}</p>
                          <p className="text-[11px] text-cx-muted">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[13px] font-700 text-cx-emerald">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-cx-border mt-4 pt-4 flex justify-between text-[14px] font-800">
                    <span className="text-cx-muted">Total</span>
                    <span className="text-cx-emerald">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="flex items-center gap-3 p-4 bg-cx-emerald/8 border border-cx-emerald/20 rounded-2xl mb-5">
                  <Clock size={16} className="text-cx-emerald flex-shrink-0"/>
                  <div>
                    <p className="text-[12px] text-cx-emerald font-700">Estimated Delivery</p>
                    <p className="text-[14px] text-white font-800">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/orders" className="flex-1 btn-outline-em py-3 text-[14px] rounded-xl flex items-center justify-center gap-2">All Orders</Link>
                <Link href="/products" className="flex-1 btn-em py-3 text-[14px] rounded-xl flex items-center justify-center gap-2">
                  Continue Shopping <ArrowRight size={14}/>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!order && !error && (
          <div className="text-center text-cx-muted text-[13px] space-y-2">
            <p>📧 Your order number is in your confirmation email</p>
            <p>Signed in? <Link href="/orders" className="text-cx-emerald hover:underline">View your orders →</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
