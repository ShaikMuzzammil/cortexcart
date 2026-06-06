'use client'
import { useEffect, useRef } from 'react'
import type { Chart as ChartType } from 'chart.js'

export function AdminCharts() {
  const r1 = useRef<HTMLCanvasElement>(null)
  const r2 = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let c1: ChartType | undefined
    let c2: ChartType | undefined

    const init = async () => {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul']
      const rev    = [18400,22100,19800,31200,42500,38900,29300,35600,41200,47800,52300,61400]
      const ords   = [124,148,133,210,287,262,197,241,278,322,353,414]

      if (r1.current) {
        c1 = new Chart(r1.current, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Revenue',
              data: rev,
              borderColor: '#10d988',
              backgroundColor: 'rgba(16,217,136,0.07)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#10d988',
              pointRadius: 3,
              pointHoverRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#131829',
                borderColor: '#1e2640',
                borderWidth: 1,
                titleColor: '#e8edf8',
                bodyColor: '#10d988',
                callbacks: { label: (c) => ` $${(c.raw as number).toLocaleString()}` },
              },
            },
            scales: {
              x: { grid: { color: 'rgba(30,38,64,0.4)' }, ticks: { color: '#5a6a8a', font: { size: 10 } } },
              y: { grid: { color: 'rgba(30,38,64,0.4)' }, ticks: { color: '#5a6a8a', font: { size: 10 }, callback: (v) => `$${(Number(v)/1000).toFixed(0)}k` } },
            },
          },
        })
      }

      if (r2.current) {
        c2 = new Chart(r2.current, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [{
              label: 'Orders',
              data: ords,
              backgroundColor: 'rgba(139,92,246,0.5)',
              borderColor: '#8b5cf6',
              borderWidth: 1,
              borderRadius: 5,
              borderSkipped: false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#131829',
                borderColor: '#1e2640',
                borderWidth: 1,
                titleColor: '#e8edf8',
                bodyColor: '#8b5cf6',
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#5a6a8a', font: { size: 10 } } },
              y: { grid: { color: 'rgba(30,38,64,0.4)' }, ticks: { color: '#5a6a8a', font: { size: 10 } } },
            },
          },
        })
      }
    }

    init()
    return () => { c1?.destroy(); c2?.destroy() }
  }, [])

  return (
    <>
      <div className="p-5 rounded-2xl cx-card-flat">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-700 text-white text-[14px]">Revenue (12 months)</h3>
          <span className="text-[11px] text-cx-emerald bg-cx-emerald/10 px-2 py-0.5 rounded-full">+32.4% YoY</span>
        </div>
        <div className="h-48"><canvas ref={r1} /></div>
      </div>
      <div className="p-5 rounded-2xl cx-card-flat">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-700 text-white text-[14px]">Orders (12 months)</h3>
          <span className="text-[11px] text-cx-emerald bg-cx-emerald/10 px-2 py-0.5 rounded-full">+28.1% YoY</span>
        </div>
        <div className="h-48"><canvas ref={r2} /></div>
      </div>
    </>
  )
}