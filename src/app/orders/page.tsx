'use client'
import { useState } from 'react'
import { Search, Package, Loader2, Truck, CheckCircle2, Clock, CreditCard, XCircle, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

const STEPS = [
  { key:'PENDING',           label:'Order Placed',      icon:Clock },
  { key:'PAYMENT_CONFIRMED', label:'Payment Confirmed',  icon:CreditCard },
  { key:'PROCESSING',        label:'Processing',         icon:Package },
  { key:'SHIPPED',           label:'Shipped',            icon:Truck },
  { key:'DELIVERED',         label:'Delivered',          icon:CheckCircle2 },
]
const STEP_ORDER = STEPS.map(s => s.key)

export default function OrdersPage({ searchParams }: { searchParams:{ q?:string } }) {
  const [query,   setQuery]   = useState(searchParams.q || '')
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res  = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error||'Order not found')
      setOrder(data)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }

  const currentStep = order ? STEP_ORDER.indexOf(order.status) : -1

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <Package size={13} className="text-cx-emerald"/><span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Order Tracker</span>
          </div>
          <h1 className="font-display font-900 text-4xl sm:text-5xl text-white mb-3">Track Your Order</h1>
          <p className="text-cx-muted text-[14px]">Enter your order number to get real-time status updates</p>
        </div>

        <form onSubmit={search} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. CX-ABC123-XYZ" className="cx-input w-full pl-11 pr-4 py-4 text-[13px] font-mono"/>
          </div>
          <button type="submit" disabled={loading} className="btn-em px-6 py-4 text-[13px] font-700 rounded-2xl flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin"/> : <Search size={15}/>} Track
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose mb-6">
            <XCircle size={15}/> {error}
          </div>
        )}

        {order && (
          <div className="space-y-5 animate-fade-in">
            {/* Status stepper */}
            <div className="p-6 rounded-3xl cx-card-flat">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[11px] text-cx-muted uppercase tracking-wide">Order Number</p>
                  <p className="font-mono font-700 grad-emerald text-lg">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-cx-muted uppercase tracking-wide">Total</p>
                  <p className="font-700 text-white text-lg">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="relative flex items-start justify-between">
                {/* connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-cx-border z-0">
                  <div className="h-full bg-cx-emerald transition-all duration-700" style={{ width:`${Math.max(0,(currentStep/(STEPS.length-1))*100)}%` }}/>
                </div>

                {STEPS.map((step, i) => {
                  const done   = i < currentStep
                  const active = i === currentStep
                  const Icon   = step.icon
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        done   ? 'bg-cx-emerald border-cx-emerald text-cx-bg' :
                        active ? 'bg-cx-emerald/15 border-cx-emerald text-cx-emerald animate-glow-pulse' :
                        'bg-cx-surface border-cx-border text-cx-muted')}>
                        {done ? <CheckCircle2 size={16}/> : <Icon size={15}/>}
                      </div>
                      <p className={cn('text-[9px] font-600 text-center hidden sm:block max-w-[60px] leading-tight', done||active?'text-cx-text':'text-cx-muted')}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>

              {order.estimatedDelivery && (
                <p className="text-[12px] text-center text-cx-muted mt-6">
                  Estimated delivery: <strong className="text-cx-text">{formatDate(order.estimatedDelivery)}</strong>
                </p>
              )}
            </div>

            {/* Items */}
            <div className="p-5 rounded-2xl cx-card-flat">
              <h3 className="font-600 text-[13px] text-cx-text mb-4">Items in this order</h3>
              <div className="space-y-2.5">
                {order.items?.map((item:any) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-cx-border last:border-0">
                    <div className="flex items-center gap-3">
                      {item.product?.images?.[0] && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-cx-card flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"/>
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-600 text-cx-text">{item.product?.name}</p>
                        <p className="text-[11px] text-cx-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-700 grad-emerald num">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {order.shippingAddress && (
              <div className="p-5 rounded-2xl cx-card-flat">
                <h3 className="font-600 text-[13px] text-cx-text mb-3 flex items-center gap-2"><Truck size={13} className="text-cx-emerald"/> Shipping Address</h3>
                <div className="text-[13px] text-cx-muted space-y-0.5">
                  <p className="text-cx-text font-600">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!order && !loading && !error && (
          <div className="p-8 rounded-3xl cx-card-flat text-center">
            <Package size={40} className="text-cx-muted mx-auto mb-3"/>
            <p className="font-600 text-cx-text mb-1">Enter your order number above</p>
            <p className="text-[13px] text-cx-muted">Find it in your confirmation email</p>
          </div>
        )}
      </div>
    </div>
  )
}
