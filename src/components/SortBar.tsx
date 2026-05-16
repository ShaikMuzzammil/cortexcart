'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package } from 'lucide-react'

export function SortBar({ count, currentSort }: { count: number; currentSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 glass rounded-2xl border border-cortex-border">
      <div className="flex items-center gap-2 text-sm text-cortex-muted">
        <Package size={15} />
        <span><strong className="text-cortex-text">{count}</strong> results</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-cortex-muted">Sort by</label>
        <select
          value={currentSort || 'popular'}
          onChange={(e) => handleSort(e.target.value)}
          className="input-cyber px-3 py-1.5 text-xs rounded-lg bg-cortex-card border-cortex-border text-cortex-text"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
