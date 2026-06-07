export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, Loader2, Truck, CheckCircle2, Clock, CreditCard, XCircle, ChevronRight, MapPin, Calendar, Box } from 'lucide-react'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

const STEPS = [
  { key: 'PENDING',           label: 'Order Placed',      icon: Clock,         desc: 'Your order has been received' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: CreditCard,    desc: 'Payment successfully processed' },
  { key: 'PROCESSING',        label: 'Processing',        icon: Package,       desc: 'Preparing your items for dispatch' },
  { key: 'SHIPPED',           label: 'Shipped',           icon: Truck,         desc: 'Your order is on its way' },
  { key: 'DELIVERED',         label: 'Delivered',         icon: CheckCircle2,  desc: 'Order successfully delivered' },
]
const STEP_ORDER = STEPS.map(s => s.key)

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [query,   setQuery]   = useState(searchParams.get('q') || '')
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Auto search if URL has q param
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [])

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res  = await fetch(`/api/orders/${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order not found')
      setOrder(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); doSearch(query) }

  const currentStep = order ? STEP_ORDER.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED' || order?.status === 'REFUNDED'

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <Package size={13} className="text-cx-emerald" />
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Live Order Tracker</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-white mb-3">Track Your Order</h1>
          <p className="text-cx-muted text-[14px]">Enter your order number to get real-time status and delivery details</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="e.g. CX-ABC123-XYZ"
              className="cx-input w-full pl-11 pr-4 py-4 text-[13px] font-mono" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-em px-6 py-4 text-[13px] font-700 rounded-2xl flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Track
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose mb-6">
            <XCircle size={15} /> {error}
          </div>
        )}

        {/* Order result */}
        {order && (
          <div className="space-y-5 animate-fade-in">

            {/* Status progress */}
            <div className="p-6 rounded-3xl cx-card-flat">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <p className="text-[11px] text-cx-muted uppercase tracking-wide mb-0.5">Order Number</p>
                  <p className="font-mono font-700 text-cx-emerald text-lg">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-cx-muted uppercase tracking-wide mb-0.5">Order Total</p>
                  <p className="font-700 text-white text-lg">{formatPrice(order.total)}</p>
                </div>
              </div>

              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-cx-rose/10 border border-cx-rose/20">
                  <XCircle size={20} className="text-cx-rose" />
                  <div>
                    <p className="font-700 text-cx-rose text-[14px]">Order {order.status.charAt(0) + order.status.slice(1).toLowerCase()}</p>
                    <p className="text-cx-muted text-[12px]">This order has been cancelled or refunded</p>
                  </div>
                </div>
              ) : (
                /* Step tracker */
                <div className="relative">
                  {/* Background track */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-cx-border z-0">
                    <div className="h-full bg-cx-emerald transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(0, currentStep / (STEPS.length - 1) * 100)}%` }} />
                  </div>

                  <div className="relative z-10 flex items-start justify-between">
                    {STEPS.map((step, i) => {
                      const done   = i < currentStep
                      const active = i === currentStep
                      const Icon   = step.icon
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                            done   ? 'bg-cx-emerald border-cx-emerald text-cx-bg' :
                            active ? 'bg-cx-emerald/15 border-cx-emerald text-cx-emerald animate-glow-pulse' :
                            'bg-cx-surface border-cx-border text-cx-muted')}>
                            {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                          </div>
                          <div className="text-center">
                            <p className={cn('text-[10px] font-700 hidden sm:block', done || active ? 'text-cx-text' : 'text-cx-muted')}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Current status desc */}
                  {currentStep >= 0 && (
                    <div className="mt-5 p-3 rounded-xl bg-cx-emerald/5 border border-cx-emerald/15 text-center">
                      <p className="text-[13px] font-600 text-cx-emerald">{STEPS[currentStep]?.desc}</p>
                    </div>
                  )}
                </div>
              )}

              {order.estimatedDelivery && !isCancelled && (
                <div className="flex items-center gap-2 mt-4 text-[12px] text-cx-muted">
                  <Calendar size={13} className="text-cx-emerald" />
                  Estimated delivery: <strong className="text-cx-text ml-1">{formatDate(order.estimatedDelivery)}</strong>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="p-5 rounded-2xl cx-card-flat">
              <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                <Box size={14} className="text-cx-emerald" /> Items in this order
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-cx-border last:border-0">
                    {item.product?.images?.[0] && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-cx-card flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-600 text-cx-text truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-cx-muted">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                    </div>
                    <span className="text-[13px] font-700 grad-emerald num flex-shrink-0">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="mt-4 pt-3 border-t border-cx-border space-y-1.5">
                <div className="flex justify-between text-[12px] text-cx-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between text-[12px] text-cx-muted">
                  <span>Shipping</span>
                  <span className={order.shipping === 0 ? 'text-cx-emerald' : ''}>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-cx-muted"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                <div className="flex justify-between font-700 text-[14px] pt-1.5 border-t border-cx-border">
                  <span className="text-cx-text">Total</span>
                  <span className="grad-emerald num">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {order.shippingAddress && (
              <div className="p-5 rounded-2xl cx-card-flat">
                <h3 className="font-600 text-[13px] text-cx-text mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-cx-emerald" /> Delivery Address
                </h3>
                <div className="text-[13px] text-cx-muted space-y-0.5">
                  <p className="text-cx-text font-600">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Order date */}
            <p className="text-[11px] text-cx-muted text-center">
              Order placed on {formatDate(order.createdAt)}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && !error && (
          <div className="p-8 rounded-3xl cx-card-flat text-center">
            <Package size={40} className="text-cx-muted mx-auto mb-4" />
            <p className="font-600 text-cx-text mb-2">Enter your order number above</p>
            <p className="text-[13px] text-cx-muted mb-4">Find it in your confirmation email or in your account under My Orders</p>
            <Link href="/account?tab=orders" className="text-[13px] text-cx-emerald hover:underline">
              View My Orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
