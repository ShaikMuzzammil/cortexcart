'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  User, Package, Heart, Settings, LogOut, Star, Zap, Gift,
  Bell, Lock, Save, Loader2, ChevronRight, Shield, Edit3,
  CheckCircle2, Clock, Truck, CreditCard, XCircle, Eye
} from 'lucide-react'
import { formatPrice, formatDate, initials, cn } from '@/lib/utils'
import { useWishlistStore } from '@/store/wishlist'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: User },
  { id: 'orders',    label: 'My Orders', icon: Package },
  { id: 'wishlist',  label: 'Wishlist',  icon: Heart },
  { id: 'settings',  label: 'Settings',  icon: Settings },
]

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING:           'bg-cx-muted/20 text-cx-muted',
  PAYMENT_CONFIRMED: 'bg-cx-violet/10 text-cx-violet',
  PROCESSING:        'bg-cx-sky/10 text-cx-sky',
  SHIPPED:           'bg-cx-gold/10 text-cx-gold',
  DELIVERED:         'bg-cx-emerald/10 text-cx-emerald',
  CANCELLED:         'bg-cx-rose/10 text-cx-rose',
  REFUNDED:          'bg-orange-500/10 text-orange-400',
}

const ORDER_STATUS_ICON: Record<string, any> = {
  PENDING: Clock, PAYMENT_CONFIRMED: CreditCard, PROCESSING: Zap,
  SHIPPED: Truck, DELIVERED: CheckCircle2, CANCELLED: XCircle, REFUNDED: XCircle,
}

export default function AccountPage() {
  const { data: session, status, update } = useSession()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [tab,     setTab]     = useState(searchParams.get('tab') || 'overview')
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [name,    setName]    = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [notifs, setNotifs]   = useState({
    orders: true, priceDrops: true, recommendations: false, marketing: false,
  })
  const wishlist = useWishlistStore(s => s.items)
  const removeFromWishlist = useWishlistStore(s => s.toggle)

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to view your account')
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    if (tab === 'orders' && session) fetchOrders()
  }, [tab, session])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/user/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
      else toast.error('Failed to load orders')
    } catch {
      toast.error('Could not load orders')
    }
    setLoading(false)
  }, [])

  const saveSettings = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await update({ name })
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to save changes')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    toast('Signing out…')
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-cx-emerald" />
    </div>
  )
  if (!session) return null

  const user = session.user as any

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Profile card */}
            <div className="p-5 rounded-2xl cx-card-flat text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center mx-auto mb-3 text-2xl font-700 text-white shadow-cx-vio">
                {initials(user.name || user.email || 'U')}
              </div>
              <h2 className="font-display font-700 text-white text-[15px]">{user.name || 'User'}</h2>
              <p className="text-[11px] text-cx-muted mt-0.5 truncate">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {user.role === 'ADMIN' && <span className="badge-rose text-[10px]">Admin</span>}
                <span className="badge-em text-[10px]">Member</span>
              </div>
            </div>

            {/* Tab nav */}
            <nav className="cx-card-flat overflow-hidden">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 text-[13px] font-600 transition-colors border-b border-cx-border last:border-0',
                    tab === t.id ? 'bg-cx-emerald/8 text-cx-emerald' : 'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
                  <t.icon size={14} /> {t.label}
                  {t.id === 'orders' && orders.length > 0 && (
                    <span className="ml-auto badge-em text-[10px]">{orders.length}</span>
                  )}
                  {t.id === 'wishlist' && wishlist.length > 0 && (
                    <span className="ml-auto badge-rose text-[10px]">{wishlist.length}</span>
                  )}
                </button>
              ))}
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-600 text-cx-rose hover:bg-cx-rose/8 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </nav>

            {user.role === 'ADMIN' && (
              <Link href="/admin"
                className="flex items-center gap-3 p-4 rounded-2xl bg-cx-gold/8 border border-cx-gold/20 text-cx-gold text-[13px] font-600 hover:bg-cx-gold/12 transition-colors">
                <Shield size={14} /> Admin Dashboard <ChevronRight size={13} className="ml-auto" />
              </Link>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3 space-y-5">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display font-700 text-2xl text-white">Account Overview</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Orders', value: loading ? '…' : orders.length, icon: Package, color: 'text-cx-emerald', bg: 'bg-cx-emerald/8', border: 'border-cx-emerald/20', action: () => setTab('orders') },
                    { label: 'Wishlist Items', value: wishlist.length, icon: Heart, color: 'text-cx-rose', bg: 'bg-cx-rose/8', border: 'border-cx-rose/20', action: () => setTab('wishlist') },
                    { label: 'Account Status', value: 'Active', icon: CheckCircle2, color: 'text-cx-gold', bg: 'bg-cx-gold/8', border: 'border-cx-gold/20', action: () => setTab('settings') },
                  ].map(s => (
                    <button key={s.label} onClick={s.action}
                      className={`p-5 rounded-2xl ${s.bg} border ${s.border} text-left hover:-translate-y-0.5 transition-all`}>
                      <s.icon size={20} className={`${s.color} mb-2`} />
                      <div className={`font-display font-800 text-2xl ${s.color}`}>{s.value}</div>
                      <div className="text-[11px] text-cx-muted mt-0.5">{s.label}</div>
                    </button>
                  ))}
                </div>

                <div className="p-5 rounded-2xl cx-card-flat">
                  <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                    <User size={14} className="text-cx-emerald" /> Account Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Full Name', user.name || '—'],
                      ['Email',     user.email || '—'],
                      ['Role',      user.role || 'Customer'],
                      ['Status',    'Active & Verified'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-[10px] text-cx-muted uppercase tracking-wide">{l}</p>
                        <p className="text-[13px] font-600 text-cx-text mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent orders preview */}
                {orders.length > 0 && (
                  <div className="p-5 rounded-2xl cx-card-flat">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-600 text-[13px] text-cx-text">Recent Orders</h3>
                      <button onClick={() => setTab('orders')} className="text-[11px] text-cx-emerald hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {orders.slice(0, 3).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-cx-bg border border-cx-border">
                          <div>
                            <p className="text-[11px] font-700 text-cx-text font-mono">{o.orderNumber}</p>
                            <p className="text-[10px] text-cx-muted">{formatDate(o.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-700 text-[12px] grad-emerald num">{formatPrice(o.total)}</span>
                            <span className={cn('text-[9px] font-700 px-2 py-0.5 rounded-lg', ORDER_STATUS_COLOR[o.status] || 'bg-cx-border text-cx-muted')}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-700 text-2xl text-white">My Orders</h2>
                  <button onClick={fetchOrders} className="text-[12px] text-cx-emerald hover:underline flex items-center gap-1">
                    <Zap size={12} /> Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-cx-emerald" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 rounded-2xl cx-card-flat text-center">
                    <Package size={40} className="text-cx-muted mx-auto mb-3" />
                    <p className="font-600 text-cx-text mb-1">No orders yet</p>
                    <p className="text-[13px] text-cx-muted mb-5">Your order history will appear here after your first purchase</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl inline-flex items-center gap-2">
                      Start Shopping <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : orders.map(order => {
                  const StatusIcon = ORDER_STATUS_ICON[order.status] || Package
                  const isExpanded = expandedOrder === order.id
                  return (
                    <div key={order.id} className="rounded-2xl cx-card-flat overflow-hidden">
                      {/* Order header */}
                      <div className="flex items-start justify-between p-5">
                        <div className="flex items-start gap-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', ORDER_STATUS_COLOR[order.status] || 'bg-cx-border text-cx-muted')}>
                            <StatusIcon size={16} />
                          </div>
                          <div>
                            <p className="font-700 text-[13px] text-cx-text font-mono">{order.orderNumber}</p>
                            <p className="text-[11px] text-cx-muted">{formatDate(order.createdAt)} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
                            <span className={cn('text-[10px] font-700 px-2 py-0.5 rounded-lg mt-1 inline-block', ORDER_STATUS_COLOR[order.status])}>{order.status.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-800 text-[16px] grad-emerald num">{formatPrice(order.total)}</p>
                          <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="text-[11px] text-cx-emerald hover:underline mt-1 flex items-center gap-1 ml-auto">
                            <Eye size={11} /> {isExpanded ? 'Hide' : 'View'} details
                          </button>
                        </div>
                      </div>

                      {/* Expanded order details */}
                      {isExpanded && (
                        <div className="border-t border-cx-border p-5 space-y-4 animate-slide-down">
                          {/* Items */}
                          <div>
                            <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-3">Items Ordered</p>
                            <div className="space-y-2">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-cx-bg border border-cx-border">
                                  {item.product?.images?.[0] && (
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-cx-card flex-shrink-0">
                                      <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-600 text-cx-text truncate">{item.product?.name}</p>
                                    <p className="text-[11px] text-cx-muted">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                  </div>
                                  <span className="font-700 text-[13px] grad-emerald num flex-shrink-0">{formatPrice(item.totalPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order summary */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Delivery Details</p>
                              <div className="p-3 rounded-xl bg-cx-bg border border-cx-border text-[12px] space-y-1">
                                {order.shippingAddress && (
                                  <>
                                    <p className="font-600 text-cx-text">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                    <p className="text-cx-muted">{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.line2 && <p className="text-cx-muted">{order.shippingAddress.line2}</p>}
                                    <p className="text-cx-muted">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                    <p className="text-cx-muted">{order.shippingAddress.country}</p>
                                  </>
                                )}
                                {order.estimatedDelivery && (
                                  <p className="text-cx-emerald font-600 pt-1">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Price Breakdown</p>
                              <div className="p-3 rounded-xl bg-cx-bg border border-cx-border text-[12px] space-y-1.5">
                                <div className="flex justify-between text-cx-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                                <div className="flex justify-between text-cx-muted"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span></div>
                                <div className="flex justify-between text-cx-muted"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                                <div className="flex justify-between font-700 text-cx-text pt-1 border-t border-cx-border"><span>Total</span><span className="grad-emerald">{formatPrice(order.total)}</span></div>
                              </div>
                            </div>
                          </div>

                          {/* Track button */}
                          <Link href={`/orders?q=${order.orderNumber}`}
                            className="btn-outline-em w-full py-2.5 text-[12px] font-600 rounded-xl flex items-center justify-center gap-2">
                            <Truck size={13} /> Track This Order
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── WISHLIST ── */}
            {tab === 'wishlist' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="font-display font-700 text-2xl text-white">My Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <div className="p-8 rounded-2xl cx-card-flat text-center">
                    <Heart size={40} className="text-cx-muted mx-auto mb-3" />
                    <p className="font-600 text-cx-text mb-1">Your wishlist is empty</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl inline-flex items-center gap-2 mt-4">
                      Browse Products <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-4 rounded-2xl cx-card-flat hover:border-cx-emerald/20 transition-all">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cx-card flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-600 text-[13px] text-cx-text truncate">{item.name}</p>
                          <p className="grad-emerald font-800 text-[14px] num mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href={`/products/${item.slug}`} className="btn-outline-em px-3 py-1.5 text-[11px] rounded-lg">View</Link>
                          <button onClick={() => { removeFromWishlist(item); toast('Removed from wishlist') }}
                            className="px-3 py-1.5 text-[11px] rounded-lg border border-cx-rose/20 text-cx-rose hover:bg-cx-rose/10 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div className="animate-fade-in space-y-5">
                <h2 className="font-display font-700 text-2xl text-white">Account Settings</h2>

                {/* Profile */}
                <div className="p-5 rounded-2xl cx-card-flat space-y-4">
                  <h3 className="font-600 text-[13px] text-cx-text flex items-center gap-2">
                    <Edit3 size={14} className="text-cx-emerald" /> Edit Profile
                  </h3>
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Display Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      className="cx-input w-full px-4 py-3 text-[13px]"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Email Address</label>
                    <input value={user.email || ''} disabled
                      className="cx-input w-full px-4 py-3 text-[13px] opacity-60 cursor-not-allowed" />
                    <p className="text-[11px] text-cx-muted mt-1">Contact support to change your email address</p>
                  </div>
                  <button onClick={saveSettings} disabled={saving}
                    className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : <><Save size={13} />Save Changes</>}
                  </button>
                </div>

                {/* Notifications */}
                <div className="p-5 rounded-2xl cx-card-flat">
                  <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                    <Bell size={14} className="text-cx-violet" /> Notification Preferences
                  </h3>
                  {[
                    { key: 'orders',          label: 'Order Updates',        desc: 'Shipping and delivery status notifications' },
                    { key: 'priceDrops',      label: 'Price Drop Alerts',    desc: 'When wishlist items go on sale' },
                    { key: 'recommendations', label: 'AI Recommendations',   desc: 'Personalised weekly product digest' },
                    { key: 'marketing',       label: 'Promotions & Deals',   desc: 'Exclusive offers and new launches' },
                  ].map(pref => (
                    <div key={pref.key} className="flex items-center justify-between py-3 border-b border-cx-border last:border-0">
                      <div>
                        <p className="text-[13px] font-600 text-cx-text">{pref.label}</p>
                        <p className="text-[11px] text-cx-muted">{pref.desc}</p>
                      </div>
                      <button onClick={() => setNotifs(n => ({ ...n, [pref.key]: !n[pref.key as keyof typeof n] }))}
                        className={cn('w-11 h-6 rounded-full transition-colors relative flex-shrink-0', notifs[pref.key as keyof typeof notifs] ? 'bg-cx-emerald' : 'bg-cx-border')}>
                        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', notifs[pref.key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0.5')} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Security */}
                <div className="p-5 rounded-2xl cx-card-flat">
                  <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2">
                    <Lock size={14} className="text-cx-sky" /> Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cx-bg border border-cx-border">
                      <div>
                        <p className="text-[13px] font-600 text-cx-text">Password</p>
                        <p className="text-[11px] text-cx-muted">Last changed: recently</p>
                      </div>
                      <button className="btn-outline-em px-4 py-1.5 text-[12px] rounded-lg">Change</button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cx-bg border border-cx-border">
                      <div>
                        <p className="text-[13px] font-600 text-cx-text">Active Sessions</p>
                        <p className="text-[11px] text-cx-muted">Manage where you're signed in</p>
                      </div>
                      <button onClick={handleSignOut} className="px-4 py-1.5 text-[12px] rounded-lg border border-cx-rose/20 text-cx-rose hover:bg-cx-rose/10 transition-colors">
                        Sign Out All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
