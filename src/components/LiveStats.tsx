'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, Users, ShoppingBag, Zap } from 'lucide-react'

export function LiveStats() {
  const [count, setCount] = useState({ orders: 12847, viewing: 342, saved: 8921 })

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => ({
        orders:  c.orders  + Math.floor(Math.random() * 3),
        viewing: Math.max(200, c.viewing + Math.floor((Math.random() - 0.4) * 15)),
        saved:   c.saved   + Math.floor(Math.random() * 5),
      }))
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag, label: 'Orders Today',       value: count.orders.toLocaleString(),  color: 'text-cx-emerald', bg: 'bg-cx-emerald/8', border: 'border-cx-emerald/15' },
            { icon: Users,       label: 'Shopping Right Now', value: count.viewing.toLocaleString(), color: 'text-cx-sky',     bg: 'bg-cx-sky/8',     border: 'border-cx-sky/15' },
            { icon: TrendingUp,  label: 'Items Wishlisted',   value: count.saved.toLocaleString(),   color: 'text-cx-violet',  bg: 'bg-cx-violet/8',  border: 'border-cx-violet/15' },
          ].map(stat => (
            <div key={stat.label} className={`flex items-center gap-4 p-4 rounded-2xl ${stat.bg} border ${stat.border}`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className={`font-display font-800 text-xl num ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-cx-muted font-600">{stat.label}</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1 text-[10px] text-cx-emerald font-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-cx-emerald animate-pulse-soft" />
                  Live
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
