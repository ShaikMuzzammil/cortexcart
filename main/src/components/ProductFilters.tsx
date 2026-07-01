'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SlidersHorizontal, ChevronDown, X, Star, Tag,
  Zap, Flame, Package, DollarSign, Award, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Category { id: string; name: string; slug: string }
interface Props { categories: Category[]; currentParams: Record<string, string | undefined> }

const PRICE_RANGES = [
  { label: 'Under $50',     min: '0',    max: '50',    color: 'text-cx-emerald' },
  { label: '$50 – $100',    min: '50',   max: '100',   color: 'text-cx-sky'     },
  { label: '$100 – $200',   min: '100',  max: '200',   color: 'text-cx-violet'  },
  { label: '$200 – $500',   min: '200',  max: '500',   color: 'text-cx-gold'    },
  { label: 'Over $500',     min: '500',  max: '99999', color: 'text-cx-rose'    },
]

const RATINGS = [
  { label: '4.5 & up', val: '4.5', stars: 5 },
  { label: '4.0 & up', val: '4.0', stars: 4 },
  { label: '3.5 & up', val: '3.5', stars: 4 },
]

const CAT_ICONS: Record<string, string> = {
  tech:'💻', audio:'🎧', computing:'🖥️', electronics:'🔌', wearables:'⌚', photography:'📷',
  gaming:'🎮', home:'🏠', fashion:'👗', beauty:'✨',
  sports:'🏋️', office:'🖊️', music:'🎵', travel:'✈️',
  books:'📚', kitchen:'🍳',
}

export function ProductFilters({ categories, currentParams }: Props) {
  const router = useRouter()
  const sp     = useSearchParams()
  const [sections, setSections] = useState(['categories','price','rating','quick'])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = (s: string) =>
    setSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const set = (key: string, val: string | null) => {
    const params = new URLSearchParams(sp.toString())
    val === null ? params.delete(key) : params.set(key, val)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const hasFilters = !!(
    currentParams.category || currentParams.minPrice ||
    currentParams.rating   || currentParams.featured  || currentParams.deals || currentParams.inStock
  )

  const activeCount = [
    currentParams.category, currentParams.minPrice,
    currentParams.rating,   currentParams.featured,
    currentParams.deals,    currentParams.inStock,
  ].filter(Boolean).length

  const clearAll = () => router.push('/products')

  const FilterContent = () => (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-cx-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-cx-emerald"/>
          <span className="font-700 text-[13px] text-white">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-cx-emerald/20 text-cx-emerald text-[10px] font-800 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1 text-[11px] font-600 text-cx-muted hover:text-cx-rose transition-colors px-2 py-1 rounded-lg hover:bg-cx-rose/8">
            <X size={11}/> Clear all
          </button>
        )}
      </div>

      {/* Active filters chips */}
      {hasFilters && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {currentParams.category && (
            <Chip label={categories.find(c=>c.slug===currentParams.category)?.name||currentParams.category}
              onRemove={() => set('category', null)} color="emerald"/>
          )}
          {currentParams.minPrice && (
            <Chip label={PRICE_RANGES.find(r=>r.min===currentParams.minPrice)?.label||'Price'}
              onRemove={() => { set('minPrice',null); set('maxPrice',null) }} color="gold"/>
          )}
          {currentParams.rating && (
            <Chip label={`${currentParams.rating}★+`} onRemove={()=>set('rating',null)} color="violet"/>
          )}
          {currentParams.featured && <Chip label="Featured" onRemove={()=>set('featured',null)} color="sky"/>}
          {currentParams.deals    && <Chip label="Deals"    onRemove={()=>set('deals',null)}    color="rose"/>}
          {currentParams.inStock  && <Chip label="In Stock" onRemove={()=>set('inStock',null)}  color="emerald"/>}
        </div>
      )}

      {/* Categories */}
      <Section title="Categories" icon="🏷️" id="categories"
        open={sections.includes('categories')} onToggle={()=>toggle('categories')}>
        <button onClick={() => set('category', null)}
          className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-600 transition-all flex items-center gap-2',
            !currentParams.category
              ? 'bg-cx-emerald/12 text-cx-emerald border border-cx-emerald/20'
              : 'text-cx-muted hover:text-cx-text hover:bg-white/4')}>
          <span className="text-base">🌐</span> All Categories
          {!currentParams.category && <Check size={11} className="ml-auto text-cx-emerald"/>}
        </button>
        <div className="space-y-0.5 mt-0.5">
          {categories.map(cat => {
            const active = currentParams.category === cat.slug
            return (
              <button key={cat.id}
                onClick={() => set('category', active ? null : cat.slug)}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-600 transition-all flex items-center gap-2 group',
                  active ? 'bg-cx-emerald/12 text-cx-emerald border border-cx-emerald/20'
                         : 'text-cx-muted hover:text-cx-text hover:bg-white/4')}>
                <span className="text-sm">{CAT_ICONS[cat.slug] || '📦'}</span>
                <span className="flex-1">{cat.name}</span>
                {active && <Check size={11} className="text-cx-emerald flex-shrink-0"/>}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Price */}
      <Section title="Price Range" icon="💰" id="price"
        open={sections.includes('price')} onToggle={()=>toggle('price')}>
        <div className="space-y-0.5">
          {PRICE_RANGES.map(r => {
            const active = currentParams.minPrice === r.min && currentParams.maxPrice === r.max
            return (
              <button key={r.label}
                onClick={() => {
                  if (active) { set('minPrice',null); set('maxPrice',null) }
                  else { set('minPrice',r.min); set('maxPrice',r.max) }
                }}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-600 transition-all flex items-center gap-2',
                  active ? `bg-cx-gold/12 text-cx-gold border border-cx-gold/20`
                         : 'text-cx-muted hover:text-cx-text hover:bg-white/4')}>
                <DollarSign size={11} className={active ? 'text-cx-gold' : 'text-cx-muted'}/>
                <span className="flex-1">{r.label}</span>
                {active && <Check size={11} className="text-cx-gold flex-shrink-0"/>}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Minimum Rating" icon="⭐" id="rating"
        open={sections.includes('rating')} onToggle={()=>toggle('rating')}>
        <div className="space-y-0.5">
          {RATINGS.map(r => {
            const active = currentParams.rating === r.val
            return (
              <button key={r.val}
                onClick={() => set('rating', active ? null : r.val)}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-600 transition-all flex items-center gap-2',
                  active ? 'bg-cx-gold/12 text-cx-gold border border-cx-gold/20'
                         : 'text-cx-muted hover:text-cx-text hover:bg-white/4')}>
                <div className="flex items-center gap-0.5">
                  {Array.from({length:5}).map((_,i)=>(
                    <Star key={i} size={9} fill={i<r.stars?'currentColor':'none'}
                      className={i<r.stars?'text-cx-gold':'text-cx-border'}/>
                  ))}
                </div>
                <span className="flex-1">{r.label}</span>
                {active && <Check size={11} className="text-cx-gold"/>}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Quick Filters */}
      <Section title="Quick Filters" icon="⚡" id="quick"
        open={sections.includes('quick')} onToggle={()=>toggle('quick')}>
        <div className="space-y-0.5">
          {[
            { label:'⭐ Featured Picks', key:'featured', val:'true', classes:'bg-cx-sky/12 text-cx-sky border-cx-sky/20'        },
            { label:'🔥 On Sale / Deals', key:'deals',    val:'true', classes:'bg-cx-rose/12 text-cx-rose border-cx-rose/20'      },
            { label:'✅ In Stock Only',   key:'inStock',  val:'true', classes:'bg-cx-emerald/12 text-cx-emerald border-cx-emerald/20' },
          ].map(f => {
            const active = currentParams[f.key] === f.val
            return (
              <button key={f.key}
                onClick={() => set(f.key, active ? null : f.val)}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-600 transition-all flex items-center gap-2 border',
                  active ? f.classes
                         : 'text-cx-muted border-transparent hover:text-cx-text hover:bg-white/4'
                )}>
                <span className="flex-1">{f.label}</span>
                {active && <Check size={11}/>}
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block cx-card overflow-hidden sticky top-20">
        <FilterContent/>
      </div>

      {/* Mobile filter button + drawer */}
      <div className="lg:hidden">
        <button onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-700 transition-all"
          style={{ background:'rgba(16,217,136,0.1)', border:'1px solid rgba(16,217,136,0.2)', color:'#10d988' }}>
          <SlidersHorizontal size={14}/>
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}/>
              <motion.div initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
                transition={{ type:'spring', damping:25 }}
                className="fixed left-0 top-0 bottom-0 w-80 z-50 overflow-y-auto"
                style={{ background:'#0d1221', borderRight:'1px solid #1e2640' }}>
                <div className="flex items-center justify-between p-4 border-b border-cx-border">
                  <span className="font-700 text-white">Filters</span>
                  <button onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-white/10">
                    <X size={16} className="text-cx-muted"/>
                  </button>
                </div>
                <FilterContent/>
                <div className="p-4">
                  <button onClick={() => setMobileOpen(false)}
                    className="btn-em w-full py-3 text-[13px] rounded-xl">
                    Show Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function Chip({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-cx-emerald/10 text-cx-emerald border-cx-emerald/20',
    gold:    'bg-cx-gold/10    text-cx-gold    border-cx-gold/20',
    violet:  'bg-cx-violet/10  text-cx-violet  border-cx-violet/20',
    sky:     'bg-cx-sky/10     text-cx-sky     border-cx-sky/20',
    rose:    'bg-cx-rose/10    text-cx-rose    border-cx-rose/20',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-700 border', colors[color])}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={9}/>
      </button>
    </span>
  )
}

function Section({ title, icon, id, open, onToggle, children }:
  { title: string; icon: string; id: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-cx-border/50 last:border-0">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-700 text-cx-dim hover:text-cx-emerald transition-colors">
        <span className="flex items-center gap-2">
          <span>{icon}</span> {title}
        </span>
        <ChevronDown size={13} className={cn('transition-transform duration-200', open && 'rotate-180')}/>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
            style={{ overflow:'hidden' }}>
            <div className="px-3 pb-3 space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
