'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category { id:string; name:string; slug:string }
interface Props { categories:Category[]; currentParams:Record<string,string|undefined> }

const PRICE_RANGES = [
  { label:'Under $100',      min:'0',    max:'100' },
  { label:'$100 – $500',     min:'100',  max:'500' },
  { label:'$500 – $1,500',   min:'500',  max:'1500' },
  { label:'$1,500 – $3,000', min:'1500', max:'3000' },
  { label:'Over $3,000',     min:'3000', max:'99999' },
]

const BRANDS = ['Aurora','Carbon','Echo Labs','Helix','Ion','Nexus','Phantom','Prism','Quantum','Stellar','Synapse','Vortex']

export function ProductFilters({ categories, currentParams }: Props) {
  const router = useRouter()
  const sp     = useSearchParams()
  const [open, setOpen] = useState(['categories','price','brands','quick'])

  const toggle = (s:string) => setOpen(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s])

  const set = (key:string, val:string|null) => {
    const params = new URLSearchParams(sp.toString())
    val===null ? params.delete(key) : params.set(key, val)
    router.push(`/products?${params.toString()}`)
  }

  const hasFilters = !!(currentParams.category||currentParams.minPrice||currentParams.brand||currentParams.featured||currentParams.deals)

  return (
    <div className="cx-card-flat overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-cx-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-cx-emerald" />
          <span className="font-600 text-[13px] text-cx-text">Filters</span>
        </div>
        {hasFilters && (
          <button onClick={() => router.push('/products')} className="text-[11px] text-cx-muted hover:text-cx-rose transition-colors flex items-center gap-1">
            <X size={11} /> Clear
          </button>
        )}
      </div>

      <Section title="Categories" id="categories" open={open.includes('categories')} onToggle={() => toggle('categories')}>
        <button onClick={() => set('category',null)} className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors', !currentParams.category?'bg-cx-emerald/10 text-cx-emerald':'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
          All Categories
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => set('category', currentParams.category===cat.slug?null:cat.slug)}
            className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors', currentParams.category===cat.slug?'bg-cx-emerald/10 text-cx-emerald':'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
            {cat.name}
          </button>
        ))}
      </Section>

      <Section title="Price Range" id="price" open={open.includes('price')} onToggle={() => toggle('price')}>
        {PRICE_RANGES.map(r => {
          const active = currentParams.minPrice===r.min && currentParams.maxPrice===r.max
          return (
            <button key={r.label}
              onClick={() => { set('minPrice', active?null:r.min); set('maxPrice', active?null:r.max) }}
              className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors', active?'bg-cx-gold/10 text-cx-gold':'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
              {r.label}
            </button>
          )
        })}
      </Section>

      <Section title="Brand" id="brands" open={open.includes('brands')} onToggle={() => toggle('brands')}>
        {BRANDS.map(brand => (
          <button key={brand} onClick={() => set('brand', currentParams.brand===brand?null:brand)}
            className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors', currentParams.brand===brand?'bg-cx-violet/10 text-cx-violet':'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
            {brand}
          </button>
        ))}
      </Section>

      <Section title="Quick Filters" id="quick" open={open.includes('quick')} onToggle={() => toggle('quick')}>
        {[{label:'⚡ Featured',key:'featured',val:'true'},{label:'🔥 Deals Only',key:'deals',val:'true'}].map(f => {
          const active = currentParams[f.key]===f.val
          return (
            <button key={f.label} onClick={() => set(f.key, active?null:f.val)}
              className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors', active?'bg-cx-rose/10 text-cx-rose':'text-cx-muted hover:text-cx-text hover:bg-white/3')}>
              {f.label}
            </button>
          )
        })}
      </Section>
    </div>
  )
}

function Section({ title, id, open, onToggle, children }: { title:string; id:string; open:boolean; onToggle:()=>void; children:React.ReactNode }) {
  return (
    <div className="border-b border-cx-border last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-600 text-cx-dim hover:text-cx-emerald transition-colors">
        {title} <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-3 pb-3 space-y-0.5">{children}</div>}
    </div>
  )
}
