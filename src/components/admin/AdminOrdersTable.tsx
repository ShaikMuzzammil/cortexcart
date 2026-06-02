'use client'
import { useState } from 'react'
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronDown, Loader2, MapPin } from 'lucide-react'
import Image from 'next/image'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value:'PAYMENT_CONFIRMED', label:'Confirmed',      color:'text-cx-emerald' },
  { value:'PROCESSING',        label:'Processing',     color:'text-cx-sky' },
  { value:'SHIPPED',           label:'Shipped',        color:'text-cx-violet' },
  { value:'OUT_FOR_DELIVERY',  label:'Out for Delivery',color:'text-cx-gold' },
  { value:'DELIVERED',         label:'Delivered',      color:'text-cx-emerald' },
  { value:'CANCELLED',         label:'Cancelled',      color:'text-cx-rose' },
]

export function AdminOrdersTable({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string|null>(null)
  const [trackInputs, setTrackInputs] = useState<Record<string, { tracking:string; carrier:string }>>({})

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const { tracking='', carrier='' } = trackInputs[orderId] || {}
      const res  = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ orderId, status, trackingNumber: tracking||undefined, carrier: carrier||undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, trackingNumber: tracking||o.trackingNumber, carrier: carrier||o.carrier } : o))
      toast.success(`Order updated to "${status}"${status==='SHIPPED'||status==='DELIVERED'?'\nEmail sent to customer!':''}`, {
        style: { background:'#131829', color:'#e8edf8', border:'1px solid #1e2640' },
        duration: 4000,
      })
    } catch(e: any) {
      toast.error(e.message || 'Failed to update order')
    }
    setUpdating(null)
  }

  return (
    <div className="p-6 rounded-3xl cx-card-flat">
      <div className="flex items-center gap-2 mb-5">
        <Package size={15} className="text-cx-emerald"/>
        <h2 className="font-700 text-[15px] text-white">Recent Orders</h2>
        <span className="badge-em text-[10px] ml-1">{orders.length}</span>
      </div>

      <div className="space-y-3">
        {orders.map(order => {
          const cfg = STATUS_OPTIONS.find(s => s.value === order.status)
          return (
            <div key={order.id} className="p-4 rounded-2xl bg-cx-surface border border-cx-border hover:border-cx-emerald/15 transition-all">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-700 text-[12px] text-cx-emerald">#{order.orderNumber}</span>
                    <span className={cn('text-[10px] font-700 px-2 py-0.5 rounded-full border', cfg?.color, 'bg-transparent border-current')}>
                      {cfg?.label || order.status}
                    </span>
                    {order.paymentMethod === 'cod' && (
                      <span className="badge-gold text-[9px] py-0.5">COD</span>
                    )}
                  </div>
                  <p className="text-[12px] text-cx-muted">
                    {order.user?.name || `${(order.shippingAddress as any)?.firstName||''} ${(order.shippingAddress as any)?.lastName||''}`.trim() || 'Guest'}
                    {' · '}{order.user?.email || (order.shippingAddress as any)?.email || '—'}
                  </p>
                  <p className="text-[11px] text-cx-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' })}
                    {' · '}{order.items?.length} item(s)
                    {' · '}<span className="text-cx-text font-700">{formatPrice(order.total)}</span>
                  </p>
                </div>

                {/* Items thumbnails */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {order.items?.slice(0,3).map((item: any, i: number) => (
                    <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden bg-cx-card border border-cx-border flex-shrink-0">
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product?.name||''} className="w-full h-full object-cover"/>
                        : <div className="flex items-center justify-center h-full text-sm">📦</div>}
                    </div>
                  ))}
                  {(order.items?.length||0) > 3 && (
                    <div className="w-10 h-10 rounded-lg bg-cx-card border border-cx-border flex items-center justify-center text-[10px] text-cx-muted font-700">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Status update controls */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-cx-border/60">
                  {(order.status === 'PAYMENT_CONFIRMED' || order.status === 'PROCESSING') && (
                    <>
                      <input
                        placeholder="Carrier (e.g. FedEx)"
                        value={trackInputs[order.id]?.carrier || ''}
                        onChange={e => setTrackInputs(p => ({ ...p, [order.id]: { ...p[order.id], carrier: e.target.value } }))}
                        className="cx-input px-3 py-1.5 text-[11px] rounded-xl flex-1 min-w-[120px]"/>
                      <input
                        placeholder="Tracking number"
                        value={trackInputs[order.id]?.tracking || ''}
                        onChange={e => setTrackInputs(p => ({ ...p, [order.id]: { ...p[order.id], tracking: e.target.value } }))}
                        className="cx-input px-3 py-1.5 text-[11px] rounded-xl flex-1 min-w-[140px]"/>
                    </>
                  )}
                  {STATUS_OPTIONS.filter(s => {
                    const order_step = STATUS_OPTIONS.findIndex(o => o.value === order.status)
                    const s_step = STATUS_OPTIONS.findIndex(o => o.value === s.value)
                    return s_step > order_step
                  }).slice(0, 3).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateStatus(order.id, opt.value)}
                      disabled={updating === order.id}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-[11px] font-700 border transition-all flex items-center gap-1.5',
                        opt.value === 'CANCELLED' ? 'border-cx-rose/30 text-cx-rose hover:bg-cx-rose/10' : 'border-cx-emerald/30 text-cx-emerald hover:bg-cx-emerald/10'
                      )}>
                      {updating === order.id ? <Loader2 size={10} className="animate-spin"/> : null}
                      → {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Delivered badge */}
              {order.status === 'DELIVERED' && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-cx-border/60 text-[11px] text-cx-emerald">
                  <CheckCircle2 size={12}/> Delivered · Email sent to customer
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
