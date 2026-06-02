'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  categories: { id: string; name: string; slug: string }[]
  brands: string[]
  currentCategory?: string
  currentBrand?: string
  currentMinPrice?: string
  currentMaxPrice?: string
}

export function ProductFilters({ categories, brands, currentCategory, currentBrand, currentMinPrice, currentMaxPrice }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minP, setMinP] = useState(currentMinPrice || '')
  const [maxP, setMaxP] = useState(currentMaxPrice || '')
  const [openSections, setOpenSections] = useState({ categories: true, price: true, brands: true })

  const toggle = (section: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [section]: !s[section] }))

  const navigate = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => { v ? params.set(k, v) : params.delete(k) })
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => { setMinP(''); setMaxP(''); router.push('/products') }
  const hasFilters = currentCategory || currentBrand || currentMinPrice || currentMaxPrice

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-cx-emerald" />
          <span className="font-700 text-[13px] text-cx-text">Filters</span>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-[11px] text-cx-rose hover:text-cx-rose/80 flex items-center gap-1 transition-colors">
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="p-4 rounded-2xl cx-card-flat">
        <button onClick={() => toggle('categories')}
          className="flex items-center justify-between w-full mb-3">
          <span className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Category</span>
          <ChevronDown size={12} className={cn('text-cx-muted transition-transform', openSections.categories && 'rotate-180')} />
        </button>
        {openSections.categories && (
          <div className="space-y-0.5">
            <button onClick={() => navigate({ category: undefined })}
              className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-600 transition-all',
                !currentCategory ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
              All Products
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => navigate({ category: cat.slug })}
                className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-600 transition-all',
                  currentCategory === cat.slug ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="p-4 rounded-2xl cx-card-flat">
        <button onClick={() => toggle('price')}
          className="flex items-center justify-between w-full mb-3">
          <span className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Price Range</span>
          <ChevronDown size={12} className={cn('text-cx-muted transition-transform', openSections.price && 'rotate-180')} />
        </button>
        {openSections.price && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-cx-muted mb-1">Min $</label>
                <input value={minP} onChange={e => setMinP(e.target.value)} type="number" min="0" placeholder="0"
                  className="cx-input w-full px-2.5 py-2 text-[12px] rounded-lg" />
              </div>
              <div>
                <label className="block text-[10px] text-cx-muted mb-1">Max $</label>
                <input value={maxP} onChange={e => setMaxP(e.target.value)} type="number" min="0" placeholder="Any"
                  className="cx-input w-full px-2.5 py-2 text-[12px] rounded-lg" />
              </div>
            </div>
            <button onClick={() => navigate({ minPrice: minP || undefined, maxPrice: maxP || undefined })}
              className="btn-em w-full py-2 text-[12px] rounded-xl">Apply</button>
            {[['Under $100','0','100'],['$100–$500','100','500'],['$500–$1000','500','1000'],['$1000+','1000','']]
              .map(([l,mn,mx]) => (
                <button key={l} onClick={() => { setMinP(mn); setMaxP(mx); navigate({ minPrice: mn||undefined, maxPrice: mx||undefined }) }}
                  className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-600 transition-all',
                    currentMinPrice===mn && currentMaxPrice===mx ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                  {l}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="p-4 rounded-2xl cx-card-flat">
          <button onClick={() => toggle('brands')}
            className="flex items-center justify-between w-full mb-3">
            <span className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Brand</span>
            <ChevronDown size={12} className={cn('text-cx-muted transition-transform', openSections.brands && 'rotate-180')} />
          </button>
          {openSections.brands && (
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              <button onClick={() => navigate({ brand: undefined })}
                className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-600 transition-all',
                  !currentBrand ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                All Brands
              </button>
              {brands.map(b => (
                <button key={b} onClick={() => navigate({ brand: b })}
                  className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-600 transition-all',
                    currentBrand === b ? 'bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/20' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="p-4 rounded-2xl cx-card-flat space-y-0.5">
        <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Quick Links</p>
        {[
          ['Featured Picks', '/products?featured=true', 'text-cx-gold'],
          ['Best Deals',     '/products?deals=true',    'text-cx-rose'],
          ['Top Rated',      '/products?sort=rating',   'text-cx-emerald'],
          ['Newest',         '/products?sort=newest',   'text-cx-sky'],
        ].map(([l, h, c]) => (
          <a key={l} href={h} className={`block px-3 py-2 rounded-xl text-[12px] font-600 ${c} hover:bg-white/3 transition-colors`}>{l}</a>
        ))}
      </div>
    </div>
  )
}
