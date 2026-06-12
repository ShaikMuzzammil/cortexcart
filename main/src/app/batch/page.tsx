'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Upload, FileText, X, Sparkles, ShoppingCart, Heart,
  Loader2, Star, ChevronRight, Download, RotateCcw,
  AlertCircle, CheckCircle2, Package, ArrowRight, Zap
} from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; compare: number; image: string
  rating: number; reviews: number; category: string; reason: string
}
interface BatchResult { query: string; recommendations: Product[]; error?: string }

const EXAMPLES = [
  { label: 'Gaming Setup', content: 'gaming mouse\ngaming keyboard\ngaming headset\nmonitor 27 inch\ngaming chair' },
  { label: 'Home Office', content: 'ergonomic chair\ndesk lamp\nwebcam\nwireless keyboard\nmouse' },
  { label: 'Fitness Pack', content: 'resistance bands\nyoga mat\njump rope\ndumbbells\nwater bottle' },
]

export default function BatchPage() {
  const [queries,   setQueries]   = useState('')
  const [file,      setFile]      = useState<File | null>(null)
  const [results,   setResults]   = useState<BatchResult[]>([])
  const [loading,   setLoading]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [dragOver,  setDragOver]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { addItem }         = useCartStore()
  const { toggle, has }     = useWishlistStore()

  const parseFile = async (f: File): Promise<string> => {
    const text = await f.text()
    if (f.name.endsWith('.csv')) {
      return text.split('\n')
        .map(l => l.split(',')[0].replace(/^["']|["']$/g,'').trim())
        .filter(Boolean).join('\n')
    }
    return text
  }

  const runBatch = useCallback(async () => {
    let raw = queries
    if (file) { try { raw = await parseFile(file) } catch { toast.error('Failed to read file'); return } }
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 1).slice(0, 20)
    if (!lines.length) { toast.error('Add at least one product query'); return }

    setLoading(true); setResults([]); setProgress(0)
    const out: BatchResult[] = []

    for (let i = 0; i < lines.length; i++) {
      const q = lines[i]
      try {
        const res  = await fetch('/api/ai/recommend', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ query: q }),
        })
        const data = await res.json()
        out.push({ query: q, recommendations: data.recommendations || [] })
      } catch {
        out.push({ query: q, recommendations: [], error: 'Failed' })
      }
      setProgress(Math.round(((i+1)/lines.length)*100))
      setResults([...out])
    }
    setLoading(false)
    toast.success(`${lines.length} queries processed!`)
  }, [queries, file])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.txt'))) {
      setFile(f); f.text().then(t => setQueries(t.split('\n').map(l=>l.split(',')[0].trim()).filter(Boolean).join('\n')))
    } else toast.error('Please upload a .csv or .txt file')
  }, [])

  const exportCSV = () => {
    const rows = [['Query','Product','Brand','Price','Rating','Link']]
    results.forEach(r => r.recommendations.forEach(p => {
      rows.push([r.query, p.name, p.brand||'', `$${p.price}`, `${p.rating}★`, `/products/${p.slug}`])
    }))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'cortexcart-recommendations.csv'
    a.click()
  }

  const totalFound = results.reduce((a, r) => a + r.recommendations.length, 0)

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-violet/20 mb-5">
            <Sparkles size={13} className="text-cx-violet"/>
            <span className="text-[11px] font-700 text-cx-violet uppercase tracking-[0.12em]">Bulk AI Recommendations</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-white mb-4">
            Batch <span className="grad-multi">Product Search</span>
          </h1>
          <p className="text-cx-dim text-[15px] max-w-xl mx-auto">
            Upload a CSV or TXT file — or type queries line by line — and our AI will find the best matching products from our catalog for each one.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Example presets */}
            <div className="cx-card p-5">
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-3">Quick Examples</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(ex => (
                  <button key={ex.label} onClick={() => { setQueries(ex.content); setFile(null) }}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-600 bg-cx-violet/10 text-cx-violet border border-cx-violet/20 hover:bg-cx-violet/20 transition-all">
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div className="cx-card p-5">
              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-3">
                Product Queries (one per line, max 20)
              </label>
              <textarea
                value={queries}
                onChange={e => setQueries(e.target.value)}
                placeholder={"gaming mouse\nwireless earbuds\nrunning shoes\ncoffee maker\n..."}
                rows={8}
                className="cx-input w-full text-[13px] resize-none font-mono"
                style={{ lineHeight: 1.8 }}
              />
              <p className="text-[11px] text-cx-muted mt-2">
                {queries.split('\n').filter(l => l.trim()).length} queries entered
              </p>
            </div>

            {/* File upload */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'cx-card p-6 border-dashed cursor-pointer transition-all text-center',
                dragOver ? 'border-cx-emerald/60 bg-cx-emerald/5' : 'hover:border-cx-emerald/30'
              )}>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setFile(f)
                  f.text().then(t => {
                    const lines = t.split('\n').map(l => l.split(',')[0].trim()).filter(Boolean)
                    setQueries(lines.join('\n'))
                    toast.success(`Loaded ${lines.length} queries from ${f.name}`)
                  })
                }}/>
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} className="text-cx-emerald"/>
                  <div className="text-left">
                    <p className="text-[13px] font-700 text-cx-text">{file.name}</p>
                    <p className="text-[11px] text-cx-muted">{(file.size/1024).toFixed(1)}KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto w-7 h-7 rounded-full bg-cx-rose/10 flex items-center justify-center text-cx-rose hover:bg-cx-rose/20">
                    <X size={12}/>
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-cx-muted mx-auto mb-3"/>
                  <p className="text-[13px] font-700 text-cx-text mb-1">Drop CSV or TXT file here</p>
                  <p className="text-[11px] text-cx-muted">or click to browse · CSV format: query,brand</p>
                </>
              )}
            </div>

            {/* CSV format hint */}
            <div className="cx-card p-4">
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">CSV Format</p>
              <div className="font-mono text-[11px] text-cx-dim bg-cx-bg rounded-lg p-3">
                <p style={{color:'#4a5a7a'}}>query,brand (optional)</p>
                <p>gaming mouse,Logitech</p>
                <p>wireless earbuds,</p>
                <p>yoga mat,</p>
              </div>
            </div>

            {/* Run button */}
            <button onClick={runBatch} disabled={loading || (!queries.trim() && !file)}
              className="btn-em w-full py-4 text-[15px] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50">
              {loading
                ? <><Loader2 size={18} className="animate-spin"/> Processing ({progress}%)…</>
                : <><Sparkles size={18}/> Run Batch Recommendations <ArrowRight size={15}/></>}
            </button>

            {loading && (
              <div className="cx-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-cx-muted">Progress</span>
                  <span className="text-[12px] font-700 text-cx-emerald">{progress}%</span>
                </div>
                <div className="h-2 bg-cx-border rounded-full overflow-hidden">
                  <div className="h-full bg-cx-emerald rounded-full transition-all duration-300" style={{ width:`${progress}%` }}/>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {results.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-cx-dim">
                  <span className="text-white font-700">{totalFound}</span> products found across <span className="text-cx-emerald font-700">{results.length}</span> queries
                </p>
                <div className="flex gap-2">
                  <button onClick={exportCSV} className="btn-outline-em px-3 py-1.5 text-[12px] rounded-xl flex items-center gap-1.5">
                    <Download size={12}/> Export CSV
                  </button>
                  <button onClick={() => { setResults([]); setProgress(0) }} className="px-3 py-1.5 text-[12px] rounded-xl bg-cx-rose/10 text-cx-rose border border-cx-rose/20 flex items-center gap-1.5 hover:bg-cx-rose/15 transition-all">
                    <RotateCcw size={12}/> Clear
                  </button>
                </div>
              </div>
            )}

            {results.length === 0 && !loading && (
              <div className="cx-card p-10 text-center">
                <Sparkles size={32} className="text-cx-violet mx-auto mb-4 opacity-40"/>
                <p className="text-[15px] font-700 text-cx-dim mb-2">Results will appear here</p>
                <p className="text-[12px] text-cx-muted">Enter your queries and click Run to get AI-matched products from our catalog</p>
              </div>
            )}

            {results.map((r, ri) => (
              <div key={ri} className="cx-card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-cx-border/50">
                  {r.error
                    ? <AlertCircle size={14} className="text-cx-rose flex-shrink-0"/>
                    : r.recommendations.length
                    ? <CheckCircle2 size={14} className="text-cx-emerald flex-shrink-0"/>
                    : <Package size={14} className="text-cx-muted flex-shrink-0"/>}
                  <span className="text-[13px] font-700 text-cx-text truncate">"{r.query}"</span>
                  <span className={cn('ml-auto text-[11px] font-700 px-2 py-0.5 rounded-full flex-shrink-0',
                    r.recommendations.length ? 'bg-cx-emerald/10 text-cx-emerald' : 'bg-cx-rose/10 text-cx-rose')}>
                    {r.recommendations.length} found
                  </span>
                </div>
                {r.recommendations.length > 0 ? (
                  <div className="p-3 space-y-2">
                    {r.recommendations.slice(0, 2).map(p => {
                      const disc = p.compare > p.price ? Math.round((1-p.price/p.compare)*100) : 0
                      return (
                        <div key={p.id} className="flex gap-3 p-2.5 rounded-xl bg-cx-surface hover:bg-cx-card transition-all group">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-cx-bg">
                            {p.image
                              ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                              : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-cx-border"/></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-700 text-cx-text truncate">{p.name}</p>
                            <p className="text-[10px] text-cx-muted mb-1">{p.reason}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-800 text-cx-emerald">{formatPrice(p.price)}</span>
                              {disc > 0 && <span className="text-[10px] text-cx-rose">-{disc}%</span>}
                              <div className="flex items-center gap-0.5 ml-auto">
                                <Star size={9} className="fill-cx-gold text-cx-gold"/>
                                <span className="text-[10px] text-cx-muted">{p.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button onClick={() => { addItem({ id:p.id, slug:p.slug, name:p.name, price:p.price, originalPrice:p.compare||p.price, image:p.image, stock:99, brand:p.brand||undefined }); toast.success('Added!') }}
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
                    {r.recommendations.length > 2 && (
                      <Link href={`/products?q=${encodeURIComponent(r.query)}`}
                        className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-cx-violet hover:text-cx-violet/80 transition-colors">
                        View {r.recommendations.length - 2} more results <ChevronRight size={11}/>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-[12px] text-cx-muted">
                    No matches found. <Link href={`/products?q=${encodeURIComponent(r.query)}`} className="text-cx-emerald hover:underline">Browse all →</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
