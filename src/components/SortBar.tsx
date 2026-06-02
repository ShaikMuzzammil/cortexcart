'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, SlidersHorizontal } from 'lucide-react'

export function SortBar({ count, currentSort }: { count: number; currentSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-5 p-3.5 glass rounded-2xl border border-cx-border">
      <div className="flex items-center gap-2 text-[12px] text-cx-muted">
        <Package size={14} className="text-cx-emerald" />
        <span><strong className="text-cx-text num">{count.toLocaleString()}</strong> products</span>
      </div>
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={12} className="text-cx-muted" />
        <label className="text-[11px] text-cx-muted hidden sm:block">Sort:</label>
        <select value={currentSort || 'popular'} onChange={e => handleSort(e.target.value)}
          className="cx-input px-3 py-1.5 text-[12px] rounded-xl bg-cx-card border-cx-border text-cx-text">
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  )
}
