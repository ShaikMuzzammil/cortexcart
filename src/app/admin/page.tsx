import { prisma }          from '@/lib/prisma'
import { formatPrice }     from '@/lib/utils'
import { BarChart3, ShoppingBag, Users, Package, DollarSign, AlertTriangle, TrendingUp, Clock, Star, ArrowRight, Eye, CheckCircle2, Truck } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [orders, users, products, revenue, lowStock, recent, pending] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where:{ isActive:true } }),
    prisma.order.aggregate({ where:{ status:{ not:'CANCELLED' } }, _sum:{ total:true } }),
    prisma.product.count({ where:{ stock:{ lte:5, gt:0 }, isActive:true } }),
    prisma.order.findMany({ orderBy:{ createdAt:'desc' }, take:10,
      include:{ items:{ take:1, include:{ product:{ select:{ name:true, images:true } } } } } }),
    prisma.order.count({ where:{ status:'PENDING' } }),
  ])
  return { orders, users, products, revenue:revenue._sum.total||0, lowStock, recent, pending }
}

async function getTopProducts() {
  return prisma.product.findMany({
    orderBy:{ reviewCount:'desc' }, take:6,
    select:{ id:true, name:true, brand:true, currentPrice:true, stock:true, rating:true, reviewCount:true, images:true, slug:true }
  })
}

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label:string; color:string; bg:string; icon:any }> = {
  PENDING:          { label:'Pending',       color:'text-cx-gold',    bg:'bg-cx-gold/10',    icon: Clock },
  PROCESSING:       { label:'Processing',    color:'text-cx-sky',     bg:'bg-cx-sky/10',     icon: Clock },
  SHIPPED:          { label:'Shipped',       color:'text-cx-violet',  bg:'bg-cx-violet/10',  icon: Truck },
  DELIVERED:        { label:'Delivered',     color:'text-cx-emerald', bg:'bg-cx-emerald/10', icon: CheckCircle2 },
  CANCELLED:        { label:'Cancelled',     color:'text-cx-rose',    bg:'bg-cx-rose/10',    icon: AlertTriangle },
  OUT_FOR_DELIVERY: { label:'Out Delivery',  color:'text-cx-sky',     bg:'bg-cx-sky/10',     icon: Truck },
}

export default async function AdminPage() {
  const [s, top] = await Promise.all([getStats(), getTopProducts()])

  const CARDS = [
    { label:'Total Revenue', value:formatPrice(s.revenue),          icon:DollarSign, change:'+12.5%', color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/20' },
    { label:'Total Orders',  value:s.orders.toLocaleString(),        icon:ShoppingBag,change:'+8.2%',  color:'text-cx-violet', bg:'bg-cx-violet/8', border:'border-cx-violet/20' },
    { label:'Customers',     value:s.users.toLocaleString(),         icon:Users,      change:'+5.1%',  color:'text-cx-sky',    bg:'bg-cx-sky/8',    border:'border-cx-sky/20' },
    { label:'Active Products',value:s.products.toLocaleString(),     icon:Package,    change:'Catalog', color:'text-cx-gold',  bg:'bg-cx-gold/8',   border:'border-cx-gold/20' },
  ]

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-cx-emerald"/>
              <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Admin</span>
            </div>
            <h1 className="font-display font-800 text-3xl text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {s.pending > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cx-gold/10 border border-cx-gold/20 text-[12px] text-cx-gold">
                <Clock size={13}/>{s.pending} pending
              </div>
            )}
            {s.lowStock > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[12px] text-orange-400">
                <AlertTriangle size={13}/>{s.lowStock} low stock
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CARDS.map(card => (
            <div key={card.label} className={`cx-card p-5 border ${card.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color}/>
                </div>
                <span className={`text-[11px] font-700 px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}>
                  {card.change}
                </span>
              </div>
              <p className="text-[22px] font-display font-800 text-white">{card.value}</p>
              <p className="text-[12px] text-cx-muted mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Recent Orders */}
          <div className="cx-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cx-border">
              <h2 className="font-700 text-[15px] text-white flex items-center gap-2">
                <ShoppingBag size={15} className="text-cx-emerald"/> Recent Orders
              </h2>
              <Link href="/admin/orders" className="text-[12px] text-cx-emerald flex items-center gap-1 hover:underline">
                View all <ArrowRight size={11}/>
              </Link>
            </div>
            <div className="divide-y divide-cx-border/50">
              {s.recent.map((order: any) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING']
                const Icon = cfg.icon
                return (
                  <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-cx-surface/30 transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} className={cfg.color}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-700 text-white font-mono">#{order.orderNumber?.slice(-8).toUpperCase()}</p>
                        <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-cx-muted truncate">{order.items[0]?.product?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-700 text-cx-emerald">{formatPrice(order.total)}</p>
                      <p className="text-[10px] text-cx-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="cx-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cx-border">
              <h2 className="font-700 text-[15px] text-white flex items-center gap-2">
                <TrendingUp size={15} className="text-cx-emerald"/> Top Products
              </h2>
              <Link href="/admin/products" className="text-[12px] text-cx-emerald flex items-center gap-1 hover:underline">
                Manage <ArrowRight size={11}/>
              </Link>
            </div>
            <div className="divide-y divide-cx-border/50">
              {top.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-cx-surface/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-cx-surface border border-cx-border flex-shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-700 text-white truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star size={10} className="text-cx-gold fill-cx-gold"/>
                      <span className="text-[10px] text-cx-muted">{p.rating} ({p.reviewCount})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] font-700 text-cx-emerald">{formatPrice(p.currentPrice)}</p>
                    <p className={`text-[10px] font-600 ${p.stock <= 5 ? 'text-cx-rose' : 'text-cx-muted'}`}>
                      {p.stock <= 5 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Admin Links */}
        <div className="grid sm:grid-cols-4 gap-4 mt-6">
          {[
            { href:'/admin/orders',   label:'Manage Orders',   icon:ShoppingBag, color:'text-cx-emerald' },
            { href:'/admin/products', label:'Manage Products', icon:Package,     color:'text-cx-violet' },
            { href:'/admin/users',    label:'Manage Users',    icon:Users,       color:'text-cx-sky' },
            { href:'/admin/emails',   label:'Email Events',    icon:TrendingUp,  color:'text-cx-gold' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="cx-card p-4 flex items-center gap-3 hover:border-cx-emerald/30 transition-all group">
              <link.icon size={16} className={`${link.color} group-hover:scale-110 transition-transform`}/>
              <span className="text-[13px] font-600 text-cx-dim group-hover:text-white transition-colors">{link.label}</span>
              <ArrowRight size={12} className="text-cx-muted ml-auto group-hover:text-cx-emerald transition-colors"/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
