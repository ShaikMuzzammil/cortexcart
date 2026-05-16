'use client'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingBag, Trash2, Plus, Minus, Zap, ArrowRight, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, subtotal, totalItems, totalSavings } = useCartStore()
  const sub      = subtotal()
  const savings  = totalSavings()
  const shipping = sub >= 99 ? 0 : 9.99
  const tax      = sub * 0.08
  const total    = sub + shipping + tax

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setCartOpen(false)} />}

      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-[420px] z-50 flex flex-col transition-transform duration-500 ease-out',
        'bg-cx-surface border-l border-cx-border',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cx-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-cx-emerald" />
            <span className="font-display font-700 text-cx-text">Your Cart</span>
            {totalItems() > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-700 bg-cx-emerald/10 text-cx-emerald border border-cx-emerald/25">{totalItems()}</span>
            )}
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl text-cx-muted hover:text-cx-text hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Free shipping bar */}
        {sub > 0 && sub < 99 && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-cx-violet/8 border border-cx-violet/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-cx-muted">Add <strong className="text-cx-text">{formatPrice(99 - sub)}</strong> for free shipping</span>
              <Tag size={11} className="text-cx-violet" />
            </div>
            <div className="h-1.5 bg-cx-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cx-violet to-cx-emerald rounded-full transition-all duration-500" style={{ width: `${Math.min((sub/99)*100,100)}%` }} />
            </div>
          </div>
        )}
        {sub >= 99 && sub > 0 && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-cx-emerald/8 border border-cx-emerald/20 text-[11px] text-cx-emerald flex items-center gap-2">
            <Zap size={12} /> Free shipping unlocked!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl cx-card-flat flex items-center justify-center">
                <ShoppingBag size={30} className="text-cx-muted" />
              </div>
              <div>
                <p className="font-600 text-cx-text">Your cart is empty</p>
                <p className="text-[13px] text-cx-muted mt-1">Add some amazing products</p>
              </div>
              <Link href="/products" onClick={() => setCartOpen(false)}
                className="btn-em px-6 py-2.5 text-[13px] rounded-xl inline-flex items-center gap-2">
                Browse Products <ArrowRight size={14} />
              </Link>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 rounded-2xl cx-card-flat group">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-cx-card">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-600 text-cx-text truncate">{item.name}</p>
                {item.priceReason && <span className="text-[9px] badge-em">{item.priceReason}</span>}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="grad-emerald font-800 text-[13px] num">{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && <span className="text-[11px] text-cx-muted line-through">{formatPrice(item.originalPrice)}</span>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity-1)}
                      className="w-6 h-6 rounded-lg bg-cx-border hover:bg-cx-border2 flex items-center justify-center text-cx-muted hover:text-cx-text transition-colors">
                      <Minus size={9} />
                    </button>
                    <span className="w-6 text-center text-[12px] font-700 text-cx-text">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity+1)} disabled={item.quantity>=item.stock}
                      className="w-6 h-6 rounded-lg bg-cx-border hover:bg-cx-border2 flex items-center justify-center text-cx-muted hover:text-cx-text transition-colors disabled:opacity-40">
                      <Plus size={9} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-cx-muted hover:text-cx-rose hover:bg-cx-rose/10 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cx-border px-4 py-4 space-y-2.5">
            {savings > 0 && (
              <div className="flex justify-between text-[12px]">
                <span className="text-cx-emerald flex items-center gap-1.5"><Zap size={11}/> Savings</span>
                <span className="text-cx-emerald font-700">-{formatPrice(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-[12px] text-cx-muted">
              <span>Shipping</span>
              <span className={shipping===0?'text-cx-emerald':'text-cx-text'}>{shipping===0?'FREE':formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-cx-muted">
              <span>Tax (8%)</span><span className="text-cx-text">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-cx-border">
              <span className="font-700 text-cx-text">Total</span>
              <span className="font-display font-800 text-xl grad-emerald num">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}
              className="btn-em w-full py-3.5 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2 mt-1">
              Checkout <ArrowRight size={15} />
            </Link>
            <button onClick={() => setCartOpen(false)} className="w-full text-center text-[12px] text-cx-muted hover:text-cx-text transition-colors py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
