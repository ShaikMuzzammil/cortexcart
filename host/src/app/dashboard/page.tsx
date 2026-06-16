'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package, Search, RefreshCw, LogOut, ChevronDown, ChevronUp,
  Copy, Check, Mail, Truck, Clock, CreditCard, CheckCircle2,
  XCircle, MapPin, Calendar, Edit3, Save, X, Send, Loader2,
  Zap, DollarSign, Filter, Bell, BarChart3, Users, ArrowUpRight,
  ExternalLink, Eye, ChevronRight, AlertCircle, Banknote, Box,
  TrendingUp, Activity, Hash, PhoneCall, MessageSquare, Inbox,
  Tag, StickyNote, Archive, Reply
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// ── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string; orderNumber: string; status: string; total: number
  subtotal: number; tax: number; shipping: number
  paymentMethod: string; paymentStatus: string
  shippingAddress: any; estimatedDelivery: string | null
  trackingNumber: string | null; carrier: string | null; notes: string | null
  createdAt: string; updatedAt: string
  user: { name: string | null; email: string | null } | null
  items: {
    id: string; quantity: number; unitPrice: number; totalPrice: number
    product: { name: string; images: string[]; slug: string; brand: string | null }
  }[]
}

interface ContactMessage {
  id: string; name: string; email: string; subject: string
  message: string; category: string; priority: string
  status: string; notes: string | null; createdAt: string; updatedAt: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { val:'PENDING',           label:'Order Placed',      emoji:'📋', color:'text-gray-400',   bg:'bg-gray-500/10',   border:'border-gray-500/20' },
  { val:'PAYMENT_CONFIRMED', label:'Payment Confirmed', emoji:'✅', color:'text-violet-400', bg:'bg-violet-500/10', border:'border-violet-500/20' },
  { val:'PROCESSING',        label:'Processing',        emoji:'⚙️', color:'text-sky-400',    bg:'bg-sky-500/10',    border:'border-sky-500/20' },
  { val:'SHIPPED',           label:'Shipped',           emoji:'🚚', color:'text-yellow-400', bg:'bg-yellow-500/10', border:'border-yellow-500/20' },
  { val:'OUT_FOR_DELIVERY',  label:'Out for Delivery',  emoji:'🛵', color:'text-orange-400', bg:'bg-orange-500/10', border:'border-orange-500/20' },
  { val:'DELIVERED',         label:'Delivered',         emoji:'🎉', color:'text-emerald-400',bg:'bg-emerald-500/10',border:'border-emerald-500/20' },
  { val:'CANCELLED',         label:'Cancelled',         emoji:'❌', color:'text-red-400',    bg:'bg-red-500/10',    border:'border-red-500/20' },
  { val:'REFUNDED',          label:'Refunded',          emoji:'💰', color:'text-pink-400',   bg:'bg-pink-500/10',   border:'border-pink-500/20' },
]
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.val, s]))

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const TAB_STATUS: Record<string, string | undefined> = {
  Pending:   'PENDING',
  Processing:'PROCESSING',
  Shipped:   'SHIPPED',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status]
  if (!s) return <span className="text-xs text-gray-500">{status}</span>
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-700 border ${s.bg} ${s.color} ${s.border}`}>
      {s.emoji} {s.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div style={{ background:'#111520', border:'1px solid #1a2035', borderRadius:16 }} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-700 uppercase tracking-wider" style={{ color:'#4a5a7a' }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color:'#4a5a7a' }}>{sub}</p>}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [orders,      setOrders]      = useState<Order[]>([])
  const [allOrders,   setAllOrders]   = useState<Order[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [pages,       setPages]       = useState(1)
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState('All')
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set())
  const [editing,     setEditing]     = useState<string | null>(null)
  const [editData,    setEditData]    = useState<any>({})
  const [saving,      setSaving]      = useState(false)
  const [copied,      setCopied]      = useState<string | null>(null)
  const [emailModal,  setEmailModal]  = useState<Order | null>(null)
  const [emailData,   setEmailData]   = useState({ subject:'', message:'' })
  const [sendingMail, setSendingMail] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [view,        setView]        = useState<'orders'|'analytics'|'contacts'>('orders')

  // ── Contact Messages state ────────────────────────────────────────────────
  const [contacts,       setContacts]       = useState<ContactMessage[]>([])
  const [contactCounts,  setContactCounts]  = useState<Record<string,number>>({})
  const [contactSearch,  setContactSearch]  = useState('')
  const [contactStatus,  setContactStatus]  = useState('all')
  const [contactLoading, setContactLoading] = useState(false)
  const [expandedContact,setExpandedContact]= useState<string|null>(null)
  const [contactNotes,   setContactNotes]   = useState<Record<string,string>>({})
  const timerRef = useRef<any>(null)

  const filterStatus = TAB_STATUS[activeTab]

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '15' })
      if (search)       p.set('q', search)
      if (filterStatus) p.set('status', filterStatus)
      const res = await fetch(`/api/orders?${p}`)
      if (res.status === 401) { router.push('/'); return }
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setLastRefresh(new Date())
    } catch { if (!silent) toast.error('Failed to load orders') }
    if (!silent) setLoading(false)
  }, [page, search, filterStatus])

  // Fetch all orders once for analytics
  const fetchAllOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?page=1&limit=200')
      if (res.ok) { const data = await res.json(); setAllOrders(data.orders || []) }
    } catch {}
  }, [])

  useEffect(() => { fetchOrders(); fetchAllOrders() }, [fetchOrders])

  // Auto-refresh every 30s
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchOrders(true), 30000)
    }
    return () => clearInterval(timerRef.current)
  }, [autoRefresh, fetchOrders])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const startEdit = (o: Order) => {
    setEditing(o.id)
    setEditData({
      status:           o.status,
      trackingNumber:   o.trackingNumber || '',
      carrier:          o.carrier || '',
      estimatedDelivery:o.estimatedDelivery ? new Date(o.estimatedDelivery).toISOString().slice(0,10) : '',
      notes:            o.notes || '',
    })
  }

  const saveOrder = async (orderId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ orderId, ...editData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      if (data.emailSent) {
        toast.success('✅ Order updated! Customer notified by email.')
      } else if (data.emailError) {
        toast.error(`Order updated, but email failed: ${data.emailError}`, { duration: 6000 })
      } else {
        toast.success('✅ Order updated.')
      }
      setEditing(null)
      fetchOrders(true)
      fetchAllOrders()
    } catch (e: any) { toast.error(e.message) }
    setSaving(false)
  }

  const quickStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ orderId, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      const s = STATUS_MAP[status]
      if (data.emailSent) {
        toast.success(`${s?.emoji} Status → ${s?.label}. Email sent.`)
      } else if (data.emailError) {
        toast.error(`Status → ${s?.label}, but email failed: ${data.emailError}`, { duration: 6000 })
      } else {
        toast.success(`${s?.emoji} Status → ${s?.label}.`)
      }
      fetchOrders(true)
      fetchAllOrders()
    } catch { toast.error('Update failed') }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied!', { duration:1200 })
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Contact Messages helpers ──────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setContactLoading(true)
    try {
      const params = new URLSearchParams()
      if (contactStatus !== 'all') params.set('status', contactStatus)
      if (contactSearch)           params.set('search', contactSearch)
      const res = await fetch(`/api/contacts?${params}`)
      const data = await res.json()
      setContacts(data.messages || [])
      setContactCounts(data.counts || {})
    } catch (e) { console.error(e) }
    setContactLoading(false)
  }, [contactStatus, contactSearch])

  useEffect(() => { if (view === 'contacts') fetchContacts() }, [view, fetchContacts])

  const updateContact = async (id: string, patch: { status?: string; notes?: string }) => {
    try {
      await fetch('/api/contacts', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
      toast.success('Updated')
    } catch { toast.error('Failed to update') }
  }

  const openEmail = (o: Order) => {
    const name = o.user?.name || `${(o.shippingAddress as any)?.firstName||''} ${(o.shippingAddress as any)?.lastName||''}`.trim()
    setEmailModal(o)
    setEmailData({ subject:`Re: Your order ${o.orderNumber}`, message:`Hi ${name || 'there'},\n\n` })
  }

  const sendEmail = async () => {
    if (!emailModal) return
    const to = (emailModal.shippingAddress as any)?.email || emailModal.user?.email
    if (!to)          { toast.error('No email address found for this order'); return }
    if (!emailData.subject || !emailData.message) { toast.error('Fill subject and message'); return }
    setSendingMail(true)
    try {
      const res = await fetch('/api/email', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ to, subject:emailData.subject, message:emailData.message, orderNumber:emailModal.orderNumber }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      toast.success(`✉️ Email sent to ${to}`)
      setEmailModal(null)
    } catch (e:any) { toast.error(e.message) }
    setSendingMail(false)
  }

  const logout = async () => {
    await fetch('/api/auth', { method:'DELETE' })
    router.push('/')
  }

  // ── Analytics ────────────────────────────────────────────────────────────
  const stats = {
    totalRev:   allOrders.filter(o=>!['CANCELLED','REFUNDED'].includes(o.status)).reduce((s,o)=>s+o.total,0),
    todayOrders:allOrders.filter(o=>new Date(o.createdAt).toDateString()===new Date().toDateString()).length,
    pending:    allOrders.filter(o=>o.status==='PENDING').length,
    processing: allOrders.filter(o=>o.status==='PROCESSING').length,
    shipped:    allOrders.filter(o=>['SHIPPED','OUT_FOR_DELIVERY'].includes(o.status)).length,
    delivered:  allOrders.filter(o=>o.status==='DELIVERED').length,
    cancelled:  allOrders.filter(o=>o.status==='CANCELLED').length,
  }

  const tabCounts = {
    All:       total,
    Pending:   allOrders.filter(o=>o.status==='PENDING').length,
    Processing:allOrders.filter(o=>o.status==='PROCESSING').length,
    Shipped:   allOrders.filter(o=>['SHIPPED','OUT_FOR_DELIVERY'].includes(o.status)).length,
    Delivered: allOrders.filter(o=>o.status==='DELIVERED').length,
    Cancelled: allOrders.filter(o=>o.status==='CANCELLED').length,
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{background:'#07090f'}}>

      {/* ── Topbar ── */}
      <div style={{background:'#0d1018',borderBottom:'1px solid #1a2035'}} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#10d988,#38bdf8)'}}>
              <Zap size={15} className="text-black" />
            </div>
            <span className="font-black text-white text-sm">CortexCart <span style={{color:'#10d988'}}>Host</span></span>
          </div>

          <div className="flex items-center gap-1 ml-4">
            {(['orders','analytics','contacts'] as const).map(v => (
              <button key={v} onClick={()=>setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-700 capitalize transition-all relative ${view===v ? 'text-white' : 'hover:text-white'}`}
                style={view===v ? {background:'rgba(16,217,136,0.12)',color:'#10d988'} : {color:'#4a5a7a'}}>
                {v === 'orders'    && <><Package       className="inline w-3 h-3 mr-1"/>Orders</>}
                {v === 'analytics' && <><BarChart3     className="inline w-3 h-3 mr-1"/>Analytics</>}
                {v === 'contacts'  && <><MessageSquare className="inline w-3 h-3 mr-1"/>Messages
                  {(contactCounts['new'] || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-800 flex items-center justify-center">
                      {contactCounts['new'] > 9 ? '9+' : contactCounts['new']}
                    </span>
                  )}
                </>}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <button onClick={()=>setAutoRefresh(r=>!r)}
                className="text-[11px] font-600 transition-colors"
                style={{color: autoRefresh ? '#10d988' : '#4a5a7a'}}>
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
            </div>
            <button onClick={()=>fetchOrders()}
              className="p-1.5 rounded-lg transition-all hover:bg-white/5">
              <RefreshCw size={13} style={{color:'#4a5a7a'}} className={loading?'animate-spin':''} />
            </button>
            <span className="text-[10px]" style={{color:'#2a3356'}}>
              {lastRefresh.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
            </span>
            <a href={process.env.NEXT_PUBLIC_APP_URL||'#'} target="_blank" rel="noopener"
              className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5"
              style={{color:'#38bdf8',border:'1px solid rgba(56,189,248,0.2)'}}>
              <ExternalLink size={11}/> Main Store
            </a>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-700 transition-all hover:bg-red-500/10"
              style={{color:'#f43f6e',border:'1px solid rgba(244,63,110,0.15)'}}>
              <LogOut size={11}/> Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="col-span-2 sm:col-span-2" style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} >
            <div className="p-4">
              <p className="text-[11px] font-700 uppercase tracking-wider mb-2" style={{color:'#4a5a7a'}}>Total Revenue</p>
              <p className="text-2xl font-black" style={{color:'#10d988'}}>{fmt(stats.totalRev)}</p>
              <p className="text-[11px] mt-1" style={{color:'#4a5a7a'}}>{allOrders.length} orders total · {stats.todayOrders} today</p>
            </div>
          </div>
          {[
            {label:'Pending',    val:stats.pending,    color:'#f5b731', icon:Clock},
            {label:'Processing', val:stats.processing, color:'#38bdf8', icon:Activity},
            {label:'In Transit', val:stats.shipped,    color:'#a78bfa', icon:Truck},
            {label:'Delivered',  val:stats.delivered,  color:'#10d988', icon:CheckCircle2},
            {label:'Cancelled',  val:stats.cancelled,  color:'#f43f6e', icon:XCircle},
          ].map(s=>(
            <div key={s.label} style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} className="p-3">
              <p className="text-[10px] font-700 uppercase tracking-wider mb-1.5" style={{color:'#4a5a7a'}}>{s.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-black" style={{color:s.color}}>{s.val}</p>
                <s.icon size={16} style={{color:s.color,opacity:0.5}} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Analytics View ── */}
        {view === 'analytics' && (
          <div className="space-y-5 mb-6">
            <div style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} className="p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} style={{color:'#10d988'}}/> Order Status Breakdown
              </h2>
              <div className="space-y-3">
                {STATUS_OPTIONS.map(s => {
                  const count = allOrders.filter(o=>o.status===s.val).length
                  const pct   = allOrders.length ? (count/allOrders.length)*100 : 0
                  return (
                    <div key={s.val} className="flex items-center gap-3">
                      <span className="w-28 text-xs shrink-0" style={{color:'#c0cfe8'}}>{s.emoji} {s.label}</span>
                      <div className="flex-1 h-2 rounded-full" style={{background:'#1a2035'}}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{width:`${pct}%`, background: s.val==='DELIVERED'?'#10d988':s.val==='SHIPPED'?'#f5b731':s.val==='CANCELLED'?'#f43f6e':'#8b5cf6'}} />
                      </div>
                      <span className="w-14 text-xs text-right font-700" style={{color:'#c0cfe8'}}>{count} <span style={{color:'#4a5a7a'}}>({pct.toFixed(0)}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {label:'Avg Order Value',   val: allOrders.length ? fmt(allOrders.reduce((s,o)=>s+o.total,0)/allOrders.length) : '$0',       icon:DollarSign, color:'#10d988'},
                {label:'COD Orders',        val: allOrders.filter(o=>o.paymentMethod==='cod').length,    icon:Banknote, color:'#f5b731'},
                {label:'Fulfillment Rate',  val: allOrders.length ? `${((stats.delivered/allOrders.length)*100).toFixed(1)}%` : '0%',         icon:TrendingUp, color:'#38bdf8'},
              ].map(s=>(
                <div key={s.label} style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={14} style={{color:s.color}}/>
                    <p className="text-[11px] font-700 uppercase tracking-wide" style={{color:'#4a5a7a'}}>{s.label}</p>
                  </div>
                  <p className="text-2xl font-black" style={{color:s.color}}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Recent 5 orders in analytics */}
            <div style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} className="p-5">
              <h2 className="font-bold text-white mb-3 text-sm">Latest 5 Orders</h2>
              {allOrders.slice(0,5).map(o=>(
                <div key={o.id} className="flex items-center gap-3 py-2.5" style={{borderBottom:'1px solid #1a2035'}}>
                  <span className="font-mono text-xs" style={{color:'#10d988'}}>{o.orderNumber}</span>
                  <span className="flex-1 text-xs truncate" style={{color:'#6b7fa3'}}>
                    {o.user?.name || (o.shippingAddress as any)?.firstName || 'Guest'}
                  </span>
                  <StatusBadge status={o.status}/>
                  <span className="font-bold text-xs" style={{color:'#e8edf8'}}>{fmt(o.total)}</span>
                  <span className="text-[10px]" style={{color:'#3a4a6a'}}>{timeAgo(o.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contact Messages View ── */}
        {view === 'contacts' && (
          <div className="space-y-4 mb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#4a5a7a'}}/>
                <input value={contactSearch} onChange={e=>setContactSearch(e.target.value)}
                  placeholder="Search by name, email, subject or message…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all"
                  style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}
                  onFocus={e=>(e.target.style.borderColor='#10d988')}
                  onBlur={e=>(e.target.style.borderColor='#1a2035')}/>
              </div>
              <button onClick={fetchContacts}
                className="px-4 py-2.5 rounded-xl text-xs font-700 transition-all flex items-center gap-2"
                style={{background:'rgba(16,217,136,0.1)',border:'1px solid rgba(16,217,136,0.2)',color:'#10d988'}}>
                <RefreshCw size={12}/> Refresh
              </button>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                {k:'all',      label:'All',      color:'#6b7fa3'},
                {k:'new',      label:'New',      color:'#f43f6e'},
                {k:'read',     label:'Read',     color:'#38bdf8'},
                {k:'replied',  label:'Replied',  color:'#10d988'},
                {k:'archived', label:'Archived', color:'#4a5a7a'},
              ].map(s => (
                <button key={s.k} onClick={()=>setContactStatus(s.k)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-700 transition-all flex items-center gap-1.5"
                  style={{
                    background: contactStatus===s.k ? `${s.color}18` : 'transparent',
                    border: `1px solid ${contactStatus===s.k ? s.color+'40' : '#1a2035'}`,
                    color: contactStatus===s.k ? s.color : '#4a5a7a',
                  }}>
                  {s.label}
                  {s.k !== 'all' && contactCounts[s.k] != null && (
                    <span className="rounded-full px-1.5 text-[9px] font-800"
                      style={{background:`${s.color}25`,color:s.color}}>
                      {contactCounts[s.k]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Message list */}
            {contactLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin" style={{color:'#10d988'}}/>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-14" style={{color:'#3a4a6a'}}>
                <Inbox size={36} className="mx-auto mb-3 opacity-40"/>
                <p className="text-sm font-600">No messages yet</p>
                <p className="text-xs mt-1">Contact form submissions will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map(msg => {
                  const isOpen  = expandedContact === msg.id
                  const priCfg  = {urgent:{c:'#f43f6e',l:'Urgent'}, high:{c:'#f5b731',l:'High'}, medium:{c:'#38bdf8',l:'Medium'}, low:{c:'#10d988',l:'Low'}}
                  const pri     = priCfg[msg.priority as keyof typeof priCfg] || priCfg.medium
                  const stCfg   = {new:{c:'#f43f6e'}, read:{c:'#38bdf8'}, replied:{c:'#10d988'}, archived:{c:'#4a5a7a'}}
                  const stColor = (stCfg[msg.status as keyof typeof stCfg] || stCfg.new).c
                  return (
                    <div key={msg.id} style={{background:'#111520',border:`1px solid ${isOpen?'#10d98840':'#1a2035'}`,borderRadius:14}}
                      className="overflow-hidden transition-all">
                      {/* Row header */}
                      <button onClick={()=>{
                          setExpandedContact(isOpen ? null : msg.id)
                          if (msg.status==='new') updateContact(msg.id,{status:'read'})
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors text-left">
                        {/* Status dot */}
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:stColor,boxShadow:`0 0 6px ${stColor}80`}}/>
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-800 flex-shrink-0"
                          style={{background:'rgba(16,217,136,0.12)',color:'#10d988'}}>
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-700 text-white">{msg.name}</span>
                            <span className="text-[11px]" style={{color:'#4a5a7a'}}>{msg.email}</span>
                            <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                              style={{background:`${pri.c}18`,color:pri.c,border:`1px solid ${pri.c}30`}}>
                              {pri.l}
                            </span>
                            <span className="text-[10px] font-600 px-2 py-0.5 rounded-full"
                              style={{background:'rgba(139,92,246,0.15)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,0.25)'}}>
                              {msg.category}
                            </span>
                          </div>
                          <p className="text-[12px] font-600 truncate mt-0.5" style={{color:'#c0cfe8'}}>{msg.subject}</p>
                          {!isOpen && <p className="text-[11px] truncate" style={{color:'#4a5a7a'}}>{msg.message}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px]" style={{color:'#3a4a6a'}}>{timeAgo(msg.createdAt)}</p>
                          {isOpen ? <ChevronUp size={14} style={{color:'#4a5a7a'}} className="ml-auto mt-1"/> : <ChevronDown size={14} style={{color:'#4a5a7a'}} className="ml-auto mt-1"/>}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div className="px-4 pb-4 border-t" style={{borderColor:'#1a2035'}}>
                          {/* Full message */}
                          <div className="mt-3 rounded-xl p-4" style={{background:'#0d1018',border:'1px solid #1a2035'}}>
                            <p className="text-[11px] font-700 uppercase tracking-widest mb-2" style={{color:'#4a5a7a'}}>Message</p>
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{color:'#c0cfe8'}}>{msg.message}</p>
                          </div>

                          {/* Notes */}
                          <div className="mt-3">
                            <p className="text-[11px] font-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{color:'#4a5a7a'}}>
                              <StickyNote size={11}/> Internal Notes
                            </p>
                            <textarea
                              value={contactNotes[msg.id] ?? (msg.notes || '')}
                              onChange={e=>setContactNotes(n=>({...n,[msg.id]:e.target.value}))}
                              placeholder="Add private notes here…"
                              rows={2}
                              className="w-full rounded-xl px-3 py-2.5 text-[12px] outline-none resize-none transition-all"
                              style={{background:'#07090f',border:'1px solid #1a2035',color:'#c0cfe8'}}
                              onFocus={e=>(e.target.style.borderColor='#8b5cf640')}
                              onBlur={e=>{
                                e.target.style.borderColor='#1a2035'
                                const v = contactNotes[msg.id]
                                if (v !== undefined && v !== (msg.notes||'')) updateContact(msg.id,{notes:v})
                              }}
                            />
                          </div>

                          {/* Actions */}
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-700 transition-all"
                              style={{background:'rgba(16,217,136,0.1)',border:'1px solid rgba(16,217,136,0.2)',color:'#10d988'}}>
                              <Reply size={12}/> Reply via Email
                            </a>
                            {msg.status !== 'replied' && (
                              <button onClick={()=>updateContact(msg.id,{status:'replied'})}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-700 transition-all"
                                style={{background:'rgba(16,217,136,0.08)',border:'1px solid rgba(16,217,136,0.15)',color:'#10d988'}}>
                                <Check size={12}/> Mark Replied
                              </button>
                            )}
                            {msg.status !== 'archived' && (
                              <button onClick={()=>updateContact(msg.id,{status:'archived'})}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-700 transition-all"
                                style={{background:'rgba(74,90,122,0.1)',border:'1px solid #1a2035',color:'#4a5a7a'}}>
                                <Archive size={12}/> Archive
                              </button>
                            )}
                            <button onClick={()=>copyText(msg.email,'email-'+msg.id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-700 transition-all"
                              style={{background:'rgba(56,189,248,0.08)',border:'1px solid rgba(56,189,248,0.15)',color:'#38bdf8'}}>
                              {copied==='email-'+msg.id ? <Check size={12}/> : <Copy size={12}/>} Copy Email
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Orders View ── */}
        {view === 'orders' && (
          <>
            {/* Search + Tab Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#4a5a7a'}}/>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
                  placeholder="Search order number, customer name or email…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all"
                  style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}
                  onFocus={e=>(e.target.style.borderColor='#10d988')}
                  onBlur={e=>(e.target.style.borderColor='#1a2035')}
                />
              </div>
              {search && (
                <button onClick={()=>{setSearch('');setPage(1)}}
                  className="px-3 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                  style={{border:'1px solid #1a2035',color:'#4a5a7a'}}>
                  Clear
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
              {TABS.map(tab=>{
                const cnt = (tabCounts as any)[tab]
                const active = activeTab === tab
                return (
                  <button key={tab} onClick={()=>{setActiveTab(tab);setPage(1)}}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-700 whitespace-nowrap transition-all"
                    style={active
                      ? {background:'rgba(16,217,136,0.12)',color:'#10d988',border:'1px solid rgba(16,217,136,0.25)'}
                      : {color:'#4a5a7a',border:'1px solid transparent'}}>
                    {tab}
                    {cnt > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-800"
                        style={active
                          ? {background:'rgba(16,217,136,0.2)',color:'#10d988'}
                          : {background:'#1a2035',color:'#6b7fa3'}}>
                        {cnt}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Orders */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin" style={{color:'#10d988'}}/>
              </div>
            ) : orders.length === 0 ? (
              <div style={{background:'#111520',border:'1px solid #1a2035',borderRadius:16}} className="p-12 text-center">
                <Package size={36} className="mx-auto mb-3" style={{color:'#2a3356'}}/>
                <p style={{color:'#4a5a7a'}}>No orders {activeTab !== 'All' ? `with status "${activeTab}"` : 'found'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map(order=>{
                  const isOpen   = expanded.has(order.id)
                  const isEditing = editing === order.id
                  const custEmail = (order.shippingAddress as any)?.email || order.user?.email
                  const custName  = order.user?.name || `${(order.shippingAddress as any)?.firstName||''} ${(order.shippingAddress as any)?.lastName||''}`.trim() || 'Guest'
                  const s = STATUS_MAP[order.status]

                  return (
                    <div key={order.id}
                      style={{background:'#111520', border:`1px solid ${isOpen?'rgba(16,217,136,0.2)':'#1a2035'}`, borderRadius:16, transition:'all 0.15s'}}>

                      {/* ── Order Row ── */}
                      <div className="p-4 flex items-center gap-3">
                        {/* Expand toggle */}
                        <button onClick={()=>toggleExpand(order.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{background: isOpen?'rgba(16,217,136,0.1)':'#1a2035'}}>
                          {isOpen
                            ? <ChevronUp size={13} style={{color:'#10d988'}}/>
                            : <ChevronDown size={13} style={{color:'#4a5a7a'}}/>}
                        </button>

                        {/* Order ID */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 w-36">
                          <span className="font-mono font-bold text-xs truncate" style={{color:'#10d988'}}>{order.orderNumber}</span>
                          <button onClick={()=>copyText(order.orderNumber, order.id+'on')} className="flex-shrink-0">
                            {copied===order.id+'on'
                              ? <Check size={10} style={{color:'#10d988'}}/>
                              : <Copy size={10} style={{color:'#2a3356'}}/>}
                          </button>
                        </div>

                        {/* Customer */}
                        <div className="flex-1 min-w-0 hidden sm:block">
                          <p className="text-xs font-700 truncate" style={{color:'#e8edf8'}}>{custName}</p>
                          {custEmail && <p className="text-[10px] truncate" style={{color:'#4a5a7a'}}>{custEmail}</p>}
                        </div>

                        {/* Items count */}
                        <span className="text-[10px] px-2 py-1 rounded-lg hidden md:block"
                          style={{background:'#0d1018',color:'#6b7fa3'}}>
                          {order.items.length} item{order.items.length!==1?'s':''}
                        </span>

                        {/* Status */}
                        <div className="flex-shrink-0">
                          <StatusBadge status={order.status}/>
                        </div>

                        {/* Total */}
                        <span className="text-sm font-black flex-shrink-0" style={{color:'#e8edf8'}}>
                          {fmt(order.total)}
                        </span>

                        {/* Time */}
                        <span className="text-[10px] flex-shrink-0 hidden lg:block" style={{color:'#3a4a6a'}}>
                          {timeAgo(order.createdAt)}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={()=>openEmail(order)}
                            className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Email customer">
                            <Mail size={13} style={{color:'#38bdf8'}}/>
                          </button>
                          <button onClick={()=>isEditing ? setEditing(null) : startEdit(order)}
                            className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Edit order">
                            {isEditing
                              ? <X size={13} style={{color:'#f43f6e'}}/>
                              : <Edit3 size={13} style={{color:'#4a5a7a'}}/>}
                          </button>
                        </div>
                      </div>

                      {/* ── Edit Panel ── */}
                      {isEditing && (
                        <div className="mx-4 mb-4 p-4 rounded-2xl space-y-4"
                          style={{background:'rgba(16,217,136,0.04)',border:'1px solid rgba(16,217,136,0.12)'}}>
                          <p className="text-xs font-800" style={{color:'#10d988'}}>✏️ Update Order #{order.orderNumber.slice(-8)}</p>

                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Status */}
                            <div>
                              <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Status *</label>
                              <select value={editData.status} onChange={e=>setEditData((d:any)=>({...d,status:e.target.value}))}
                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}>
                                {STATUS_OPTIONS.map(s=>(
                                  <option key={s.val} value={s.val}>{s.emoji} {s.label}</option>
                                ))}
                              </select>
                            </div>
                            {/* Delivery Date */}
                            <div>
                              <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Estimated Delivery</label>
                              <input type="date" value={editData.estimatedDelivery}
                                onChange={e=>setEditData((d:any)=>({...d,estimatedDelivery:e.target.value}))}
                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}/>
                            </div>
                            {/* Tracking */}
                            <div>
                              <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Tracking Number</label>
                              <input value={editData.trackingNumber}
                                onChange={e=>setEditData((d:any)=>({...d,trackingNumber:e.target.value}))}
                                placeholder="1Z999AA10123456784"
                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}/>
                            </div>
                            {/* Carrier */}
                            <div>
                              <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Carrier</label>
                              <select value={editData.carrier} onChange={e=>setEditData((d:any)=>({...d,carrier:e.target.value}))}
                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}>
                                <option value="">Select carrier…</option>
                                {['FedEx','UPS','DHL','USPS','Amazon Logistics','India Post','BlueDart','Delhivery','Ecom Express','Shadowfax','Other'].map(c=>(
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            {/* Note */}
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Note to Customer (in email)</label>
                              <input value={editData.notes}
                                onChange={e=>setEditData((d:any)=>({...d,notes:e.target.value}))}
                                placeholder="Any extra info for the customer…"
                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                                style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}/>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={()=>saveOrder(order.id)} disabled={saving}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-800 transition-all disabled:opacity-60"
                              style={{background:'linear-gradient(135deg,#10d988,#0a9e62)',color:'#07090f'}}>
                              {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
                              {saving ? 'Saving…' : 'Save & Notify Customer'}
                            </button>
                            <button onClick={()=>setEditing(null)}
                              className="px-4 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                              style={{border:'1px solid #1a2035',color:'#4a5a7a'}}>
                              Cancel
                            </button>
                          </div>
                          <p className="text-[10px]" style={{color:'#2a3356'}}>
                            ✉️ Email automatically sent to {custEmail || 'customer'} on save
                          </p>
                        </div>
                      )}

                      {/* ── Quick Status Buttons (visible when expanded) ── */}
                      {isOpen && !isEditing && (
                        <div className="mx-4 mb-3">
                          <p className="text-[10px] font-700 uppercase tracking-wide mb-2" style={{color:'#4a5a7a'}}>Quick update:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {STATUS_OPTIONS
                              .filter(s=>s.val!==order.status)
                              .slice(0,4)
                              .map(s=>(
                              <button key={s.val} onClick={()=>quickStatus(order.id,s.val)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-700 border transition-all hover:opacity-80 ${s.bg} ${s.color} ${s.border}`}>
                                {s.emoji} → {s.label}
                              </button>
                            ))}
                            <button onClick={()=>startEdit(order)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-700 transition-all hover:bg-white/5"
                              style={{border:'1px solid #1a2035',color:'#c0cfe8'}}>
                              <Edit3 size={11}/> Full Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Expanded Detail ── */}
                      {isOpen && !isEditing && (
                        <div style={{borderTop:'1px solid #1a2035'}}>
                          <div className="p-4 grid md:grid-cols-3 gap-5">

                            {/* Items */}
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-800 uppercase tracking-wider mb-3" style={{color:'#4a5a7a'}}>
                                <Box className="inline w-3 h-3 mr-1"/>ITEMS ({order.items.length})
                              </p>
                              <div className="space-y-2 mb-4">
                                {order.items.map(item=>(
                                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:'#0d1018'}}>
                                    {item.product?.images?.[0] && (
                                      <img src={item.product.images[0]} alt={item.product.name}
                                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                                        style={{border:'1px solid #1a2035'}}/>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-700 truncate" style={{color:'#e8edf8'}}>{item.product.name}</p>
                                      {item.product.brand && <p className="text-[10px]" style={{color:'#4a5a7a'}}>{item.product.brand}</p>}
                                      <p className="text-[10px]" style={{color:'#6b7fa3'}}>Qty: {item.quantity} × {fmt(item.unitPrice)}</p>
                                    </div>
                                    <span className="text-sm font-800 flex-shrink-0" style={{color:'#10d988'}}>{fmt(item.totalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Totals */}
                              <div className="p-3 rounded-xl space-y-1.5 text-xs" style={{background:'#0d1018'}}>
                                {[
                                  {l:'Subtotal', v:fmt(order.subtotal)},
                                  {l:'Shipping', v: order.shipping===0?'FREE':fmt(order.shipping)},
                                  {l:'Tax',      v:fmt(order.tax)},
                                ].map(r=>(
                                  <div key={r.l} className="flex justify-between" style={{color:'#6b7fa3'}}>
                                    <span>{r.l}</span><span>{r.v}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between pt-1.5 font-800 text-sm" style={{borderTop:'1px solid #1a2035',color:'#10d988'}}>
                                  <span style={{color:'#e8edf8'}}>Total</span><span>{fmt(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right col */}
                            <div className="space-y-4">
                              {/* Delivery */}
                              {order.shippingAddress && (
                                <div>
                                  <p className="text-[10px] font-800 uppercase tracking-wider mb-2" style={{color:'#4a5a7a'}}>
                                    <MapPin className="inline w-3 h-3 mr-1"/>DELIVERY
                                  </p>
                                  <div className="p-3 rounded-xl text-xs space-y-0.5" style={{background:'#0d1018'}}>
                                    <p className="font-700" style={{color:'#e8edf8'}}>
                                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                    </p>
                                    <p style={{color:'#6b7fa3'}}>{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.line2 && <p style={{color:'#6b7fa3'}}>{order.shippingAddress.line2}</p>}
                                    <p style={{color:'#6b7fa3'}}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                    <p style={{color:'#6b7fa3'}}>{order.shippingAddress.country}</p>
                                    {order.shippingAddress.phone && (
                                      <p style={{color:'#10d988'}} className="flex items-center gap-1">
                                        <PhoneCall className="w-3 h-3"/> {order.shippingAddress.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order info */}
                              <div>
                                <p className="text-[10px] font-800 uppercase tracking-wider mb-2" style={{color:'#4a5a7a'}}>
                                  <Hash className="inline w-3 h-3 mr-1"/>ORDER INFO
                                </p>
                                <div className="p-3 rounded-xl text-xs space-y-2" style={{background:'#0d1018'}}>
                                  <div className="flex justify-between">
                                    <span style={{color:'#4a5a7a'}}>Payment</span>
                                    <span style={{color:'#e8edf8',fontWeight:700}}>{order.paymentMethod==='cod'?'💵 Cash on Delivery':'💳 Online'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span style={{color:'#4a5a7a'}}>Ordered</span>
                                    <span style={{color:'#e8edf8'}}>{fmtDate(order.createdAt)} {fmtTime(order.createdAt)}</span>
                                  </div>
                                  {order.estimatedDelivery && (
                                    <div className="flex justify-between">
                                      <span style={{color:'#4a5a7a'}}>Est. Delivery</span>
                                      <span style={{color:'#10d988',fontWeight:700}}>{fmtDate(order.estimatedDelivery)}</span>
                                    </div>
                                  )}
                                  {order.trackingNumber && (
                                    <div className="flex justify-between items-center">
                                      <span style={{color:'#4a5a7a'}}>Tracking</span>
                                      <div className="flex items-center gap-1">
                                        <span style={{color:'#e8edf8',fontFamily:'monospace',fontSize:10}}>{order.trackingNumber}</span>
                                        <button onClick={()=>copyText(order.trackingNumber!,order.id+'trk')}>
                                          {copied===order.id+'trk'?<Check size={9} style={{color:'#10d988'}}/>:<Copy size={9} style={{color:'#4a5a7a'}}/>}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {order.carrier && (
                                    <div className="flex justify-between">
                                      <span style={{color:'#4a5a7a'}}>Carrier</span>
                                      <span style={{color:'#e8edf8'}}>{order.carrier}</span>
                                    </div>
                                  )}
                                  {order.notes && (
                                    <div className="pt-1" style={{borderTop:'1px solid #1a2035'}}>
                                      <p style={{color:'#4a5a7a',marginBottom:2}}>Note:</p>
                                      <p style={{color:'#c0cfe8'}}>{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="space-y-2">
                                <button onClick={()=>startEdit(order)}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-800 transition-all"
                                  style={{background:'linear-gradient(135deg,#10d988,#0a9e62)',color:'#07090f'}}>
                                  <Edit3 size={13}/> Update Order
                                </button>
                                <button onClick={()=>openEmail(order)}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                                  style={{border:'1px solid rgba(56,189,248,0.3)',color:'#38bdf8'}}>
                                  <Mail size={13}/> Email Customer
                                </button>
                                <a href={`${process.env.NEXT_PUBLIC_APP_URL||''}/track?q=${order.orderNumber}`}
                                  target="_blank" rel="noopener"
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                                  style={{border:'1px solid #1a2035',color:'#6b7fa3'}}>
                                  <ExternalLink size={13}/> View on Store
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="px-4 py-2 rounded-xl text-xs font-700 disabled:opacity-30 transition-all hover:bg-white/5"
                  style={{border:'1px solid #1a2035',color:'#c0cfe8'}}>← Prev</button>
                <div className="flex items-center gap-1">
                  {Array.from({length:Math.min(pages,7)},(_,i)=>{
                    const p = i+1
                    return (
                      <button key={p} onClick={()=>setPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-700 transition-all"
                        style={p===page
                          ? {background:'rgba(16,217,136,0.15)',color:'#10d988',border:'1px solid rgba(16,217,136,0.3)'}
                          : {color:'#6b7fa3',border:'1px solid transparent'}}>
                        {p}
                      </button>
                    )
                  })}
                </div>
                <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
                  className="px-4 py-2 rounded-xl text-xs font-700 disabled:opacity-30 transition-all hover:bg-white/5"
                  style={{border:'1px solid #1a2035',color:'#c0cfe8'}}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Email Modal ── */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.85)'}}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{background:'#111520',border:'1px solid #1a2035'}}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Mail size={15} style={{color:'#10d988'}}/> Email Customer
                </h3>
                <p className="text-[11px] mt-0.5" style={{color:'#4a5a7a'}}>
                  Order {emailModal.orderNumber} · {(emailModal.shippingAddress as any)?.email || emailModal.user?.email || 'No email found'}
                </p>
              </div>
              <button onClick={()=>setEmailModal(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                <X size={15} style={{color:'#4a5a7a'}}/>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Subject</label>
                <input value={emailData.subject} onChange={e=>setEmailData(d=>({...d,subject:e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                  style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}
                  onFocus={e=>(e.target.style.borderColor='#10d988')}
                  onBlur={e=>(e.target.style.borderColor='#1a2035')}/>
              </div>
              <div>
                <label className="block text-[10px] font-800 mb-1.5 uppercase tracking-wider" style={{color:'#4a5a7a'}}>Message</label>
                <textarea value={emailData.message} onChange={e=>setEmailData(d=>({...d,message:e.target.value}))}
                  rows={6} placeholder="Write your message…"
                  className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                  style={{background:'#0d1018',border:'1px solid #1a2035',color:'#c0cfe8'}}
                  onFocus={e=>(e.target.style.borderColor='#10d988')}
                  onBlur={e=>(e.target.style.borderColor='#1a2035')}/>
                <p className="text-[10px] mt-1" style={{color:'#2a3356'}}>{emailData.message.length} chars</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={sendEmail} disabled={sendingMail}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-800 transition-all disabled:opacity-60"
                style={{background:'linear-gradient(135deg,#10d988,#0a9e62)',color:'#07090f'}}>
                {sendingMail ? <Loader2 size={13} className="animate-spin"/> : <Send size={13}/>}
                {sendingMail ? 'Sending…' : 'Send Email'}
              </button>
              <button onClick={()=>setEmailModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                style={{border:'1px solid #1a2035',color:'#4a5a7a'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
