'use client'
import { useCartStore }   from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, cn } from '@/lib/utils'
import Image   from 'next/image'
import Link    from 'next/link'
import { X, ShoppingCart, Plus, Minus, Trash2, Heart, ArrowRight, Package, Zap, ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'

function ItemImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false)
  if (err || !src) return (
    <div className="absolute inset-0 flex items-center justify-center bg-cx-surface">
      <ImageOff size={16} className="text-cx-muted opacity-40" />
    </div>
  )
  return <Image src={src} alt={alt} fill className="object-cover" sizes="56px" onError={() => setErr(true)} unoptimized={src.includes('unsplash')} />
}

export function CartDrawer() {
  const { items, isOpen, setCartOpen, updateQty, removeItem, subtotal, totalItems } = useCartStore()
  const { items: wishItems, toggle: wishToggle } = useWishlistStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const sub      = subtotal()
  const total    = mounted ? totalItems() : 0
  const freeAt   = 99
  const progress = Math.min((sub / freeAt) * 100, 100)

  const saveForLater = (item: typeof items[0]) => {
    wishToggle({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image })
    removeItem(item.id)
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] transition-opacity duration-300"
          onClick={() => setCartOpen(false)} />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full sm:w-[420px] z-[90] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )} style={{ background: '#080e1c', borderLeft: '1px solid #1c2540' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cx-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20 flex items-center justify-center">
              <ShoppingCart size={16} className="text-cx-emerald" />
            </div>
            <div>
              <h2 className="font-display font-700 text-[15px] text-white">Shopping Cart</h2>
              <p className="text-[11px] text-cx-muted">{total} {total === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-xl bg-cx-surface border border-cx-border flex items-center justify-center text-cx-muted hover:text-cx-text hover:border-cx-emerald/20 transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Free shipping bar */}
        {sub < freeAt && items.length > 0 && (
          <div className="px-5 py-3 border-b border-cx-border/40 bg-cx-emerald/3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-cx-muted font-600">Add {formatPrice(freeAt - sub)} for FREE shipping</span>
              <span className="text-[10px] text-cx-emerald font-700">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-cx-surface overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cx-emerald to-cx-sky transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {sub >= freeAt && items.length > 0 && (
          <div className="px-5 py-2.5 border-b border-cx-border/40 flex items-center gap-2 bg-cx-emerald/5">
            <Zap size={12} className="text-cx-emerald" />
            <span className="text-[11px] text-cx-emerald font-700">You've unlocked FREE shipping! 🎉</span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-cx-surface border border-cx-border flex items-center justify-center mb-5">
                <Package size={32} className="text-cx-muted opacity-40" />
              </div>
              <h3 className="font-700 text-[15px] text-cx-text mb-2">Cart is empty</h3>
              <p className="text-[12px] text-cx-muted mb-6 max-w-[200px]">Discover AI-curated products waiting for you</p>
              <Link href="/products" onClick={() => setCartOpen(false)}
                className="btn-em px-6 py-2.5 text-[12px] font-700 rounded-xl flex items-center gap-2">
                Start Shopping <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-cx-surface border border-cx-border hover:border-cx-emerald/15 transition-all group">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-cx-border bg-cx-card">
                  <ItemImage src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-700 text-cx-text leading-tight truncate mb-0.5">{item.name}</p>
                  {item.brand && <p className="text-[10px] text-cx-muted mb-1">{item.brand}</p>}
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-800 grad-emerald num">{formatPrice(item.price)}</p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-[10px] text-cx-muted line-through">{formatPrice(item.originalPrice)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <button onClick={() => removeItem(item.id)}
                    className="w-6 h-6 rounded-lg text-cx-muted hover:text-cx-rose hover:bg-cx-rose/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={11} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-cx-card border border-cx-border flex items-center justify-center text-cx-muted hover:text-cx-text hover:border-cx-emerald/30 transition-all">
                      <Minus size={10} />
                    </button>
                    <span className="text-[12px] font-700 text-cx-text w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}
                      className="w-6 h-6 rounded-lg bg-cx-card border border-cx-border flex items-center justify-center text-cx-muted hover:text-cx-text hover:border-cx-emerald/30 transition-all disabled:opacity-40">
                      <Plus size={10} />
                    </button>
                  </div>
                  <button onClick={() => saveForLater(item)}
                    className="flex items-center gap-1 text-[10px] text-cx-muted hover:text-cx-rose transition-colors">
                    <Heart size={10} /> Save
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-cx-border/60 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-cx-muted">Subtotal ({total} items)</span>
              <span className="font-display font-800 text-[18px] grad-emerald num">{formatPrice(sub)}</span>
            </div>
            <p className="text-[11px] text-cx-muted">Tax & shipping calculated at checkout</p>
            <Link href="/checkout" onClick={() => setCartOpen(false)}
              className="btn-em w-full py-4 text-[14px] font-700 rounded-2xl flex items-center justify-center gap-2 group">
              Checkout
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/products" onClick={() => setCartOpen(false)}
              className="block text-center text-[12px] text-cx-muted hover:text-cx-text transition-colors py-1">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
