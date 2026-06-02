'use client'
import { useState } from 'react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { ShoppingCart, Heart, Zap, Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  id: string; slug: string; name: string; price: number; originalPrice?: number
  image: string; stock: number; brand?: string; priceReason?: string; dynamicPrice?: boolean
}

export function ProductActions({ id, slug, name, price, originalPrice, image, stock, brand, priceReason, dynamicPrice }: Props) {
  const [qty,     setQty]     = useState(1)
  const [added,   setAdded]   = useState(false)
  const addItem   = useCartStore(s => s.addItem)
  const setOpen   = useCartStore(s => s.setCartOpen)
  const { toggle, has } = useWishlistStore()
  const wished = has(id)

  const addToCart = () => {
    if (stock === 0) return
    for (let i = 0; i < qty; i++) {
      addItem({ id, slug, name, price, originalPrice, image, stock, brand, priceReason, dynamicPrice })
    }
    setAdded(true)
    setOpen(true)
    toast.success(`${qty}× ${name} added to cart!`, { icon: '🛒', style: { background:'#131829', color:'#e8edf8', border:'1px solid #1e2640' } })
    setTimeout(() => setAdded(false), 2500)
  }

  const wishToggle = () => {
    toggle({ id, slug, name, price, image })
    toast(wished ? 'Removed from wishlist' : '❤️ Saved to wishlist', {
      style: { background:'#131829', color:'#e8edf8', border:'1px solid #1e2640' }
    })
  }

  const share = async () => {
    try {
      await navigator.share({ title: name, url: window.location.href })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="space-y-4">
      {/* Qty selector */}
      {stock > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Quantity</span>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-cx-surface border border-cx-border">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-cx-muted hover:text-cx-text hover:bg-white/5 transition-all text-lg font-600">−</button>
            <span className="w-8 text-center font-700 text-cx-text">{qty}</span>
            <button onClick={() => setQty(q => Math.min(stock, q + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-cx-muted hover:text-cx-text hover:bg-white/5 transition-all text-lg font-600">+</button>
          </div>
          <span className="text-[11px] text-cx-muted">{stock} available</span>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex gap-3">
        <button onClick={addToCart} disabled={stock === 0}
          className={cn(
            'flex-1 py-4 rounded-2xl font-700 text-[14px] flex items-center justify-center gap-2.5 transition-all duration-300',
            added   ? 'bg-cx-emerald/20 border-2 border-cx-emerald text-cx-emerald' :
            stock === 0 ? 'bg-cx-border/50 text-cx-muted cursor-not-allowed' :
            'btn-em'
          )}>
          {added
            ? <><Check size={16} className="text-cx-emerald"/> Added to Cart!</>
            : <><ShoppingCart size={16}/> {stock === 0 ? 'Out of Stock' : 'Add to Cart'}</>}
        </button>

        <button onClick={wishToggle}
          className={cn(
            'w-13 h-13 px-4 rounded-2xl border-2 flex items-center justify-center transition-all duration-300',
            wished ? 'border-cx-rose/50 bg-cx-rose/10 text-cx-rose' : 'border-cx-border text-cx-muted hover:border-cx-rose/30 hover:text-cx-rose hover:bg-cx-rose/5'
          )}>
          <Heart size={20} className={cn('transition-all', wished && 'fill-cx-rose')}/>
        </button>
      </div>

      {/* Buy now */}
      {stock > 0 && (
        <a href="/checkout" onClick={addToCart}
          className="btn-gold w-full py-3.5 rounded-2xl font-700 text-[13px] flex items-center justify-center gap-2 transition-all">
          <Zap size={14}/> Buy Now — Instant Checkout
        </a>
      )}

      {/* Share */}
      <button onClick={share}
        className="flex items-center gap-2 text-[12px] text-cx-muted hover:text-cx-emerald transition-colors mx-auto">
        <Share2 size={13}/> Share this product
      </button>
    </div>
  )
}
