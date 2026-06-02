export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { AdminCharts } from '@/components/admin/AdminCharts'
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable'
import { BarChart3, ShoppingBag, Users, Package, DollarSign, Mail, AlertTriangle, Star, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [totalOrders, totalUsers, totalProducts, totalRevenue, recentOrders, lowStock, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where:{ isActive:true } }),
    prisma.order.aggregate({ _sum:{ total:true }, where:{ paymentStatus:'paid' } }),
    prisma.order.findMany({
      take:10, orderBy:{ createdAt:'desc' },
      include: {
        user: { select:{ name:true, email:true } },
        items: { include:{ product:{ select:{ name:true, images:true } } } },
      },
    }),
    prisma.product.count({ where:{ stock:{ lte:5 }, isActive:true } }),
    prisma.order.count({ where:{ status:'PAYMENT_CONFIRMED' } }),
  ])
  return { totalOrders, totalUsers, totalProducts, totalRevenue:totalRevenue._sum.total||0, recentOrders, lowStock, pendingOrders }
}

async function getTopProducts() {
  return prisma.product.findMany({ orderBy:{ reviewCount:'desc' }, take:5, select:{ name:true, brand:true, currentPrice:true, stock:true, rating:true, reviewCount:true, images:true } })
}

export default async function AdminPage() {
  const [s, top] = await Promise.all([getStats(), getTopProducts()])

  const STATS = [
    { label:'Total Revenue',  value:formatPrice(s.totalRevenue), sub:`${s.totalOrders} orders`, icon:DollarSign, color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/15' },
    { label:'Total Orders',   value:s.totalOrders.toLocaleString(), sub:`${s.pendingOrders} pending`, icon:ShoppingBag, color:'text-cx-sky', bg:'bg-cx-sky/8', border:'border-cx-sky/15' },
    { label:'Customers',      value:s.totalUsers.toLocaleString(),  sub:'registered accounts',  icon:Users, color:'text-cx-violet', bg:'bg-cx-violet/8', border:'border-cx-violet/15' },
    { label:'Products',       value:s.totalProducts.toLocaleString(), sub:`${s.lowStock} low stock`, icon:Package, color:'text-cx-gold', bg:'bg-cx-gold/8', border:'border-cx-gold/15' },
  ]

  return (
    <div className="page-enter min-h-screen pb-24 px-4 sm:px-6 lg:px-8 pt-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-cx-emerald"/>
              <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Admin Dashboard</span>
            </div>
            <h1 className="font-display font-800 text-3xl text-white">CortexCart Control</h1>
          </div>
          <div className="flex gap-3">
            {s.pendingOrders > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cx-gold/10 border border-cx-gold/25 text-[12px] text-cx-gold font-600">
                <AlertTriangle size={13}/> {s.pendingOrders} orders need action
              </div>
            )}
            {s.lowStock > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cx-rose/10 border border-cx-rose/25 text-[12px] text-cx-rose font-600">
                <AlertTriangle size={13}/> {s.lowStock} low stock
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(stat => (
            <div key={stat.label} className={`p-5 rounded-2xl ${stat.bg} border ${stat.border} hover:-translate-y-1 transition-all duration-300`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color}/>
              </div>
              <p className="font-display font-800 text-2xl text-white">{stat.value}</p>
              <p className="text-[11px] font-700 text-cx-text mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-cx-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8">
          <AdminCharts/>
        </div>

        {/* Orders Table with Status Update */}
        <div className="mb-8">
          <AdminOrdersTable orders={s.recentOrders}/>
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-3xl cx-card-flat">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-cx-emerald"/>
            <h2 className="font-700 text-[15px] text-white">Top Products</h2>
          </div>
          <div className="space-y-3">
            {top.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4 p-3 rounded-xl bg-cx-surface border border-cx-border hover:border-cx-emerald/20 transition-all">
                <span className="text-[11px] font-700 text-cx-muted w-5 text-center">{i+1}</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cx-card flex-shrink-0 border border-cx-border">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                  ) : <div className="flex items-center justify-center h-full text-lg">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-cx-text truncate">{p.name}</p>
                  <p className="text-[10px] text-cx-muted">{p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-700 grad-emerald num">{formatPrice(p.currentPrice)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={9} className="fill-cx-gold text-cx-gold"/>
                    <span className="text-[10px] text-cx-muted">{p.rating} · {p.reviewCount.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`text-[10px] font-700 px-2 py-1 rounded-lg ${p.stock<=5?'text-cx-rose bg-cx-rose/10':'text-cx-emerald bg-cx-emerald/10'}`}>
                  {p.stock} left
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
