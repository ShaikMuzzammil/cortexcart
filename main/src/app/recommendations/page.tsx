'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Sparkles, Send, Loader2, ShoppingCart, Heart, Star,
  ExternalLink, Zap, ArrowRight, TrendingUp, Package,
  MessageSquare, ChevronRight, Search
} from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  'Best gaming accessories under $100',
  'Top-rated wireless earbuds',
  'Fitness gear for home workouts',
  'Coffee brewing essentials',
  'Smart home gadgets',
  'Running shoes and gear',
]

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; compare: number; image: string
  rating: number; reviews: number; category: string; reason: string
}

interface Message {
  role: 'user' | 'assistant'
  text?: string
  products?: Product[]
  loading?: boolean
}

function ProductCard({ p }: { p: Product }) {
  const { addItem }     = useCartStore()
  const { toggle, has } = useWishlistStore()
  const wishlisted      = has(p.id)
  const discount        = p.compare > p.price ? Math.round((1 - p.price / p.compare) * 100) : 0

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="cx-card overflow-hidden group hover:border-cx-emerald/30 transition-all duration-300">
      {/* Image */}
      <div className="relative h-36 bg-cx-surface overflow-hidden">
        {p.image
          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-cx-border"/></div>
        }
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-800 bg-cx-rose text-white px-1.5 py-0.5 rounded-lg">-{discount}%</span>
        )}
        <button onClick={() => toggle({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image })}
          className={cn('absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all',
            wishlisted ? 'bg-cx-rose/20 text-cx-rose' : 'bg-cx-bg/80 text-cx-muted hover:text-cx-rose')}>
          <Heart size={12} fill={wishlisted ? 'currentColor' : 'none'}/>
        </button>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <p className="text-[10px] text-cx-muted font-600">{p.brand} · {p.category}</p>
          <p className="text-[13px] font-700 text-cx-text line-clamp-2 leading-tight">{p.name}</p>
        </div>

        {/* Reason */}
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-cx-emerald/6 border border-cx-emerald/15">
          <Sparkles size={10} className="text-cx-emerald flex-shrink-0 mt-0.5"/>
          <p className="text-[10px] text-cx-emerald leading-relaxed">{p.reason}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({length:5}).map((_,i) => (
            <Star key={i} size={9} className={i < Math.floor(p.rating) ? 'text-cx-gold' : 'text-cx-border'} fill={i < Math.floor(p.rating) ? 'currentColor' : 'none'}/>
          ))}
          <span className="text-[10px] text-cx-muted ml-0.5">({p.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-800 text-[15px] text-cx-emerald">{formatPrice(p.price)}</span>
          {p.compare > p.price && <span className="text-[11px] text-cx-muted line-through">{formatPrice(p.compare)}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={() => {
            addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price,
              originalPrice: p.compare || p.price, image: p.image,
              stock: 99, brand: p.brand || undefined })
            toast.success('Added to cart!')
          }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cx-emerald/15 text-cx-emerald text-[11px] font-700 hover:bg-cx-emerald/25 transition-all">
            <ShoppingCart size={11}/> Add to Cart
          </button>
          <Link href={`/products/${p.slug}`}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-cx-border text-cx-muted text-[11px] hover:border-cx-emerald/40 hover:text-cx-emerald transition-all">
            <ExternalLink size={11}/>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { data: session }       = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ask = async (query: string) => {
    if (!query.trim() || loading) return
    setInput('')
    setLoading(true)

    setMessages(m => [...m,
      { role: 'user', text: query },
      { role: 'assistant', loading: true },
    ])

    try {
      const res  = await fetch('/api/ai/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ query }),
      })
      const data = await res.json()

      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = {
          role:     'assistant',
          text:     data.recommendations?.length > 0
            ? `Here are ${data.recommendations.length} picks from your store:`
            : 'No matching products found. Try a different search.',
          products: data.recommendations || [],
        }
        return updated
      })
    } catch {
      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'assistant', text: 'Something went wrong. Please try again.' }
        return updated
      })
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); ask(input) }

  return (
    <div className="min-h-screen pb-28 sm:pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-cx-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-cx-emerald/5 via-transparent to-cx-violet/5"/>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cx-emerald/10 border border-cx-emerald/20 mb-4">
            <Sparkles size={12} className="text-cx-emerald"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">AI Shopping Assistant</span>
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl text-white mb-3">
            Find Your Perfect <span className="grad-emerald">Product</span>
          </h1>
          <p className="text-cx-muted text-[14px] max-w-lg mx-auto">
            Describe what you're looking for and our AI will recommend the best matches from our real catalog — with direct links to buy.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6 mb-6">
            {/* Suggestions */}
            <div>
              <p className="text-[12px] font-700 text-cx-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <TrendingUp size={12}/> Try asking about…
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => ask(s)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-600 transition-all hover:scale-105"
                    style={{ background: 'rgba(16,217,136,0.08)', border: '1px solid rgba(16,217,136,0.2)', color: '#10d988' }}>
                    <Sparkles size={10}/> {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Info cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Search,  title: 'Real Products',  desc: 'Searches our actual store catalog — every result you can buy right now' },
                { icon: Sparkles,title: 'AI-Powered',     desc: 'Claude AI understands your needs and picks the best matches' },
                { icon: Zap,     title: 'Instant Cart',   desc: 'Add to cart or wishlist directly from recommendations' },
              ].map(c => (
                <div key={c.title} className="cx-card p-4 text-center">
                  <c.icon size={20} className="text-cx-emerald mx-auto mb-2"/>
                  <p className="font-700 text-[13px] text-cx-text mb-1">{c.title}</p>
                  <p className="text-[11px] text-cx-muted leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <div className="space-y-5 mb-6">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-sm px-4 py-3 rounded-2xl rounded-tr-sm bg-cx-emerald/15 border border-cx-emerald/20">
                      <p className="text-[13px] font-600 text-cx-text">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center">
                        <Sparkles size={13} className="text-cx-bg"/>
                      </div>
                      <span className="text-[12px] font-700 text-cx-text">CortexCart AI</span>
                    </div>

                    {msg.loading ? (
                      <div className="flex items-center gap-3 px-4 py-3 cx-card w-fit">
                        <Loader2 size={14} className="animate-spin text-cx-emerald"/>
                        <span className="text-[13px] text-cx-muted">Searching your catalog…</span>
                      </div>
                    ) : (
                      <>
                        {msg.text && (
                          <div className="cx-card px-4 py-3 w-fit max-w-sm">
                            <p className="text-[13px] text-cx-text">{msg.text}</p>
                          </div>
                        )}
                        {msg.products && msg.products.length > 0 && (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {msg.products.map(p => <ProductCard key={p.id} p={p}/>)}
                          </div>
                        )}
                        {msg.products && msg.products.length > 0 && (
                          <Link href="/products"
                            className="inline-flex items-center gap-2 text-[12px] text-cx-emerald hover:underline mt-1">
                            Browse all products <ChevronRight size={12}/>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="sticky bottom-20 sm:bottom-6">
          <form onSubmit={handleSubmit}
            className="flex gap-3 p-3 rounded-2xl border border-cx-border bg-cx-bg/95 backdrop-blur-xl shadow-2xl">
            <div className="flex-1 relative">
              <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. gaming mouse under $80, best yoga mat, coffee gadgets…"
                className="cx-input w-full pl-9 pr-4 py-3 text-[13px]"/>
            </div>
            <button type="submit" disabled={loading || !input.trim()}
              className="btn-em px-5 py-3 text-[13px] rounded-xl flex items-center gap-2 flex-shrink-0 disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
