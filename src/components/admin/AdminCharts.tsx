'use client'
import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react'

export function AdminCharts() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])

  const weekly = [
    { day:'Mon', orders:12, revenue:1840 },
    { day:'Tue', orders:19, revenue:2970 },
    { day:'Wed', orders:15, revenue:2250 },
    { day:'Thu', orders:24, revenue:3820 },
    { day:'Fri', orders:31, revenue:4920 },
    { day:'Sat', orders:28, revenue:4120 },
    { day:'Sun', orders:22, revenue:3340 },
  ]
  const maxOrders  = Math.max(...weekly.map(d => d.orders))
  const maxRevenue = Math.max(...weekly.map(d => d.revenue))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Orders chart */}
      <div className="p-6 rounded-3xl cx-card-flat">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={15} className="text-cx-emerald"/>
          <span className="font-700 text-[13px] text-cx-text">Weekly Orders</span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {weekly.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-cx-muted font-600 num">{d.orders}</span>
              <div className="w-full rounded-t-lg bg-cx-emerald/20 transition-all duration-700 overflow-hidden"
                style={{ height: `${(d.orders / maxOrders) * 100}%` }}>
                <div className="h-full w-full rounded-t-lg bg-gradient-to-t from-cx-emerald/80 to-cx-emerald transition-all duration-1000"
                  style={{ transform: loaded ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'bottom', transitionDelay: `${i * 80}ms` }}/>
              </div>
              <span className="text-[9px] text-cx-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="p-6 rounded-3xl cx-card-flat">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={15} className="text-cx-gold"/>
          <span className="font-700 text-[13px] text-cx-text">Weekly Revenue</span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {weekly.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-cx-muted font-600 num">${(d.revenue/1000).toFixed(1)}k</span>
              <div className="w-full rounded-t-lg bg-cx-gold/20 transition-all duration-700 overflow-hidden"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}>
                <div className="h-full w-full rounded-t-lg bg-gradient-to-t from-cx-gold/80 to-cx-gold transition-all duration-1000"
                  style={{ transform: loaded ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'bottom', transitionDelay: `${i * 80}ms` }}/>
              </div>
              <span className="text-[9px] text-cx-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
