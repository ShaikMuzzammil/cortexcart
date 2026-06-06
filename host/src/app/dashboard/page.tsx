'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Package, Search, RefreshCw, LogOut, ChevronDown, ChevronUp,
  Copy, Check, Mail, Truck, Clock, CreditCard, CheckCircle2,
  XCircle, MapPin, Calendar, Edit3, Save, X, Send, Loader2,
  Zap, Users, DollarSign, TrendingUp, Box, ExternalLink, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  'PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING',
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'
]

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed', PAYMENT_CONFIRMED: 'Payment Confirmed',
  PROCESSING: 'Processing', SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', REFUNDED: 'Refunded',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:           'bg-gray-500/15 text-gray-400 border-gray-500/20',
  PAYMENT_CONFIRMED: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  PROCESSING:        'bg-sky-500/15 text-sky-400 border-sky-500/20',
  SHIPPED:           'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  OUT_FOR_DELIVERY:  'bg-orange-500/15 text-orange-400 border-orange-500/20',
  DELIVERED:         'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CANCELLED:         'bg-red-500/15 text-red-400 border-red-500/20',
  REFUNDED:          'bg-pink-500/15 text-pink-400 border-pink-500/20',
}

const STATUS_EMOJIS: Record<string, string> = {
  PENDING: '📋', PAYMENT_CONFIRMED: '✅', PROCESSING: '⚙️',
  SHIPPED: '🚚', OUT_FOR_DELIVERY: '🛵', DELIVERED: '🎉',
  CANCELLED: '❌', REFUNDED: '💰',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Order {
  id: string; orderNumber: string; status: string; total: number
  subtotal: number; tax: number; shipping: number
  paymentMethod: string; paymentStatus: string
  shippingAddress: any; estimatedDelivery: string | null
  trackingNumber: string | null; carrier: string | null; notes: string | null
  createdAt: string; user: { name: string | null; email: string | null } | null
  items: { id: string; quantity: number; unitPrice: number; totalPrice: number
    product: { name: string; images: string[]; slug: string; brand: string | null } }[]
}

export default function Dashboard() {
  const router = useRouter()
  const [orders,     setOrders]     = useState<Order[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [search,     setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [editing,    setEditing]    = useState<string | null>(null)
  const [copied,     setCopied]     = useState<string | null>(null)
  const [emailModal, setEmailModal] = useState<Order | null>(null)

  // Edit state
  const [editStatus,    setEditStatus]    = useState('')
  const [editTracking,  setEditTracking]  = useState('')
  const [editCarrier,   setEditCarrier]   = useState('')
  const [editDelivery,  setEditDelivery]  = useState('')
  const [editNotes,     setEditNotes]     = useState('')
  const [saving,        setSaving]        = useState(false)

  // Email state
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search)       params.set('q', search)
      if (filterStatus) params.set('status', filterStatus)
      const res  = await fetch(`/api/orders?${params}`)
      if (res.status === 401) { router.push('/'); return }
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { toast.error('Failed to load orders') }
    setLoading(false)
  }, [page, search, filterStatus])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const startEdit = (o: Order) => {
    setEditing(o.id)
    setEditStatus(o.status)
    setEditTracking(o.trackingNumber || '')
    setEditCarrier(o.carrier || '')
    setEditDelivery(o.estimatedDelivery ? new Date(o.estimatedDelivery).toISOString().slice(0, 10) : '')
    setEditNotes(o.notes || '')
  }

  const saveEdit = async (orderId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status:            editStatus || undefined,
          trackingNumber:    editTracking || undefined,
          carrier:           editCarrier || undefined,
          estimatedDelivery: editDelivery || undefined,
          notes:             editNotes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Order updated! Email sent to customer ✓')
      setEditing(null)
      fetchOrders()
    } catch { toast.error('Failed to update order') }
    setSaving(false)
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  const sendCustomEmail = async () => {
    if (!emailModal || !emailSubject || !emailMessage) {
      toast.error('Fill in subject and message')
      return
    }
    setSendingEmail(true)
    try {
      const customerEmail = (emailModal.shippingAddress as any)?.email || emailModal.user?.email
      if (!customerEmail) throw new Error('No email address found')
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: emailSubject,
          message: emailMessage,
          orderNumber: emailModal.orderNumber,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      toast.success('Email sent!')
      setEmailModal(null)
      setEmailSubject('')
      setEmailMessage('')
    } catch (e: any) { toast.error(e.message) }
    setSendingEmail(false)
  }

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  // Stats
  const stats = {
    total:     orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0),
    pending:   orders.filter(o => o.status === 'PENDING').length,
    shipped:   orders.filter(o => o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#07090f' }}>
      {/* Top Bar */}
      <div style={{ background: '#0d1018', borderBottom: '1px solid #1a2035' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10d988,#38bdf8)' }}>
              <Zap size={16} className="text-black" />
            </div>
            <div>
              <span className="font-black text-white text-sm">CortexCart <span style={{ color: '#10d988' }}>Host</span></span>
              <span className="text-xs ml-2" style={{ color: '#4a5a7a' }}>Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#4a5a7a' }}>{total} total orders</span>
            <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <RefreshCw size={14} style={{ color: '#4a5a7a' }} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-red-500/10"
              style={{ color: '#f43f6e', border: '1px solid rgba(244,63,110,0.2)' }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Revenue (visible)', val: formatPrice(stats.total), icon: DollarSign, color: '#10d988' },
            { label: 'Pending Orders',    val: String(stats.pending),    icon: Clock,       color: '#f5b731' },
            { label: 'In Transit',        val: String(stats.shipped),    icon: Truck,       color: '#38bdf8' },
            { label: 'Delivered',         val: String(stats.delivered),  icon: CheckCircle2,color: '#10d988' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px] font-700 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>{s.label}</p>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5a7a' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search order # or customer..."
              className="input pl-9 text-xs" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="input w-auto text-xs px-3 py-2.5">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={() => { setSearch(''); setFilterStatus(''); setPage(1) }}
            className="px-3 py-2.5 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
            style={{ border: '1px solid #1a2035', color: '#4a5a7a' }}>
            Clear
          </button>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: '#10d988' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package size={40} className="mx-auto mb-3" style={{ color: '#2a3356' }} />
            <p style={{ color: '#4a5a7a' }}>No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const isOpen    = expanded === order.id
              const isEditing = editing === order.id
              const customerEmail = (order.shippingAddress as any)?.email || order.user?.email
              const customerName  = order.user?.name || `${(order.shippingAddress as any)?.firstName || ''} ${(order.shippingAddress as any)?.lastName || ''}`.trim()

              return (
                <div key={order.id} className="card overflow-hidden transition-all duration-200 hover:border-emerald-500/20"
                  style={{ borderColor: isOpen ? 'rgba(16,217,136,0.2)' : undefined }}>

                  {/* Order Header Row */}
                  <div className="p-4 flex items-center gap-3 flex-wrap">
                    <button onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(16,217,136,0.1)' }}>
                        <Clock size={14} style={{ color: '#10d988' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm" style={{ color: '#10d988' }}>{order.orderNumber}</span>
                          <button onClick={e => { e.stopPropagation(); copyText(order.orderNumber, order.id + 'num') }}
                            className="p-1 rounded transition-colors hover:bg-white/5 flex-shrink-0">
                            {copied === order.id + 'num' ? <Check size={11} style={{ color: '#10d988' }} /> : <Copy size={11} style={{ color: '#4a5a7a' }} />}
                          </button>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#4a5a7a' }}>
                          {customerName || 'Guest'} {customerEmail ? `· ${customerEmail}` : ''}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                      <span className={`badge border text-[11px] ${STATUS_COLORS[order.status]}`}>
                        {STATUS_EMOJIS[order.status]} {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#e8edf8' }}>{formatPrice(order.total)}</span>
                      <span className="text-xs" style={{ color: '#4a5a7a' }}>{timeAgo(order.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEmailModal(order); setEmailSubject(`Re: Order ${order.orderNumber}`) }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Send email">
                          <Mail size={14} style={{ color: '#4a5a7a' }} />
                        </button>
                        <button onClick={() => isEditing ? setEditing(null) : startEdit(order)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Edit order">
                          {isEditing ? <X size={14} style={{ color: '#f43f6e' }} /> : <Edit3 size={14} style={{ color: '#4a5a7a' }} />}
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : order.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                          {isOpen ? <ChevronUp size={14} style={{ color: '#4a5a7a' }} /> : <ChevronDown size={14} style={{ color: '#4a5a7a' }} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit Panel */}
                  {isEditing && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: '#1a2035', background: 'rgba(16,217,136,0.03)' }}>
                      <div className="pt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Status *</label>
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input text-xs">
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_EMOJIS[s]} {STATUS_LABELS[s]}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Estimated Delivery</label>
                          <input type="date" value={editDelivery} onChange={e => setEditDelivery(e.target.value)} className="input text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Tracking Number</label>
                          <input value={editTracking} onChange={e => setEditTracking(e.target.value)} placeholder="e.g. 1Z999AA..." className="input text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Carrier</label>
                          <input value={editCarrier} onChange={e => setEditCarrier(e.target.value)} placeholder="e.g. FedEx, UPS, DHL..." className="input text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Note to Customer</label>
                          <input value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Optional note sent in status email..." className="input text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => saveEdit(order.id)} disabled={saving}
                          className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          {saving ? 'Saving...' : 'Save & Notify Customer'}
                        </button>
                        <button onClick={() => setEditing(null)}
                          className="px-3 py-2 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                          style={{ border: '1px solid #1a2035', color: '#4a5a7a' }}>
                          Cancel
                        </button>
                      </div>
                      <p className="text-[10px] mt-2" style={{ color: '#2a3356' }}>
                        ✉️ An automatic email will be sent to {customerEmail || 'the customer'} when you save
                      </p>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isOpen && !isEditing && (
                    <div className="border-t" style={{ borderColor: '#1a2035' }}>
                      <div className="p-4 grid md:grid-cols-3 gap-4">
                        {/* Items */}
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: '#4a5a7a' }}>
                            ITEMS ORDERED ({order.items.length})
                          </p>
                          <div className="space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: '#0d1018' }}>
                                {item.product?.images?.[0] && (
                                  <img src={item.product.images[0]} alt={item.product.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    style={{ border: '1px solid #1a2035' }} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-700 truncate" style={{ color: '#e8edf8' }}>{item.product.name}</p>
                                  <p className="text-[11px]" style={{ color: '#4a5a7a' }}>Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                </div>
                                <span className="text-xs font-bold" style={{ color: '#10d988' }}>{formatPrice(item.totalPrice)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Price summary */}
                          <div className="mt-3 pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #1a2035' }}>
                            <div className="flex justify-between" style={{ color: '#4a5a7a' }}><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                            <div className="flex justify-between" style={{ color: '#4a5a7a' }}><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
                            <div className="flex justify-between" style={{ color: '#4a5a7a' }}><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                            <div className="flex justify-between font-bold text-sm pt-1" style={{ borderTop: '1px solid #1a2035', color: '#10d988' }}>
                              <span>Total</span><span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery + Info */}
                        <div className="space-y-4">
                          {order.shippingAddress && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#4a5a7a' }}>
                                <MapPin className="inline w-3 h-3 mr-1" />DELIVERY ADDRESS
                              </p>
                              <div className="text-xs space-y-0.5 p-3 rounded-xl" style={{ background: '#0d1018' }}>
                                <p className="font-700" style={{ color: '#e8edf8' }}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p style={{ color: '#6b7fa3' }}>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p style={{ color: '#6b7fa3' }}>{order.shippingAddress.line2}</p>}
                                <p style={{ color: '#6b7fa3' }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                <p style={{ color: '#6b7fa3' }}>{order.shippingAddress.country}</p>
                                {order.shippingAddress.phone && <p style={{ color: '#6b7fa3' }}>📞 {order.shippingAddress.phone}</p>}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#4a5a7a' }}>ORDER INFO</p>
                            <div className="text-xs space-y-1.5 p-3 rounded-xl" style={{ background: '#0d1018' }}>
                              <div className="flex justify-between">
                                <span style={{ color: '#4a5a7a' }}>Payment</span>
                                <span className="font-700" style={{ color: '#e8edf8' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                              </div>
                              {order.estimatedDelivery && (
                                <div className="flex justify-between">
                                  <span style={{ color: '#4a5a7a' }}>Est. Delivery</span>
                                  <span style={{ color: '#10d988', fontWeight: 700 }}>{formatDate(order.estimatedDelivery)}</span>
                                </div>
                              )}
                              {order.trackingNumber && (
                                <div className="flex justify-between items-center">
                                  <span style={{ color: '#4a5a7a' }}>Tracking</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-[11px]" style={{ color: '#e8edf8' }}>{order.trackingNumber}</span>
                                    <button onClick={() => copyText(order.trackingNumber!, order.id + 'track')}>
                                      {copied === order.id + 'track' ? <Check size={10} style={{ color: '#10d988' }} /> : <Copy size={10} style={{ color: '#4a5a7a' }} />}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {order.carrier && (
                                <div className="flex justify-between">
                                  <span style={{ color: '#4a5a7a' }}>Carrier</span>
                                  <span style={{ color: '#e8edf8' }}>{order.carrier}</span>
                                </div>
                              )}
                              {order.notes && (
                                <div className="pt-1" style={{ borderTop: '1px solid #1a2035' }}>
                                  <span style={{ color: '#4a5a7a' }}>Note: </span>
                                  <span style={{ color: '#c0cfe8' }}>{order.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => startEdit(order)}
                              className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2">
                              <Edit3 size={12} /> Update Order
                            </button>
                            <button onClick={() => { setEmailModal(order); setEmailSubject(`Re: Order ${order.orderNumber}`) }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                              style={{ border: '1px solid #1a2035', color: '#38bdf8' }}>
                              <Mail size={12} /> Email
                            </button>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs font-700 disabled:opacity-30 transition-all hover:bg-white/5"
              style={{ border: '1px solid #1a2035', color: '#c0cfe8' }}>← Prev</button>
            <span className="text-xs px-4" style={{ color: '#4a5a7a' }}>Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 rounded-xl text-xs font-700 disabled:opacity-30 transition-all hover:bg-white/5"
              style={{ border: '1px solid #1a2035', color: '#c0cfe8' }}>Next →</button>
          </div>
        )}
      </div>

      {/* Custom Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-lg card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Mail size={16} style={{ color: '#10d988' }} /> Send Email to Customer
              </h3>
              <button onClick={() => setEmailModal(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <X size={16} style={{ color: '#4a5a7a' }} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>To</label>
                <div className="input text-xs" style={{ color: '#10d988', fontFamily: 'monospace' }}>
                  {(emailModal.shippingAddress as any)?.email || emailModal.user?.email || 'No email found'}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Subject</label>
                <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="input text-xs"
                  placeholder="Email subject..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#4a5a7a' }}>Message</label>
                <textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={5}
                  placeholder="Write your message to the customer..." className="input text-xs resize-none" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={sendCustomEmail} disabled={sendingEmail}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5 disabled:opacity-60">
                {sendingEmail ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={() => setEmailModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-700 transition-all hover:bg-white/5"
                style={{ border: '1px solid #1a2035', color: '#4a5a7a' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
