'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, cn }  from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Sparkles, Send, ShoppingCart, Heart, Star, Package,
  Loader2, ChevronRight, TrendingUp, Zap
} from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; compare: number; image: string
  rating: number; reviews: number; category: string; reason: string
}

const CHIPS = [
  'Best laptop under $1000', 'Top-rated wireless earbuds', 'Gaming mouse for FPS',
  'Running shoes for marathon', 'Smart home starter kit', 'Ergonomic office chair',
  'Budget mechanical keyboard', 'Coffee maker with grinder', 'Yoga mat non-slip',
  'Travel backpack carry-on',
]

export default function RecommendationsPage() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [asked,   setAsked]   = useState('')
  const [mode,    setMode]    = useState<'ai'|'keyword'|null>(null)
  const { addItem }     = useCartStore()
  const { toggle, has } = useWishlistStore()

  const ask = async (q: string) => {
    if (!q.trim() || loading) return
    setLoading(true); setResults([]); setAsked(q)
    try {
      const res  = await fetch('/api/ai/recommend', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setResults(data.recommendations || [])
      setMode(data.mode || 'ai')
    } catch { toast.error('Failed to get recommendations') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-violet/20 mb-5">
            <Sparkles size={13} className="text-cx-violet animate-pulse"/>
            <span className="text-[11px] font-700 text-cx-violet uppercase tracking-[0.12em]">AI Picks</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-white mb-4">
            Find Your <span className="grad-multi">Perfect Product</span>
          </h1>
          <p className="text-cx-dim text-[15px] max-w-xl mx-auto mb-3">
            Describe what you're looking for. Our AI reads your intent and surfaces the best-matched products from our real catalog — instantly.
          </p>
          <div className="flex items-center justify-center gap-2 text-[12px] text-cx-muted">
            <TrendingUp size={12} className="text-cx-emerald"/>
            <span>Powered by <span className="text-cx-emerald font-700">Claude AI</span> · Searches your real product catalog</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-cx-emerald/20 to-cx-violet/20 blur-xl rounded-2xl"/>
          <div className="relative flex gap-2 p-2 bg-cx-surface border border-cx-border/80 rounded-2xl">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') ask(query) }}
              placeholder="e.g. gaming mouse under $80, best wireless earbuds for gym..."
              className="flex-1 bg-transparent px-3 py-3 text-[14px] text-cx-text placeholder:text-cx-muted focus:outline-none"
            />
            <button onClick={() => ask(query)} disabled={!query.trim() || loading}
              className="btn-em px-5 py-3 rounded-xl text-[13px] flex items-center gap-2 disabled:opacity-50 min-w-[100px] justify-center">
              {loading ? <Loader2 size={15} className="animate-spin"/> : <><Send size={13}/> Ask AI</>}
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CHIPS.map(chip => (
            <button key={chip} onClick={() => { setQuery(chip); ask(chip) }}
              className="text-[12px] font-600 px-3 py-1.5 rounded-full bg-cx-card border border-cx-border text-cx-dim hover:text-cx-text hover:border-cx-emerald/30 hover:bg-cx-emerald/5 transition-all">
              {chip}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cx-violet/10 border border-cx-violet/20 flex items-center justify-center">
                <Sparkles size={20} className="text-cx-violet animate-pulse"/>
              </div>
              <p className="text-cx-dim text-[14px]">AI is searching your catalog for "<strong className="text-cx-text">{asked}</strong>"…</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[13px] text-cx-muted mb-1">Results for</p>
                <h2 className="font-display font-800 text-2xl text-white">"{asked}"</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] font-700 px-3 py-1 rounded-full', mode === 'ai' ? 'bg-cx-violet/10 text-cx-violet border border-cx-violet/20' : 'bg-cx-sky/10 text-cx-sky border border-cx-sky/20')}>
                  {mode === 'ai' ? '✦ AI matched' : '● Keyword matched'}
                </span>
                <span className="text-[12px] text-cx-muted">{results.length} found</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {results.map((p, i) => {
                const disc = p.compare > p.price ? Math.round((1-p.price/p.compare)*100) : 0
                return (
                  <div key={p.id} className="cx-card p-0 overflow-hidden hover:border-cx-emerald/25 transition-all group">
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-cx-bg relative">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                          : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-cx-border"/></div>}
                        {disc > 0 && <span className="absolute top-1.5 left-1.5 text-[10px] font-800 bg-cx-rose text-white px-1.5 py-0.5 rounded-md">-{disc}%</span>}
                        <span className="absolute top-1.5 right-1.5 text-[10px] font-700 bg-cx-bg/80 text-cx-muted px-1.5 py-0.5 rounded-md">#{i+1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-700 text-cx-violet uppercase tracking-wider mb-1">{p.category || p.brand}</p>
                        <h3 className="text-[14px] font-800 text-cx-text leading-tight mb-2">{p.name}</h3>
                        <p className="text-[12px] text-cx-muted leading-relaxed line-clamp-2 mb-2">{p.reason}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.round(p.rating) ? 'fill-cx-gold text-cx-gold' : 'text-cx-border'}/>)}
                          </div>
                          <span className="text-[11px] text-cx-muted">({p.reviews?.toLocaleString()})</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-cx-border/50 px-4 py-3 flex items-center gap-3">
                      <div>
                        <span className="text-[18px] font-900 text-cx-emerald">{formatPrice(p.price)}</span>
                        {disc > 0 && <span className="text-[12px] text-cx-muted line-through ml-2">{formatPrice(p.compare)}</span>}
                      </div>
                      <div className="flex gap-2 ml-auto">
                        <button onClick={() => toggle({ id:p.id, slug:p.slug, name:p.name, price:p.price, image:p.image })}
                          className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all border',
                            has(p.id) ? 'bg-cx-rose/12 text-cx-rose border-cx-rose/20' : 'bg-cx-card text-cx-muted border-cx-border hover:text-cx-rose hover:border-cx-rose/20')}>
                          <Heart size={14} fill={has(p.id) ? 'currentColor' : 'none'}/>
                        </button>
                        <button onClick={() => { addItem({ id:p.id, slug:p.slug, name:p.name, price:p.price, originalPrice:p.compare||p.price, image:p.image, stock:99, brand:p.brand||undefined }); toast.success(`${p.name} added!`) }}
                          className="btn-em px-4 py-2 text-[12px] rounded-xl flex items-center gap-1.5">
                          <ShoppingCart size={12}/> Add to Cart
                        </button>
                        <Link href={`/products/${p.slug}`}
                          className="w-9 h-9 rounded-xl bg-cx-card border border-cx-border flex items-center justify-center text-cx-muted hover:text-cx-text hover:border-cx-emerald/30 transition-all">
                          <ChevronRight size={14}/>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-center">
              <Link href="/products" className="btn-outline-em px-6 py-3 rounded-xl text-[13px] inline-flex items-center gap-2">
                <Zap size={13}/> Browse All {results.length > 0 && 'Similar'} Products
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && asked && results.length === 0 && (
          <div className="text-center py-16 cx-card p-10">
            <Package size={32} className="text-cx-muted mx-auto mb-4"/>
            <p className="text-[16px] font-700 text-cx-dim mb-2">No matches found</p>
            <p className="text-[13px] text-cx-muted mb-6">Try a simpler or broader term, like "wireless earbuds" or "gaming chair".</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['wireless earbuds','gaming mouse','running shoes'].map(s => (
                <button key={s} onClick={() => ask(s)} className="text-[12px] px-3 py-1.5 rounded-full bg-cx-card border border-cx-border text-cx-dim hover:text-cx-emerald hover:border-cx-emerald/30 transition-all">{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
