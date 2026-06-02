'use client'
import { useState } from 'react'
import { Search, Package, Loader2, CheckCircle2, Clock, Truck, MapPin, XCircle, ShoppingBag, ArrowRight, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label:string; color:string; bg:string; border:string; icon:any; step:number }> = {
  PENDING:           { label:'Pending',          color:'text-cx-gold',   bg:'bg-cx-gold/10',   border:'border-cx-gold/25',   icon:Clock,         step:0 },
  PAYMENT_CONFIRMED: { label:'Order Confirmed',  color:'text-cx-emerald',bg:'bg-cx-emerald/10',border:'border-cx-emerald/25',icon:CheckCircle2,  step:1 },
  PROCESSING:        { label:'Processing',       color:'text-cx-sky',    bg:'bg-cx-sky/10',    border:'border-cx-sky/25',    icon:Package,       step:2 },
  SHIPPED:           { label:'Shipped',          color:'text-cx-violet', bg:'bg-cx-violet/10', border:'border-cx-violet/25', icon:Truck,         step:3 },
  OUT_FOR_DELIVERY:  { label:'Out for Delivery', color:'text-cx-gold',   bg:'bg-cx-gold/10',   border:'border-cx-gold/25',   icon:MapPin,        step:4 },
  DELIVERED:         { label:'Delivered',        color:'text-cx-emerald',bg:'bg-cx-emerald/10',border:'border-cx-emerald/25',icon:CheckCircle2,  step:5 },
  CANCELLED:         { label:'Cancelled',        color:'text-cx-rose',   bg:'bg-cx-rose/10',   border:'border-cx-rose/25',   icon:XCircle,       step:-1 },
}

const TRACK_STEPS = [
  { key:'PAYMENT_CONFIRMED', label:'Order Confirmed',  icon:'✅', sub:'Payment verified' },
  { key:'PROCESSING',        label:'Processing',       icon:'⚙️', sub:'Being prepared' },
  { key:'SHIPPED',           label:'Shipped',          icon:'📦', sub:'With carrier' },
  { key:'OUT_FOR_DELIVERY',  label:'Out for Delivery', icon:'🚚', sub:'On the way' },
  { key:'DELIVERED',         label:'Delivered',        icon:'🏠', sub:'At your door' },
]

export default function OrdersPage() {
  const [query,   setQuery]   = useState('')
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const lookup = async (q?: string) => {
    const searchQ = q || query
    if (!searchQ.trim()) { setError('Please enter an order number'); return }
    setLoading(true); setError(''); setOrder(null)
    try {
      const res  = await fetch(`/api/orders/${encodeURIComponent(searchQ.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order not found')
      setOrder(data)
    } catch(e: any) {
      setError(e.message || 'Order not found. Check your order number.')
    }
    setLoading(false)
  }

  const refresh = async () => {
    if (!order) return
    setRefreshing(true)
    await lookup(order.orderNumber)
    setRefreshing(false)
  }

  const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING) : null
  const currentStep = order ? (STATUS_CONFIG[order.status]?.step || 0) : -1

  return (
    <div className="page-enter min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <Package size={13} className="text-cx-emerald"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Order Tracking</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-white mb-3">Track Your Order</h1>
          <p className="text-cx-muted text-[15px]">Enter your order number for real-time delivery updates</p>
        </div>

        {/* Search */}
        <div className="p-6 rounded-3xl cx-card-flat mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookup()}
                placeholder="e.g. CX-M5K2J-AB3"
                className="cx-input w-full pl-10 pr-4 py-3.5 text-[13px] font-mono tracking-wider"/>
            </div>
            <button onClick={() => lookup()} disabled={loading}
              className="btn-em px-7 py-3.5 text-[13px] font-700 rounded-2xl flex items-center gap-2 disabled:opacity-60 whitespace-nowrap">
              {loading ? <Loader2 size={15} className="animate-spin"/> : <Search size={15}/>}
              {loading ? 'Searching…' : 'Track Order'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-[13px] text-cx-rose flex items-center gap-1.5">
              <XCircle size={14}/> {error}
            </p>
          )}
        </div>

        {/* Order Result */}
        {order && cfg && (
          <div className="space-y-5 animate-fade-in">

            {/* Status Header */}
            <div className={`p-5 rounded-3xl ${cfg.bg} border ${cfg.border}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                    <cfg.icon size={22} className={cfg.color}/>
                  </div>
                  <div>
                    <p className="text-[11px] text-cx-muted font-700 uppercase tracking-wider">Order #{order.orderNumber}</p>
                    <p className={`font-display font-800 text-xl ${cfg.color}`}>{cfg.label}</p>
                    {order.carrier && order.trackingNumber && (
                      <p className="text-[11px] text-cx-muted mt-0.5">{order.carrier} · #{order.trackingNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={refresh} disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-600 text-cx-muted hover:text-cx-text bg-cx-surface border border-cx-border hover:border-cx-emerald/20 transition-all">
                    <RefreshCw size={12} className={cn(refreshing && 'animate-spin')}/> Refresh
                  </button>
                  <span className={`badge text-[10px] ${cfg.color.replace('text-','')}`} style={{background:'transparent',border:'1px solid currentColor'}}>
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Stepper */}
            {order.status !== 'CANCELLED' && (
              <div className="p-6 rounded-3xl cx-card-flat">
                <h3 className="font-700 text-[13px] text-cx-text mb-5 flex items-center gap-2">
                  <Truck size={14} className="text-cx-emerald"/> Delivery Progress
                </h3>
                <div className="relative">
                  {/* Line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-cx-border"/>
                  <div className="absolute left-5 top-5 w-0.5 bg-cx-emerald transition-all duration-1000"
                    style={{ height: `${Math.max(0, (currentStep - 1) / (TRACK_STEPS.length - 1) * 100)}%` }}/>
                  <div className="space-y-4">
                    {TRACK_STEPS.map((step, i) => {
                      const done    = currentStep > i + 1
                      const current = order.status === step.key
                      return (
                        <div key={step.key} className="relative flex items-start gap-4 pl-1">
                          <div className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 z-10 transition-all border-2',
                            done    ? 'bg-cx-emerald border-cx-emerald text-cx-bg scale-90' :
                            current ? 'bg-cx-emerald/15 border-cx-emerald text-cx-emerald scale-110 shadow-[0_0_12px_rgba(16,217,136,0.3)]' :
                                      'bg-cx-surface border-cx-border text-cx-muted scale-90 opacity-50'
                          )}>
                            {done ? '✓' : step.icon}
                          </div>
                          <div className={cn('pt-1.5 flex-1', !done && !current && 'opacity-50')}>
                            <div className="flex items-center gap-2">
                              <p className={cn('font-700 text-[13px]', done || current ? 'text-cx-text' : 'text-cx-muted')}>{step.label}</p>
                              {current && (
                                <span className="badge-em text-[9px] py-0.5 px-2 animate-glow-pulse">Current</span>
                              )}
                            </div>
                            <p className="text-[11px] text-cx-muted">{step.sub}</p>
                            {current && order.estimatedDelivery && (
                              <p className="text-[11px] text-cx-gold mt-0.5 font-600">
                                📅 Est: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="p-6 rounded-3xl cx-card-flat">
              <h3 className="font-700 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                <ShoppingBag size={14} className="text-cx-emerald"/> Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-cx-surface border border-cx-border hover:border-cx-emerald/20 transition-all">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cx-card flex-shrink-0 border border-cx-border">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product?.name||''} fill className="object-cover" sizes="56px"
                          onError={(e)=>{(e.target as any).style.display='none'}}/>
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-600 text-[13px] text-cx-text truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-cx-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-700 text-[13px] grad-emerald num">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Price breakdown */}
              <div className="p-5 rounded-3xl cx-card-flat">
                <h3 className="font-700 text-[13px] text-cx-text mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-cx-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-cx-muted">Shipping</span>
                    <span className={order.shipping===0?'text-cx-emerald':''}>{order.shipping===0?'FREE':formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-cx-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
                  <div className="flex justify-between font-700 text-[14px] pt-2 border-t border-cx-border">
                    <span>Total</span><span className="grad-emerald num">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-cx-muted">Payment</span>
                    <span className={order.paymentMethod==='cod'?'text-cx-gold':'text-cx-emerald'}>
                      {order.paymentMethod==='cod'?'💵 Cash on Delivery':'✅ Paid Online'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="p-5 rounded-3xl cx-card-flat">
                  <h3 className="font-700 text-[13px] text-cx-text mb-3">Delivery Address</h3>
                  <div className="space-y-0.5 text-[12px] text-cx-muted">
                    <p className="font-600 text-cx-text">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p className="mt-1 text-cx-text">{order.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-em px-6 py-3 text-[13px] font-700 rounded-2xl flex items-center gap-2">
                Continue Shopping <ArrowRight size={14}/>
              </Link>
              <Link href="/contact" className="btn-outline-em px-6 py-3 text-[13px] rounded-2xl">
                Need Help?
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-cx-surface border border-cx-border flex items-center justify-center mx-auto mb-5">
              <Package size={36} className="text-cx-muted opacity-50"/>
            </div>
            <h3 className="font-700 text-xl text-cx-text mb-2">Enter Your Order Number</h3>
            <p className="text-cx-muted text-[13px] max-w-xs mx-auto mb-6">
              Found in your confirmation email. Format: CX-XXXXX-XXX
            </p>
            <Link href="/account?tab=orders" className="btn-outline-em px-6 py-2.5 text-[13px] rounded-xl inline-flex items-center gap-2">
              View Account Orders <ChevronRight size={13}/>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
