import { prisma }      from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, Clock, Truck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

const S: Record<string,{label:string;color:string;bg:string}> = {
  PENDING:          {label:'Pending',       color:'text-cx-gold',    bg:'bg-cx-gold/10'},
  PROCESSING:       {label:'Processing',    color:'text-cx-sky',     bg:'bg-cx-sky/10'},
  SHIPPED:          {label:'Shipped',       color:'text-cx-violet',  bg:'bg-cx-violet/10'},
  DELIVERED:        {label:'Delivered',     color:'text-cx-emerald', bg:'bg-cx-emerald/10'},
  CANCELLED:        {label:'Cancelled',     color:'text-cx-rose',    bg:'bg-cx-rose/10'},
  OUT_FOR_DELIVERY: {label:'Out for Del.',  color:'text-cx-sky',     bg:'bg-cx-sky/10'},
  REFUNDED:         {label:'Refunded',      color:'text-cx-muted',   bg:'bg-cx-surface'},
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { items: { include: { product: { select:{ name:true } } } } }
  })
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-2xl text-white flex items-center gap-2"><Package size={20} className="text-cx-emerald"/> Manage Orders</h1>
        <p className="text-cx-muted text-[13px] mt-1">{orders.length} total orders</p>
      </div>
      <div className="cx-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cx-border text-[11px] text-cx-muted uppercase tracking-wide">
                <th className="text-left px-5 py-3">Order #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cx-border/50">
              {orders.map((o: any) => {
                const cfg = S[o.status] || S['PENDING']
                const addr = o.shippingAddress as any
                return (
                  <tr key={o.id} className="hover:bg-cx-surface/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-[12px] text-cx-emerald font-700">#{o.orderNumber?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-600 text-white">{addr?.firstName} {addr?.lastName}</p>
                      <p className="text-[11px] text-cx-muted">{addr?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-cx-dim">{o.items.length} item{o.items.length!==1?'s':''}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-700 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-600 ${o.paymentMethod==='cod'?'text-cx-gold':'text-cx-emerald'}`}>
                        {o.paymentMethod==='cod'?'COD':'Online'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-[13px] font-700 text-cx-emerald">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-[11px] text-cx-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
