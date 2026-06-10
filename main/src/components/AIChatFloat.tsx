'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, X, Send, Loader2, ShoppingCart, ExternalLink,
  Star, MessageSquare, Minimize2, ChevronDown, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; compare: number; image: string
  rating: number; reviews: number; category: string; reason: string
}
interface Msg { role: 'user'|'ai'; text?: string; products?: Product[]; loading?: boolean }

const QUICK = [
  'Best deals under $50', 'Top gaming gear',
  'Fitness essentials',  'Popular tech gadgets',
]

export function AIChatFloat() {
  const [open,    setOpen]    = useState(false)
  const [msgs,    setMsgs]    = useState<Msg[]>([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [mini,    setMini]    = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const { addItem }           = useCartStore()
  const router                = useRouter()

  useEffect(() => {
    if (open && !mini) bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs, open, mini])

  const ask = async (q: string) => {
    if (!q.trim() || loading) return
    setInput('')
    setLoading(true)
    setMsgs(m => [...m, { role:'user', text:q }, { role:'ai', loading:true }])
    try {
      const res  = await fetch('/api/ai/recommend', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setMsgs(m => {
        const next = [...m]
        next[next.length-1] = {
          role:'ai',
          text: data.recommendations?.length
            ? `Found ${data.recommendations.length} great match${data.recommendations.length>1?'es':''} from our store:`
            : 'No matches found. Try a different search!',
          products: data.recommendations || [],
        }
        return next
      })
    } catch {
      setMsgs(m => { const n=[...m]; n[n.length-1]={ role:'ai', text:'Something went wrong. Please try again.' }; return n })
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
            exit={{ scale:0, opacity:0 }} whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background:'linear-gradient(135deg,#10d988,#8b5cf6)', boxShadow:'0 0 30px rgba(16,217,136,0.4)' }}>
            <Sparkles size={22} className="text-white" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background:'linear-gradient(135deg,#10d988,#8b5cf6)' }}/>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:20, scale:0.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.95 }}
            transition={{ type:'spring', damping:25, stiffness:300 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              width: mini ? 300 : 380,
              height: mini ? 64 : 560,
              background:'#0d1221',
              border:'1px solid rgba(16,217,136,0.2)',
              boxShadow:'0 0 40px rgba(16,217,136,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              transition:'width 0.3s ease, height 0.3s ease',
            }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
              style={{ background:'linear-gradient(135deg,rgba(16,217,136,0.12),rgba(139,92,246,0.12))', borderBottom:'1px solid rgba(16,217,136,0.15)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#10d988,#8b5cf6)' }}>
                <Sparkles size={15} className="text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-800 text-white">CortexCart AI</p>
                {!mini && <p className="text-[10px]" style={{color:'#10d988'}}>● Online · Powered by Claude</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMini(!mini)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  {mini ? <ChevronDown size={14} className="text-cx-muted"/> : <Minimize2 size={14} className="text-cx-muted"/>}
                </button>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <X size={14} className="text-cx-muted"/>
                </button>
              </div>
            </div>

            {!mini && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{scrollbarWidth:'thin',scrollbarColor:'#1e2640 transparent'}}>

                  {msgs.length === 0 && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{background:'linear-gradient(135deg,#10d988,#8b5cf6)'}}>
                          <Sparkles size={13} className="text-white"/>
                        </div>
                        <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed flex-1"
                          style={{background:'#111827',color:'#c0cfe8'}}>
                          Hi! I'm your CortexCart shopping assistant. Tell me what you're looking for and I'll find the best matches from our real catalog.
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-700 uppercase tracking-wider mb-2" style={{color:'#4a5a7a'}}>Quick searches:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {QUICK.map(q => (
                            <button key={q} onClick={() => ask(q)}
                              className="px-2.5 py-2 rounded-xl text-[11px] font-600 text-left transition-all hover:scale-105"
                              style={{background:'rgba(16,217,136,0.08)',border:'1px solid rgba(16,217,136,0.2)',color:'#10d988'}}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {msgs.map((m, i) => (
                    <div key={i}>
                      {m.role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="max-w-[240px] px-3 py-2.5 rounded-2xl rounded-tr-sm text-[13px]"
                            style={{background:'rgba(16,217,136,0.15)',border:'1px solid rgba(16,217,136,0.2)',color:'#e8edf8'}}>
                            {m.text}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{background:'linear-gradient(135deg,#10d988,#8b5cf6)'}}>
                              <Sparkles size={11} className="text-white"/>
                            </div>
                            {m.loading ? (
                              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl rounded-tl-sm"
                                style={{background:'#111827',color:'#6b7fa3',fontSize:13}}>
                                <Loader2 size={13} className="animate-spin text-cx-emerald"/>
                                Searching catalog…
                              </div>
                            ) : (
                              <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-[13px] flex-1"
                                style={{background:'#111827',color:'#c0cfe8'}}>
                                {m.text}
                              </div>
                            )}
                          </div>
                          {m.products && m.products.length > 0 && (
                            <div className="space-y-2 ml-8">
                              {m.products.map(p => (
                                <div key={p.id} className="flex gap-2.5 p-2.5 rounded-xl transition-all hover:scale-[1.01]"
                                  style={{background:'#111827',border:'1px solid #1e2640'}}>
                                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                                    style={{background:'#0d1221'}}>
                                    {p.image
                                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                                      : <div className="w-full h-full flex items-center justify-center text-[10px]" style={{color:'#4a5a7a'}}>IMG</div>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-700 text-white truncate">{p.name}</p>
                                    <p className="text-[10px]" style={{color:'#4a5a7a'}}>{p.brand} · {p.category}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Star size={9} className="text-cx-gold" fill="currentColor"/>
                                      <span className="text-[10px]" style={{color:'#6b7fa3'}}>{p.rating}</span>
                                    </div>
                                    <p className="text-[12px] font-800" style={{color:'#10d988'}}>{formatPrice(p.price)}</p>
                                    <p className="text-[10px] italic leading-tight mt-0.5" style={{color:'#38bdf8'}}>{p.reason}</p>
                                    <div className="flex gap-1.5 mt-1.5">
                                      <button onClick={() => {
                                        addItem({ id:p.id, slug:p.slug, name:p.name, price:p.price,
                                          originalPrice:p.compare||p.price, image:p.image, stock:99, brand:p.brand||undefined })
                                        toast.success('Added to cart!')
                                      }}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-700 transition-all"
                                        style={{background:'rgba(16,217,136,0.15)',color:'#10d988'}}>
                                        <ShoppingCart size={9}/> Add
                                      </button>
                                      <Link href={`/products/${p.slug}`} onClick={() => setOpen(false)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-700 transition-all"
                                        style={{background:'rgba(255,255,255,0.05)',color:'#6b7fa3'}}>
                                        <ExternalLink size={9}/> View
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <Link href="/recommendations" onClick={() => setOpen(false)}
                                className="block text-center text-[11px] font-700 py-1.5 rounded-xl transition-all"
                                style={{background:'rgba(16,217,136,0.06)',border:'1px solid rgba(16,217,136,0.15)',color:'#10d988'}}>
                                See full recommendations page →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={bottomRef}/>
                </div>

                {/* Input */}
                <div className="p-3 flex-shrink-0" style={{borderTop:'1px solid #1e2640'}}>
                  <form onSubmit={e=>{e.preventDefault();ask(input)}} className="flex gap-2">
                    <input value={input} onChange={e=>setInput(e.target.value)}
                      placeholder="Ask for product recommendations…"
                      className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none transition-all"
                      style={{background:'#111827',border:'1px solid #1e2640',color:'#e8edf8'}}
                      onFocus={e=>(e.target.style.borderColor='#10d988')}
                      onBlur={e=>(e.target.style.borderColor='#1e2640')}/>
                    <button type="submit" disabled={loading||!input.trim()}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                      style={{background:'linear-gradient(135deg,#10d988,#0a9e62)'}}>
                      {loading ? <Loader2 size={14} className="animate-spin text-black"/> : <Send size={14} className="text-black"/>}
                    </button>
                  </form>
                  <p className="text-[10px] text-center mt-2" style={{color:'#2a3356'}}>Powered by Claude AI · Real store products</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
