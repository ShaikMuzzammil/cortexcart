'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, X, Minus, Send, ShoppingCart, Heart, Star, Package, ChevronRight, Zap, Loader2 } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, cn }  from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; compare: number; image: string
  rating: number; reviews: number; reason: string
}
interface Msg { role: 'ai'|'user'; text?: string; products?: Product[]; loading?: boolean }

const CHIPS = ['Best laptop deals','Gaming mouse under $80','Wireless earbuds','Fitness equipment','Home office setup','Top rated cameras']

export function AIChatFloat() {
  const [open,     setOpen]     = useState(false)
  const [minimized,setMinimized]= useState(false)
  const [input,    setInput]    = useState('')
  const [msgs,     setMsgs]     = useState<Msg[]>([
    { role:'ai', text:"Hi! I'm CortexCart AI 🤖 Describe what you're looking for and I'll find the best matches from our catalog instantly." },
  ])
  const [loading, setLoading]   = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const { addItem }     = useCartStore()
  const { toggle, has } = useWishlistStore()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = async (q: string) => {
    if (!q.trim() || loading) return
    setInput('')
    setMsgs(m => [...m, { role:'user', text: q }, { role:'ai', loading: true }])
    setLoading(true)
    try {
      const res  = await fetch('/api/ai/recommend', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      const prods: Product[] = (data.recommendations || []).map((r: any) => ({
        id: r.id, name: r.name, slug: r.slug, brand: r.brand || '',
        price: r.price, compare: r.compare || r.price,
        image: r.image || '', rating: r.rating || 4.5,
        reviews: r.reviews || 0, reason: r.reason || `Match for "${q}"`,
      }))
      setMsgs(m => {
        const next = [...m]; next.pop()
        if (prods.length > 0) {
          next.push({ role:'ai', text: `Found ${prods.length} great match${prods.length>1?'es':''} for "${q}":`, products: prods })
        } else {
          next.push({ role:'ai', text: `Couldn't find exact matches for "${q}". Try a broader term like "wireless earbuds" or "gaming mouse".` })
        }
        return next
      })
    } catch {
      setMsgs(m => { const next=[...m]; next.pop(); next.push({ role:'ai', text:'Connection error. Please try again.' }); return next })
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(16,217,136,0.35)] transition-all hover:scale-110 active:scale-95"
          style={{ background:'linear-gradient(135deg,#10d988,#38bdf8)' }}
          aria-label="Open AI Chat">
          <Sparkles size={22} color="#080b14"/>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cx-violet border-2 border-cx-bg flex items-center justify-center">
            <span className="text-[8px] text-white font-800">AI</span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-cx-border transition-all',
          minimized ? 'h-14' : 'h-[520px]',
          'flex flex-col'
        )} style={{ background:'#0d1221' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-cx-border flex-shrink-0"
            style={{ background:'linear-gradient(135deg,rgba(16,217,136,0.12),rgba(56,189,248,0.08))' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#10d988,#38bdf8)' }}>
              <Sparkles size={14} color="#080b14"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-800 text-white">CortexCart AI</p>
              <p className="text-[10px] text-cx-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cx-emerald inline-block animate-pulse"/>
                Online · Powered by Claude
              </p>
            </div>
            <button onClick={() => setMinimized(!minimized)} className="text-cx-muted hover:text-cx-dim p-1 rounded-lg hover:bg-cx-card transition-all">
              <Minus size={14}/>
            </button>
            <button onClick={() => setOpen(false)} className="text-cx-muted hover:text-cx-rose p-1 rounded-lg hover:bg-cx-rose/10 transition-all">
              <X size={14}/>
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                {msgs.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.loading ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-cx-surface border border-cx-border">
                        <Loader2 size={12} className="text-cx-emerald animate-spin"/>
                        <span className="text-[12px] text-cx-muted">Searching catalog…</span>
                      </div>
                    ) : msg.role === 'user' ? (
                      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-md text-[12px] text-white"
                        style={{ background:'linear-gradient(135deg,#10d988,#38bdf8)', color:'#080b14', fontWeight:600 }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        {msg.text && (
                          <div className="max-w-[90%] px-3 py-2.5 rounded-2xl rounded-tl-md bg-cx-surface border border-cx-border">
                            <p className="text-[12px] text-cx-dim leading-relaxed">{msg.text}</p>
                          </div>
                        )}
                        {msg.products?.map(p => {
                          const disc = p.compare > p.price ? Math.round((1-p.price/p.compare)*100) : 0
                          return (
                            <div key={p.id} className="flex gap-2.5 p-2.5 rounded-xl bg-cx-surface border border-cx-border hover:border-cx-emerald/20 transition-all group">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-cx-bg">
                                {p.image
                                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                  : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-cx-border"/></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-700 text-cx-text truncate leading-tight">{p.name}</p>
                                <p className="text-[10px] text-cx-muted mb-1 truncate">{p.reason}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] font-800 text-cx-emerald">{formatPrice(p.price)}</span>
                                  {disc > 0 && <span className="text-[9px] text-cx-rose font-700">-{disc}%</span>}
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    <Star size={8} className="fill-cx-gold text-cx-gold"/>
                                    <span className="text-[9px] text-cx-muted">{p.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <button onClick={() => { addItem({ id:p.id, slug:p.slug, name:p.name, price:p.price, originalPrice:p.compare||p.price, image:p.image, stock:99, brand:p.brand||undefined }); toast.success('Added to cart!') }}
                                  className="w-7 h-7 rounded-lg bg-cx-emerald/10 text-cx-emerald flex items-center justify-center hover:bg-cx-emerald/20 transition-all">
                                  <ShoppingCart size={11}/>
                                </button>
                                <button onClick={() => toggle({ id:p.id, slug:p.slug, name:p.name, price:p.price, image:p.image })}
                                  className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                                    has(p.id) ? 'bg-cx-rose/15 text-cx-rose' : 'bg-cx-surface text-cx-muted hover:text-cx-rose')}>
                                  <Heart size={11} fill={has(p.id) ? 'currentColor' : 'none'}/>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                        {msg.products && msg.products.length > 0 && (
                          <Link href="/recommendations" className="flex items-center justify-center gap-1 text-[10px] text-cx-violet hover:text-cx-violet/80 py-1">
                            See full recommendations page <ChevronRight size={10}/>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={endRef}/>
              </div>

              {/* Quick chips */}
              {msgs.length <= 2 && (
                <div className="px-3 py-2 border-t border-cx-border/50">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                    {CHIPS.map(chip => (
                      <button key={chip} onClick={() => send(chip)}
                        className="flex-shrink-0 text-[10px] font-600 px-2.5 py-1 rounded-full bg-cx-violet/10 text-cx-violet border border-cx-violet/20 hover:bg-cx-violet/20 transition-all whitespace-nowrap">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-cx-border flex-shrink-0">
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') send(input) }}
                    placeholder="Ask for recommendations…"
                    className="flex-1 bg-cx-surface border border-cx-border rounded-xl px-3 py-2 text-[12px] text-cx-text placeholder:text-cx-muted focus:outline-none focus:border-cx-emerald/40 transition-colors"
                    disabled={loading}/>
                  <button onClick={() => send(input)} disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background:'linear-gradient(135deg,#10d988,#38bdf8)' }}>
                    <Send size={13} color="#080b14"/>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
