import { prisma }          from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { AdminCharts }     from '@/components/admin/AdminCharts'
import { BarChart3, ShoppingBag, Users, Package, DollarSign, Mail, AlertTriangle, Star } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [orders, users, products, revenue, lowStock, recent, msgs] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where:{ isActive:true } }),
    prisma.order.aggregate({ where:{ status:{ not:'CANCELLED' } }, _sum:{ total:true } }),
    prisma.product.count({ where:{ stock:{ lte:5, gt:0 }, isActive:true } }),
    prisma.order.findMany({ orderBy:{ createdAt:'desc' }, take:8, include:{ items:{ take:1, include:{ product:{ select:{ name:true } } } } } }),
  ])
  return { orders, users, products, revenue:revenue._sum.total||0, lowStock, recent, msgs }
}

async function getTopProducts() {
  return prisma.product.findMany({ orderBy:{ reviewCount:'desc' }, take:5, select:{ name:true, brand:true, currentPrice:true, stock:true, rating:true, reviewCount:true, images:true } })
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [s, top] = await Promise.all([getStats(), getTopProducts()])

  const CARDS = [
    { label:'Total Revenue', value:formatPrice(s.revenue), icon:DollarSign, change:'+12.5%', color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/20' },
    { label:'Total Orders',  value:s.orders.toLocaleString(), icon:ShoppingBag, change:'+8.2%', color:'text-cx-violet', bg:'bg-cx-violet/8', border:'border-cx-violet/20' },
    { label:'Customers',     value:s.users.toLocaleString(),  icon:Users,       change:'+5.1%', color:'text-cx-sky', bg:'bg-cx-sky/8', border:'border-cx-sky/20' },
    { label:'Products',      value:s.products.toLocaleString(),icon:Package,    change:`+${s.products}`, color:'text-cx-gold', bg:'bg-cx-gold/8', border:'border-cx-gold/20' },
  ]

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1"><BarChart3 size={18} className="text-cx-emerald"/><span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Admin</span></div>
            <h1 className="font-display font-800 text-3xl text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {s.msgs > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cx-violet/10 border border-cx-violet/20 text-[12px] text-cx-violet"><Mail size={13}/>{s.msgs} new</div>}
            {s.lowStock > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[12px] text-orange-400"><AlertTriangle size={13}/>{s.lowStock} low stock</div>}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {CARDS.map(c => (
            <div key={c.label} className={`p-5 rounded-2xl ${c.bg} border ${c.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}><c.icon size={17} className={c.color}/></div>
                <span className="text-[11px] font-700 text-cx-emerald bg-cx-emerald/10 px-2 py-0.5 rounded-full">{c.change}</span>
              </div>
              <div className={`font-display font-800 text-2xl ${c.color}`}>{c.value}</div>
              <div className="text-[11px] text-cx-muted mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdminCharts />
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl cx-card-flat">
            <h3 className="font-display font-700 text-white mb-4">Recent Orders</h3>
            <div className="space-y-2.5">
              {s.recent.map(o => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-cx-bg border border-cx-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-700 text-cx-text font-mono">{o.orderNumber.slice(0,18)}…</p>
                    <p className="text-[10px] text-cx-muted">{o.items[0]?.product?.name} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] font-700 grad-emerald num">{formatPrice(o.total)}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-700 ${o.status==='DELIVERED'?'bg-cx-emerald/10 text-cx-emerald':o.status==='SHIPPED'?'bg-cx-sky/10 text-cx-sky':o.status==='CANCELLED'?'bg-cx-rose/10 text-cx-rose':'bg-cx-violet/10 text-cx-violet'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl cx-card-flat">
            <h3 className="font-display font-700 text-white mb-4">Top Products</h3>
            <div className="space-y-2.5">
              {top.map((p,i) => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-cx-bg border border-cx-border">
                  <span className="w-5 text-[11px] font-700 text-cx-muted">{i+1}</span>
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-cx-card flex-shrink-0">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-600 text-cx-text truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><Star size={8} className="fill-cx-gold text-cx-gold"/><span className="text-[10px] text-cx-muted">{p.rating} · {p.reviewCount.toLocaleString()}</span></div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] font-700 grad-emerald num">{formatPrice(p.currentPrice)}</p>
                    <p className="text-[10px] text-cx-muted">{p.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
