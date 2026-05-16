'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, Settings, LogOut, Star, Zap, Gift, Bell, Lock, Save, Loader2, ChevronRight, TrendingUp, Shield } from 'lucide-react'
import { formatPrice, formatDate, initials, cn } from '@/lib/utils'
import { useWishlistStore } from '@/store/wishlist'

const TABS = [
  { id:'overview',  label:'Overview',  icon:User },
  { id:'orders',    label:'Orders',    icon:Package },
  { id:'wishlist',  label:'Wishlist',  icon:Heart },
  { id:'settings',  label:'Settings',  icon:Settings },
]

export default function AccountPage({ searchParams }: { searchParams:{ tab?:string } }) {
  const { data:session, status } = useSession()
  const router = useRouter()
  const [tab,     setTab]     = useState(searchParams.tab || 'overview')
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [name,    setName]    = useState('')
  const [notifs,  setNotifs]  = useState({ orders:true, priceDrops:true, recommendations:false, marketing:false })
  const wishlist = useWishlistStore(s => s.items)

  useEffect(() => {
    if (status==='unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    if (tab==='orders' && session) fetchOrders()
  }, [tab, session])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/user/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch {}
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    await fetch('/api/user', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name }) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (status==='loading') return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-cx-emerald" />
    </div>
  )
  if (!session) return null

  const user = session.user as any

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="p-5 rounded-2xl cx-card-flat text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white">
                {initials(user.name || user.email || 'U')}
              </div>
              <h2 className="font-display font-700 text-white text-[15px]">{user.name || 'User'}</h2>
              <p className="text-[11px] text-cx-muted mt-0.5 truncate">{user.email}</p>
              {user.role==='ADMIN' && <span className="badge-rose text-[10px] mt-2 inline-block">Admin</span>}
            </div>

            <nav className="cx-card-flat overflow-hidden">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 text-[13px] font-600 transition-colors border-b border-cx-border last:border-0',
                    tab===t.id ? 'bg-cx-emerald/8 text-cx-emerald' : 'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
                  <t.icon size={14}/> {t.label}
                </button>
              ))}
              <button onClick={() => signOut({ callbackUrl:'/' })}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-600 text-cx-rose hover:bg-cx-rose/8 transition-colors">
                <LogOut size={14}/> Sign Out
              </button>
            </nav>

            {user.role==='ADMIN' && (
              <Link href="/admin" className="flex items-center gap-3 p-4 rounded-2xl bg-cx-gold/8 border border-cx-gold/20 text-cx-gold text-[13px] font-600 hover:bg-cx-gold/12 transition-colors">
                <Shield size={14}/> Admin Dashboard <ChevronRight size={13} className="ml-auto"/>
              </Link>
            )}
          </aside>

          {/* Main */}
          <main className="lg:col-span-3 space-y-5">

            {/* Overview */}
            {tab==='overview' && (
              <div className="animate-fade-in space-y-5">
                <h2 className="font-display font-700 text-2xl text-white">Account Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label:'Total Orders', value:orders.length||'—', icon:Package, color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/20' },
                    { label:'Wishlist Items', value:wishlist.length, icon:Heart, color:'text-cx-rose', bg:'bg-cx-rose/8', border:'border-cx-rose/20' },
                    { label:'Member Since', value:formatDate(user.created||new Date()).split(' ').slice(1).join(' '), icon:Star, color:'text-cx-gold', bg:'bg-cx-gold/8', border:'border-cx-gold/20' },
                  ].map(s => (
                    <div key={s.label} className={`p-5 rounded-2xl ${s.bg} border ${s.border}`}>
                      <s.icon size={20} className={`${s.color} mb-2`}/>
                      <div className={`font-display font-800 text-2xl ${s.color}`}>{s.value}</div>
                      <div className="text-[11px] text-cx-muted mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl cx-card-flat">
                  <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2"><User size={14} className="text-cx-emerald"/> Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[['Full Name', user.name||'—'],['Email', user.email||'—'],['Role', user.role||'Customer'],['Status', 'Active']].map(([l,v]) => (
                      <div key={l}>
                        <p className="text-[10px] text-cx-muted uppercase tracking-wide">{l}</p>
                        <p className="text-[13px] font-600 text-cx-text mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setTab('orders')} className="p-4 rounded-2xl cx-card-flat hover:border-cx-emerald/30 transition-all flex items-center gap-3">
                    <Package size={18} className="text-cx-emerald"/>
                    <div><p className="font-600 text-[13px] text-cx-text">My Orders</p><p className="text-[11px] text-cx-muted">Track shipments</p></div>
                  </button>
                  <button onClick={() => setTab('wishlist')} className="p-4 rounded-2xl cx-card-flat hover:border-cx-rose/30 transition-all flex items-center gap-3">
                    <Heart size={18} className="text-cx-rose"/>
                    <div><p className="font-600 text-[13px] text-cx-text">Wishlist</p><p className="text-[11px] text-cx-muted">{wishlist.length} saved</p></div>
                  </button>
                </div>
              </div>
            )}

            {/* Orders */}
            {tab==='orders' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="font-display font-700 text-2xl text-white">Order History</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-cx-emerald"/></div>
                ) : orders.length===0 ? (
                  <div className="p-8 rounded-2xl cx-card-flat text-center">
                    <Package size={40} className="text-cx-muted mx-auto mb-3"/>
                    <p className="font-600 text-cx-text">No orders yet</p>
                    <p className="text-[13px] text-cx-muted mt-1 mb-5">Your order history will appear here</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] rounded-xl inline-flex items-center gap-2">Start Shopping <ChevronRight size={14}/></Link>
                  </div>
                ) : orders.map((order:any) => (
                  <div key={order.id} className="p-5 rounded-2xl cx-card-flat">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-700 text-[13px] text-cx-text font-mono">{order.orderNumber}</p>
                        <p className="text-[11px] text-cx-muted">{formatDate(order.createdAt)} · {order.items?.length} item{order.items?.length!==1?'s':''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-800 text-[15px] grad-emerald num">{formatPrice(order.total)}</p>
                        <span className={cn('text-[10px] font-700 px-2 py-0.5 rounded-lg',
                          order.status==='DELIVERED'?'bg-cx-emerald/10 text-cx-emerald':
                          order.status==='SHIPPED'?'bg-cx-sky/10 text-cx-sky':
                          order.status==='CANCELLED'?'bg-cx-rose/10 text-cx-rose':'bg-cx-violet/10 text-cx-violet')}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {order.items?.slice(0,2).map((item:any) => (
                        <div key={item.id} className="flex items-center justify-between text-[12px]">
                          <span className="text-cx-dim">{item.product?.name} ×{item.quantity}</span>
                          <span className="text-cx-text font-600">{formatPrice(item.totalPrice)}</span>
                        </div>
                      ))}
                      {order.items?.length>2 && <p className="text-[11px] text-cx-muted">+{order.items.length-2} more items</p>}
                    </div>
                    <Link href={`/orders?q=${order.orderNumber}`} className="mt-3 flex items-center gap-1 text-[12px] text-cx-emerald hover:underline">
                      Track order <ChevronRight size={12}/>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Wishlist */}
            {tab==='wishlist' && (
              <div className="animate-fade-in space-y-4">
                <h2 className="font-display font-700 text-2xl text-white">My Wishlist ({wishlist.length})</h2>
                {wishlist.length===0 ? (
                  <div className="p-8 rounded-2xl cx-card-flat text-center">
                    <Heart size={40} className="text-cx-muted mx-auto mb-3"/>
                    <p className="font-600 text-cx-text">Your wishlist is empty</p>
                    <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] rounded-xl inline-flex items-center gap-2 mt-4">Browse Products <ChevronRight size={14}/></Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-4 rounded-2xl cx-card-flat">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cx-card flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-600 text-[13px] text-cx-text truncate">{item.name}</p>
                          <p className="grad-emerald font-800 text-[14px] num mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                        <Link href={`/products/${item.slug}`} className="btn-outline-em px-3 py-1.5 text-[11px] rounded-lg flex-shrink-0">View</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {tab==='settings' && (
              <div className="animate-fade-in space-y-5">
                <h2 className="font-display font-700 text-2xl text-white">Settings</h2>

                <div className="p-5 rounded-2xl cx-card-flat space-y-4">
                  <h3 className="font-600 text-[13px] text-cx-text flex items-center gap-2"><User size={14} className="text-cx-emerald"/> Profile</h3>
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Display Name</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="cx-input w-full px-4 py-3 text-[13px]"/>
                  </div>
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Email Address</label>
                    <input value={user.email} disabled className="cx-input w-full px-4 py-3 text-[13px] opacity-60 cursor-not-allowed"/>
                    <p className="text-[11px] text-cx-muted mt-1">Contact support to change your email</p>
                  </div>
                  <button onClick={saveSettings} disabled={saving}
                    className="btn-em px-6 py-2.5 text-[13px] rounded-xl flex items-center gap-2 disabled:opacity-60">
                    {saving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:saved?<>✓ Saved!</>:<><Save size={13}/>Save Changes</>}
                  </button>
                </div>

                <div className="p-5 rounded-2xl cx-card-flat">
                  <h3 className="font-600 text-[13px] text-cx-text mb-4 flex items-center gap-2"><Bell size={14} className="text-cx-violet"/> Notifications</h3>
                  {[
                    { key:'orders',          label:'Order updates',         desc:'Shipping and delivery status' },
                    { key:'priceDrops',      label:'Price drop alerts',     desc:'When wishlist items go on sale' },
                    { key:'recommendations', label:'AI recommendations',    desc:'Personalised weekly digest' },
                    { key:'marketing',       label:'Promotions & deals',    desc:'Exclusive offers and launches' },
                  ].map(pref => (
                    <div key={pref.key} className="flex items-center justify-between py-3 border-b border-cx-border last:border-0">
                      <div>
                        <p className="text-[13px] font-600 text-cx-text">{pref.label}</p>
                        <p className="text-[11px] text-cx-muted">{pref.desc}</p>
                      </div>
                      <button onClick={() => setNotifs(n=>({...n,[pref.key]:!n[pref.key as keyof typeof n]}))}
                        className={cn('w-11 h-6 rounded-full transition-colors relative', notifs[pref.key as keyof typeof notifs]?'bg-cx-emerald':'bg-cx-border')}>
                        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', notifs[pref.key as keyof typeof notifs]?'translate-x-5':'translate-x-0.5')}/>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-cx-rose/8 border border-cx-rose/20">
                  <h3 className="font-600 text-[13px] text-white mb-3 flex items-center gap-2"><Lock size={14} className="text-cx-rose"/> Danger Zone</h3>
                  <button onClick={() => signOut({ callbackUrl:'/' })} className="btn-outline-gold px-5 py-2.5 text-[13px] rounded-xl flex items-center gap-2">
                    <LogOut size={13}/> Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
