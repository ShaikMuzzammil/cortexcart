'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { User, Package, Heart, Settings, LogOut, ShoppingCart, Star, Loader2, Save, Trash2, ExternalLink, Bell, Shield, CreditCard, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  DELIVERED:         'text-cx-emerald',
  SHIPPED:           'text-cx-violet',
  OUT_FOR_DELIVERY:  'text-cx-gold',
  PAYMENT_CONFIRMED: 'text-cx-sky',
  PROCESSING:        'text-cx-sky',
  CANCELLED:         'text-cx-rose',
  PENDING:           'text-cx-muted',
}

export default function AccountPage() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const initTab = searchParams.get('tab') || 'overview'
  const [tab,     setTab]     = useState(initTab)
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [name,    setName]    = useState(session?.user?.name || '')
  const [email,   setEmail]   = useState(session?.user?.email || '')
  const wishItems  = useWishlistStore(s => s.items)
  const wishToggle = useWishlistStore(s => s.toggle)
  const addItem    = useCartStore(s => s.addItem)
  const setOpen    = useCartStore(s => s.setCartOpen)

  useEffect(() => { if (session?.user?.name) setName(session.user.name) }, [session])

  useEffect(() => {
    if (tab === 'orders' && session) {
      setLoading(true)
      fetch('/api/user/orders')
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [tab, session])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-cx-emerald" />
    </div>
  )

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-cx-surface border border-cx-border flex items-center justify-center mx-auto mb-5">
          <User size={32} className="text-cx-muted opacity-40" />
        </div>
        <h2 className="font-display font-700 text-2xl text-white mb-3">Sign in Required</h2>
        <p className="text-cx-muted text-[14px] mb-6">Access your orders, wishlist, and account settings.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login"    className="btn-em px-6 py-3 text-[13px] font-700 rounded-xl">Sign In</Link>
          <Link href="/auth/register" className="btn-outline-em px-6 py-3 text-[13px] rounded-xl">Register</Link>
        </div>
      </div>
    </div>
  )

  const TABS = [
    { id:'overview',  label:'Overview',  icon:User },
    { id:'orders',    label:'My Orders', icon:Package },
    { id:'wishlist',  label:'Wishlist',  icon:Heart,   badge: wishItems.length },
    { id:'settings',  label:'Settings',  icon:Settings },
  ]

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed')
      await update({ name })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
    setSaving(false)
  }

  const moveWishToCart = (item: any) => {
    addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, originalPrice: item.price, image: item.image, stock: 99 })
    wishToggle(item)
    setOpen(true)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <div className="page-enter min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8 p-6 rounded-3xl cx-card-flat">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center text-2xl font-800 text-white flex-shrink-0">
            {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-800 text-xl text-white truncate">{session.user?.name || 'User'}</h1>
            <p className="text-[12px] text-cx-muted truncate">{session.user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-em text-[10px]">Active Account</span>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin" className="badge-gold text-[10px]">Admin</Link>
              )}
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] text-cx-rose border border-cx-rose/25 hover:bg-cx-rose/10 transition-all">
            <LogOut size={13}/> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-600 transition-all',
                  tab === t.id ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                <t.icon size={15}/>
                {t.label}
                {(t as any).badge > 0 && (
                  <span className="ml-auto badge-rose text-[9px] py-0.5">{(t as any).badge}</span>
                )}
              </button>
            ))}
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-600 text-cx-rose hover:bg-cx-rose/5 transition-all sm:hidden">
              <LogOut size={15}/> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* ── OVERVIEW ─────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label:'Orders',   value: orders.length || '—',  icon:Package,   color:'text-cx-emerald', action:() => setTab('orders') },
                    { label:'Wishlist', value: wishItems.length,       icon:Heart,     color:'text-cx-rose',    action:() => setTab('wishlist') },
                    { label:'Settings', value:'Profile',               icon:Settings,  color:'text-cx-violet',  action:() => setTab('settings') },
                  ].map(s => (
                    <button key={s.label} onClick={s.action}
                      className="p-5 rounded-2xl cx-card-flat text-left hover:-translate-y-1 transition-all duration-300">
                      <s.icon size={20} className={cn(s.color, 'mb-3')}/>
                      <p className="font-800 text-2xl text-white">{s.value}</p>
                      <p className="text-[12px] text-cx-muted">{s.label}</p>
                    </button>
                  ))}
                </div>

                <div className="p-5 rounded-2xl cx-card-flat">
                  <p className="font-700 text-[13px] text-cx-text mb-3">Account Details</p>
                  <div className="space-y-3">
                    {[
                      { label:'Name',  value: session.user?.name || '—' },
                      { label:'Email', value: session.user?.email || '—' },
                      { label:'Role',  value: (session.user as any)?.role || 'CUSTOMER' },
                    ].map(d => (
                      <div key={d.label} className="flex justify-between py-2 border-b border-cx-border/40 text-[13px]">
                        <span className="text-cx-muted">{d.label}</span>
                        <span className="font-600 text-cx-text">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS ───────────────────────────────────────────── */}
            {tab === 'orders' && (
              <div className="animate-fade-in">
                <h2 className="font-700 text-[15px] text-white mb-5 flex items-center gap-2">
                  <Package size={15} className="text-cx-emerald"/> My Orders
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-cx-emerald"/>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 rounded-3xl cx-card-flat">
                    <Package size={36} className="text-cx-muted opacity-30 mx-auto mb-4"/>
                    <h3 className="font-700 text-[15px] text-cx-text mb-2">No orders yet</h3>
                    <p className="text-cx-muted text-[13px] mb-5">Your orders will appear here after you shop.</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl inline-flex items-center gap-2">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const sc = STATUS_COLORS[order.status] || 'text-cx-muted'
                      return (
                        <div key={order.id} className="p-5 rounded-2xl cx-card-flat hover:border-cx-emerald/15 transition-all">
                          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                            <div>
                              <span className="font-mono text-[12px] text-cx-emerald font-700">#{order.orderNumber}</span>
                              <p className="text-[11px] text-cx-muted mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle:'medium' })}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-700 text-[13px] ${sc}`}>{order.status?.replace(/_/g,' ')}</p>
                              <p className="font-800 text-[16px] grad-emerald num mt-0.5">{formatPrice(order.total)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap mb-3">
                            {order.items?.slice(0,3).map((item: any, i: number) => (
                              <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden bg-cx-surface border border-cx-border flex-shrink-0">
                                {item.product?.images?.[0]
                                  ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"/>
                                  : <div className="flex items-center justify-center h-full text-sm">📦</div>}
                              </div>
                            ))}
                            {(order.items?.length||0) > 3 && (
                              <div className="w-10 h-10 rounded-lg bg-cx-surface border border-cx-border flex items-center justify-center text-[10px] text-cx-muted">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <Link href={`/orders?q=${order.orderNumber}`}
                            className="text-[12px] text-cx-emerald hover:underline flex items-center gap-1">
                            Track Order <ExternalLink size={11}/>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST ─────────────────────────────────────────── */}
            {tab === 'wishlist' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-700 text-[15px] text-white flex items-center gap-2">
                    <Heart size={15} className="text-cx-rose"/> Wishlist ({wishItems.length})
                  </h2>
                  {wishItems.length > 0 && (
                    <button onClick={() => {
                      wishItems.forEach(i => { addItem({ id:i.id, slug:i.slug, name:i.name, price:i.price, originalPrice:i.price, image:i.image, stock:99 }); wishToggle(i) })
                      setOpen(true)
                      toast.success('All items moved to cart!')
                    }} className="btn-em px-4 py-2 text-[12px] rounded-xl flex items-center gap-2">
                      <ShoppingCart size={12}/> Move All to Cart
                    </button>
                  )}
                </div>
                {wishItems.length === 0 ? (
                  <div className="text-center py-16 rounded-3xl cx-card-flat">
                    <Heart size={36} className="text-cx-muted opacity-30 mx-auto mb-4"/>
                    <h3 className="font-700 text-[15px] text-cx-text mb-2">Wishlist is empty</h3>
                    <p className="text-cx-muted text-[13px] mb-5">Save products you love for later.</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl inline-flex items-center gap-2">
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishItems.map(item => (
                      <div key={item.id} className="flex gap-3 p-4 rounded-2xl cx-card-flat hover:border-cx-emerald/15 transition-all">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cx-surface border border-cx-border flex-shrink-0">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                            : <div className="flex items-center justify-center h-full text-xl">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-600 text-[13px] text-cx-text truncate">{item.name}</p>
                          <p className="font-800 text-[14px] grad-emerald num">{formatPrice(item.price)}</p>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => moveWishToCart(item)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20 hover:bg-cx-emerald/20 transition-all">
                              <ShoppingCart size={10}/> Add to Cart
                            </button>
                            <button onClick={() => wishToggle(item)}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-cx-rose hover:bg-cx-rose/10 transition-all">
                              <Trash2 size={10}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SETTINGS ─────────────────────────────────────────── */}
            {tab === 'settings' && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-700 text-[15px] text-white flex items-center gap-2">
                  <Settings size={15} className="text-cx-violet"/> Account Settings
                </h2>

                {/* Profile */}
                <div className="p-6 rounded-2xl cx-card-flat">
                  <p className="font-700 text-[13px] text-cx-text mb-4">Profile Information</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Display Name</label>
                      <input value={name} onChange={e => setName(e.target.value)}
                        className="cx-input w-full px-4 py-3 text-[13px]" placeholder="Your name"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Email</label>
                      <input value={email} readOnly className="cx-input w-full px-4 py-3 text-[13px] opacity-50 cursor-not-allowed" />
                      <p className="text-[11px] text-cx-muted mt-1">Email cannot be changed here.</p>
                    </div>
                    <button onClick={saveProfile} disabled={saving}
                      className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl flex items-center gap-2 disabled:opacity-60">
                      {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Security */}
                <div className="p-6 rounded-2xl cx-card-flat">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={15} className="text-cx-emerald"/>
                    <p className="font-700 text-[13px] text-cx-text">Security</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon:CheckCircle2, label:'Password protected',      sub:'Your account is secured with a password', color:'text-cx-emerald' },
                      { icon:Shield,       label:'SSL encrypted sessions',  sub:'All data transmitted securely',           color:'text-cx-emerald' },
                      { icon:Bell,         label:'Email notifications',     sub:'Order updates sent to '+session.user?.email, color:'text-cx-sky' },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-cx-surface border border-cx-border">
                        <item.icon size={16} className={cn(item.color, 'mt-0.5 flex-shrink-0')}/>
                        <div>
                          <p className="font-600 text-[13px] text-cx-text">{item.label}</p>
                          <p className="text-[11px] text-cx-muted">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="p-6 rounded-2xl bg-cx-rose/5 border border-cx-rose/20">
                  <p className="font-700 text-[13px] text-cx-rose mb-3">Danger Zone</p>
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] text-cx-rose border border-cx-rose/25 hover:bg-cx-rose/10 transition-all">
                    <LogOut size={14}/> Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
