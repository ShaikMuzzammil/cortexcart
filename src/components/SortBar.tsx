'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

export function SortBar({ count, currentSort }: { count: number; currentSort?: string }) {
  const router     = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-6 p-3.5 glass rounded-2xl border border-cx-border">
      <p className="text-[13px] text-cx-muted">
        <strong className="text-cx-text font-700">{count}</strong> products
      </p>

      <div className="flex items-center gap-2">
        <ArrowUpDown size={14} className="text-cx-muted flex-shrink-0"/>
        <label className="text-[12px] text-cx-muted whitespace-nowrap hidden sm:block">Sort by</label>
        <select
          value={currentSort || 'popular'}
          onChange={e => handleSort(e.target.value)}
          className="cx-input px-3 py-2 text-[12px] rounded-xl bg-cx-card border-cx-border text-cx-text font-600 appearance-none min-w-[150px]"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
