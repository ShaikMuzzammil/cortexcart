'use client'
import { useState } from 'react'
import { ShoppingCart, Heart, Minus, Plus, Zap } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { product:{ id:string; slug:string; name:string; price:number; originalPrice:number; image:string; stock:number; brand?:string|null } }

export function ProductActions({ product }: Props) {
  const [qty,   setQty]   = useState(1)
  const [added, setAdded] = useState(false)
  const addItem    = useCartStore(s => s.addItem)
  const setCartOpen = useCartStore(s => s.setCartOpen)
  const { toggle, has } = useWishlistStore()
  const wished = has(product.id)

  const doAdd = () => {
    for (let i = 0; i < qty; i++) addItem({ id:product.id, slug:product.slug, name:product.name, price:product.price, originalPrice:product.originalPrice, image:product.image, stock:product.stock, brand:product.brand||undefined })
    setAdded(true); setCartOpen(true)
    toast.success(`${qty}× ${product.name} added!`, { icon:'🛒' })
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Qty */}
      <div className="flex items-center gap-4">
        <span className="text-[12px] font-600 text-cx-muted">Quantity</span>
        <div className="flex items-center gap-2 p-1 rounded-xl cx-card-flat">
          <button onClick={() => setQty(q=>Math.max(1,q-1))} className="w-8 h-8 rounded-lg bg-cx-border hover:bg-cx-border2 flex items-center justify-center text-cx-text transition-colors">
            <Minus size={13}/>
          </button>
          <span className="w-8 text-center font-700 text-cx-text">{qty}</span>
          <button onClick={() => setQty(q=>Math.min(product.stock,q+1))} disabled={qty>=product.stock} className="w-8 h-8 rounded-lg bg-cx-border hover:bg-cx-border2 flex items-center justify-center text-cx-text transition-colors disabled:opacity-40">
            <Plus size={13}/>
          </button>
        </div>
        {product.stock<=10&&product.stock>0 && <span className="text-[11px] text-orange-400">Only {product.stock} left!</span>}
      </div>

      <div className="flex gap-3">
        <button onClick={doAdd} disabled={product.stock===0}
          className={cn('btn-em flex-1 py-4 text-[14px] rounded-2xl flex items-center justify-center gap-2 transition-all', added&&'scale-95', product.stock===0&&'opacity-50 cursor-not-allowed')}>
          <ShoppingCart size={17}/>{added?'✓ Added!':product.stock===0?'Out of Stock':'Add to Cart'}
        </button>
        <button onClick={() => { toggle({id:product.id,slug:product.slug,name:product.name,price:product.price,image:product.image}); toast(wished?'Removed from wishlist':'❤️ Saved to wishlist') }}
          className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center transition-all', wished?'border-cx-rose/50 bg-cx-rose/10 text-cx-rose':'border-cx-border cx-card-flat text-cx-muted hover:text-cx-rose hover:border-cx-rose/30')}>
          <Heart size={20} className={cn(wished&&'fill-cx-rose')}/>
        </button>
      </div>

      <button onClick={() => { doAdd(); window.location.href='/checkout' }} disabled={product.stock===0}
        className="w-full py-3.5 rounded-2xl border border-cx-gold/30 text-cx-gold font-700 text-[13px] hover:bg-cx-gold/8 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
        <Zap size={15}/> Buy Now — Express Checkout
      </button>
    </div>
  )
}
