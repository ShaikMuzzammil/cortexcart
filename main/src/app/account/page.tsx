'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWishlistStore } from '@/store/wishlist'
import {
  User, Package, Heart, Settings, LogOut, Copy, Check,
  ExternalLink, Loader2, Clock, Truck, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, MapPin, DollarSign, Zap, Star
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile',   icon: User    },
  { id: 'orders',  label: 'My Orders', icon: Package },
  { id: 'wishlist',label: 'Wishlist',  icon: Heart   },
]

const STATUS_COLOR: Record<string, string> = {
  PENDING:           'bg-gray-500/15 text-gray-400',
  PAYMENT_CONFIRMED: 'bg-violet-500/15 text-violet-300',
  PROCESSING:        'bg-sky-500/15 text-sky-400',
  SHIPPED:           'bg-yellow-500/15 text-yellow-400',
  OUT_FOR_DELIVERY:  'bg-orange-500/15 text-orange-400',
  DELIVERED:         'bg-cx-emerald/15 text-cx-emerald',
  CANCELLED:         'bg-cx-rose/15 text-cx-rose',
  REFUNDED:          'bg-pink-500/15 text-pink-400',
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab]         = useState(searchParams.get('tab') || 'profile')
  const [orders, setOrders]   = useState<any[]>([])
  const [loadingO, setLoadO]  = useState(false)
  const [expanded, setExpanded]= useState<string | null>(null)
  const [copied,   setCopied]  = useState<string | null>(null)
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlistStore()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?callbackUrl=/account')
  }, [status])

  useEffect(() => {
    // Fetch orders as soon as the session is ready, regardless of which tab
    // is active. Previously this only fired when tab === 'orders', so the
    // "Orders" stat card on the Profile tab (the default landing tab) always
    // showed an empty dash — the data was never requested unless the user
    // happened to click into the Orders tab first.
    if (session?.user) fetchOrders()
  }, [session])

  const fetchOrders = async () => {
    setLoadO(true)
    try {
      const res  = await fetch('/api/user/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch {}
    setLoadO(false)
  }

  const copyOrder = (num: string, id: string) => {
    navigator.clipboard.writeText(num)
    setCopied(id)
    toast.success('Copied!', { duration: 1500 })
    setTimeout(() => setCopied(null), 2000)
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-cx-emerald" />
    </div>
  )

  if (!session?.user) return null

  const user = session.user as any

  return (
    <div className="min-h-screen py-8 px-4 pb-24 sm:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cx-emerald/20 to-cx-violet/20 border border-cx-emerald/20 flex items-center justify-center text-xl font-800 text-cx-emerald">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-800 text-2xl text-white">{user.name || 'My Account'}</h1>
            <p className="text-cx-muted text-sm">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="text-[10px] font-700 bg-cx-violet/15 text-cx-violet px-2 py-0.5 rounded-full border border-cx-violet/20">ADMIN</span>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-700 whitespace-nowrap transition-all',
                tab === t.id
                  ? 'bg-cx-emerald/15 text-cx-emerald border border-cx-emerald/25'
                  : 'text-cx-muted hover:text-cx-text hover:bg-cx-surface/60'
              )}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-700 text-cx-rose hover:bg-cx-rose/10 transition-all ml-auto">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="cx-card p-6">
                <h2 className="font-700 text-[16px] text-white mb-4">Account Information</h2>
                <div className="space-y-3 text-[13px]">
                  {[
                    { label: 'Name',       val: user.name  || '—' },
                    { label: 'Email',      val: user.email || '—' },
                    { label: 'Member Since',val: user.id ? new Date().getFullYear().toString() : '—' },
                    { label: 'Account Role',val: user.role || 'CUSTOMER' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-cx-border/50 last:border-0">
                      <span className="text-cx-muted">{row.label}</span>
                      <span className="font-600 text-cx-text">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Package, label: 'Orders',     val: loadingO ? '…' : orders.length,             color: 'text-cx-emerald' },
                  { icon: Heart,   label: 'Wishlist',   val: wishlistItems.length,                       color: 'text-cx-rose'    },
                  { icon: Star,    label: 'Reviews',    val: '0',                                        color: 'text-cx-gold'    },
                ].map(s => (
                  <div key={s.label} className="cx-card p-4 text-center">
                    <s.icon size={20} className={cn('mx-auto mb-2', s.color)} />
                    <p className={cn('font-800 text-xl', s.color)}>{s.val}</p>
                    <p className="text-[11px] text-cx-muted">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="cx-card p-5 flex flex-wrap gap-3">
                <button onClick={() => setTab('orders')}  className="btn-outline-em flex-1 py-2.5 text-[13px] rounded-xl text-center">View Orders</button>
                <button onClick={() => setTab('wishlist')} className="btn-outline-em flex-1 py-2.5 text-[13px] rounded-xl text-center">View Wishlist</button>
              </div>
            </motion.div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {loadingO ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-cx-emerald" />
                </div>
              ) : orders.length === 0 ? (
                <div className="cx-card p-12 text-center">
                  <Package size={40} className="text-cx-muted mx-auto mb-3" />
                  <p className="text-cx-text font-700 mb-2">No orders yet</p>
                  <p className="text-cx-muted text-sm mb-4">Your orders will appear here after checkout</p>
                  <Link href="/products" className="btn-em px-6 py-3 text-sm rounded-xl inline-flex items-center gap-2">
                    <Zap size={14} /> Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o: any) => {
                    const isOpen   = expanded === o.id
                    const custEmail = (o.shippingAddress as any)?.email
                    return (
                      <div key={o.id} className="cx-card overflow-hidden">
                        {/* Row */}
                        <button onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.01] transition-all">
                          <div className="w-9 h-9 rounded-xl bg-cx-emerald/10 flex items-center justify-center flex-shrink-0">
                            <Clock size={15} className="text-cx-emerald" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-700 text-cx-emerald text-[13px]">{o.orderNumber}</span>
                              <button onClick={e => { e.stopPropagation(); copyOrder(o.orderNumber, o.id) }}
                                className="p-1 hover:bg-cx-surface rounded">
                                {copied === o.id ? <Check size={10} className="text-cx-emerald" /> : <Copy size={10} className="text-cx-muted" />}
                              </button>
                            </div>
                            <p className="text-[11px] text-cx-muted truncate">
                              {formatDate(o.createdAt)} · {o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}
                              {o.estimatedDelivery && <span className="text-cx-emerald"> · Est. {formatDate(o.estimatedDelivery)}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={cn('text-[10px] font-700 px-2 py-0.5 rounded-full', STATUS_COLOR[o.status] || 'bg-cx-muted/20 text-cx-muted')}>
                              {o.status}
                            </span>
                            <span className="font-700 text-white text-[14px]">{formatPrice(o.total)}</span>
                            {isOpen ? <ChevronUp size={14} className="text-cx-muted" /> : <ChevronDown size={14} className="text-cx-muted" />}
                          </div>
                        </button>

                        {/* Expanded */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden' }}>
                              <div className="p-4 pt-0 space-y-4">
                                {/* Items */}
                                <div className="space-y-2">
                                  {o.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-cx-border/40 last:border-0">
                                      {item.product?.images?.[0] && (
                                        <img src={item.product.images[0]} alt={item.product?.name}
                                          className="w-11 h-11 rounded-xl object-cover border border-cx-border/50 flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-600 text-cx-text truncate">{item.product?.name}</p>
                                        <p className="text-[11px] text-cx-muted">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                      </div>
                                      <span className="text-[13px] font-700 text-cx-emerald">{formatPrice(item.totalPrice)}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Price + Address grid */}
                                <div className="grid sm:grid-cols-2 gap-4 text-[12px]">
                                  <div>
                                    <p className="text-[10px] font-700 text-cx-muted uppercase tracking-wide mb-2">Delivery Address</p>
                                    {o.shippingAddress ? (
                                      <div className="text-cx-muted space-y-0.5">
                                        <p className="text-cx-text font-600">{o.shippingAddress.firstName} {o.shippingAddress.lastName}</p>
                                        <p>{o.shippingAddress.line1}</p>
                                        <p>{o.shippingAddress.city}, {o.shippingAddress.state}</p>
                                        <p>{o.shippingAddress.country}</p>
                                        {o.estimatedDelivery && (
                                          <p className="text-cx-emerald font-700 mt-1">Est. {formatDate(o.estimatedDelivery)}</p>
                                        )}
                                      </div>
                                    ) : <p className="text-cx-muted">—</p>}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-700 text-cx-muted uppercase tracking-wide mb-2">Price Breakdown</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-cx-muted"><span>Subtotal</span><span>{formatPrice(o.subtotal)}</span></div>
                                      <div className="flex justify-between text-cx-muted"><span>Shipping</span><span>{o.shipping === 0 ? <span className="text-cx-emerald">FREE</span> : formatPrice(o.shipping)}</span></div>
                                      <div className="flex justify-between text-cx-muted"><span>Tax</span><span>{formatPrice(o.tax)}</span></div>
                                      <div className="flex justify-between font-700 text-[13px] pt-1 border-t border-cx-border/50">
                                        <span className="text-cx-text">Total</span>
                                        <span className="text-cx-emerald">{formatPrice(o.total)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Track button */}
                                <Link href={`/track?q=${o.orderNumber}`}
                                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-cx-emerald/30 text-cx-emerald text-[13px] font-700 hover:bg-cx-emerald/8 transition-all">
                                  <ExternalLink size={13} /> Track This Order
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── WISHLIST TAB ── */}
          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {wishlistItems.length === 0 ? (
                <div className="cx-card p-12 text-center">
                  <Heart size={40} className="text-cx-muted mx-auto mb-3" />
                  <p className="text-cx-text font-700 mb-2">Your wishlist is empty</p>
                  <p className="text-cx-muted text-sm mb-4">Save products you love by clicking the heart icon</p>
                  <Link href="/products" className="btn-em px-6 py-3 text-sm rounded-xl inline-flex items-center gap-2">
                    <Zap size={14} /> Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item: any) => (
                    <div key={item.id} className="cx-card p-4 flex gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-cx-border/50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[13px] text-cx-text truncate">{item.name}</p>
                        <p className="text-cx-emerald font-700 text-[14px] mt-0.5">{formatPrice(item.price)}</p>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/products/${item.slug || item.id}`}
                            className="flex-1 text-center py-1.5 rounded-lg bg-cx-emerald/10 text-cx-emerald text-[11px] font-700 hover:bg-cx-emerald/20 transition-all">
                            View
                          </Link>
                          <button onClick={() => toggleWishlist(item)}
                            className="flex-1 text-center py-1.5 rounded-lg bg-cx-rose/10 text-cx-rose text-[11px] font-700 hover:bg-cx-rose/20 transition-all">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
