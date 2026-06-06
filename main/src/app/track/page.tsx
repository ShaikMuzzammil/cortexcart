'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Search, Package, Loader2, Truck, CheckCircle2, Clock, CreditCard,
  XCircle, MapPin, Calendar, Box, Copy, Check, ExternalLink, RefreshCw
} from 'lucide-react'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'PENDING',           label: 'Order Placed',      icon: Clock,        desc: 'Your order has been received' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: CreditCard,   desc: 'Payment successfully processed' },
  { key: 'PROCESSING',        label: 'Processing',        icon: Package,      desc: 'Preparing your items for dispatch' },
  { key: 'SHIPPED',           label: 'Shipped',           icon: Truck,        desc: 'Your order is on its way' },
  { key: 'DELIVERED',         label: 'Delivered',         icon: CheckCircle2, desc: 'Order successfully delivered' },
]
const STEP_ORDER = STEPS.map(s => s.key)

export default function TrackPage() {
  const searchParams         = useSearchParams()
  const { data: session }    = useSession()
  const [query,   setQuery]  = useState(searchParams.get('q') || '')
  const [order,   setOrder]  = useState<any>(null)
  const [loading, setLoading]= useState(false)
  const [error,   setError]  = useState('')
  const [copied,  setCopied] = useState(false)
  const [myOrders,setMyOrders]=useState<any[]>([])
  const [loadingMyOrders, setLoadingMyOrders] = useState(false)

  // Auto-search if URL has query param
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [])

  // Load user's orders if logged in
  useEffect(() => {
    if (session?.user) fetchMyOrders()
  }, [session])

  const fetchMyOrders = async () => {
    setLoadingMyOrders(true)
    try {
      const res  = await fetch('/api/user/orders')
      const data = await res.json()
      if (res.ok) setMyOrders(data.orders || [])
    } catch {}
    setLoadingMyOrders(false)
  }

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

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success('Order number copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); doSearch(query) }

  const currentStep = order ? STEP_ORDER.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED' || order?.status === 'REFUNDED'

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <Package size={13} className="text-cx-emerald" />
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Live Order Tracker</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-white mb-3">Track Your Order</h1>
          <p className="text-cx-muted text-[14px]">Enter your order number for real-time status and delivery details</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. CX-ABC123-XYZ"
              className="cx-input w-full pl-11 pr-4 py-4 text-[13px] font-mono" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-em px-6 py-4 text-[13px] font-700 rounded-2xl flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Track
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose mb-6">
            <XCircle size={15} /> {error}
          </div>
        )}

        {/* Order Result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 mb-8">
              {/* Status Card */}
              <div className="p-6 rounded-3xl cx-card-flat">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <p className="text-[11px] text-cx-muted uppercase tracking-wide mb-1">ORDER NUMBER</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-700 text-cx-emerald text-lg">{order.orderNumber}</p>
                      <button onClick={() => copyOrderId(order.orderNumber)}
                        className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-700 transition-all',
                          copied ? 'bg-cx-emerald/20 text-cx-emerald' : 'bg-cx-surface border border-cx-border text-cx-muted hover:text-cx-text'
                        )}>
                        {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-cx-muted uppercase tracking-wide mb-1">ORDER TOTAL</p>
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
                  <div className="relative">
                    {/* Track line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-cx-border z-0">
                      <motion.div className="h-full bg-cx-emerald"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, currentStep / (STEPS.length - 1) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                      {STEPS.map((step, i) => {
                        const done   = i < currentStep
                        const active = i === currentStep
                        const Icon   = step.icon
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                            <motion.div
                              initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                              className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                                done   ? 'bg-cx-emerald border-cx-emerald text-cx-bg' :
                                active ? 'bg-cx-emerald/15 border-cx-emerald text-cx-emerald animate-glow-pulse' :
                                'bg-cx-surface border-cx-border text-cx-muted'
                              )}>
                              {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                            </motion.div>
                            <p className={cn('text-[10px] font-700 text-center hidden sm:block', done || active ? 'text-cx-text' : 'text-cx-muted')}>
                              {step.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
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
                  <Box size={14} className="text-cx-emerald" /> ITEMS ORDERED
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

                {/* Delivery Details + Price */}
                <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-cx-border">
                  {order.shippingAddress && (
                    <div>
                      <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <MapPin size={11} /> DELIVERY DETAILS
                      </p>
                      <div className="text-[12px] text-cx-muted space-y-0.5">
                        <p className="text-cx-text font-600">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.line1}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>{order.shippingAddress.country}</p>
                        {order.estimatedDelivery && (
                          <p className="text-cx-emerald font-600 mt-1">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-2">PRICE BREAKDOWN</p>
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex justify-between text-cx-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                      <div className="flex justify-between text-cx-muted"><span>Shipping</span><span>{order.shipping === 0 ? <span className="text-cx-emerald">FREE</span> : formatPrice(order.shipping)}</span></div>
                      <div className="flex justify-between text-cx-muted"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                      <div className="flex justify-between font-700 text-[14px] pt-1.5 border-t border-cx-border">
                        <span className="text-cx-text">Total</span>
                        <span className="grad-emerald num">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Orders (logged in) */}
        {session?.user && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-700 text-[16px] text-white flex items-center gap-2">
                <Package size={16} className="text-cx-emerald" /> My Recent Orders
              </h2>
              <button onClick={fetchMyOrders} disabled={loadingMyOrders}
                className="flex items-center gap-1.5 text-[12px] text-cx-muted hover:text-cx-text transition-all">
                <RefreshCw size={12} className={loadingMyOrders ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {loadingMyOrders ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 size={20} className="animate-spin text-cx-emerald" />
              </div>
            ) : myOrders.length === 0 ? (
              <div className="p-6 rounded-2xl cx-card-flat text-center">
                <Package size={32} className="text-cx-muted mx-auto mb-3" />
                <p className="text-cx-muted text-[13px]">No orders yet. Start shopping!</p>
                <Link href="/products" className="mt-3 inline-block text-cx-emerald text-[13px] hover:underline">Browse Products →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.slice(0, 5).map((o: any) => (
                  <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl cx-card-flat">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cx-emerald/10 flex items-center justify-center">
                          <Clock size={14} className="text-cx-emerald" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-700 text-cx-emerald text-[13px]">{o.orderNumber}</p>
                            <button onClick={() => copyOrderId(o.orderNumber)}
                              className="p-1 hover:bg-cx-surface rounded text-cx-muted hover:text-cx-text transition-all">
                              <Copy size={10} />
                            </button>
                          </div>
                          <p className="text-[11px] text-cx-muted">{formatDate(o.createdAt)} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn('text-[10px] font-700 px-2 py-0.5 rounded-full', {
                          'bg-cx-muted/20 text-cx-muted':        o.status === 'PENDING',
                          'bg-cx-violet/10 text-cx-violet':      o.status === 'PAYMENT_CONFIRMED',
                          'bg-cx-sky/10 text-cx-sky':            o.status === 'PROCESSING',
                          'bg-cx-gold/10 text-cx-gold':          o.status === 'SHIPPED',
                          'bg-cx-emerald/10 text-cx-emerald':    o.status === 'DELIVERED',
                          'bg-cx-rose/10 text-cx-rose':          o.status === 'CANCELLED',
                        })}>
                          {o.status}
                        </span>
                        <p className="text-[13px] font-700 text-white mt-1">{formatPrice(o.total)}</p>
                      </div>
                    </div>
                    <button onClick={() => { setQuery(o.orderNumber); doSearch(o.orderNumber) }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-cx-emerald/30 text-cx-emerald text-[12px] font-700 hover:bg-cx-emerald/8 transition-all">
                      <ExternalLink size={12} /> Track This Order
                    </button>
                  </motion.div>
                ))}
                {myOrders.length > 5 && (
                  <Link href="/account?tab=orders" className="block text-center text-[12px] text-cx-emerald hover:underline py-2">
                    View all {myOrders.length} orders →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {!order && !loading && !error && !session?.user && (
          <div className="p-8 rounded-3xl cx-card-flat text-center">
            <Package size={40} className="text-cx-muted mx-auto mb-4" />
            <p className="font-600 text-cx-text mb-2">Enter your order number above</p>
            <p className="text-[13px] text-cx-muted mb-4">Find it in your confirmation email or sign in to view all your orders</p>
            <Link href="/auth/login?callbackUrl=/track" className="text-[13px] text-cx-emerald hover:underline">
              Sign in to view orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
