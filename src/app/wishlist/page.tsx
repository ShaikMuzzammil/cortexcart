'use client'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore }     from '@/store/cart'
import { formatPrice }       from '@/lib/utils'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, Package, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)
  const setOpen = useCartStore(s => s.setCartOpen)
  const [mounted, _] = useState(true)

  const moveToCart = (item: typeof items[0]) => {
    addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, originalPrice: item.price, image: item.image, stock: 99 })
    toggle(item)
    setOpen(true)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <div className="page-enter min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cx-rose/10 border border-cx-rose/20 flex items-center justify-center">
            <Heart size={18} className="text-cx-rose"/>
          </div>
          <div>
            <h1 className="font-display font-800 text-3xl text-white">My Wishlist</h1>
            <p className="text-[12px] text-cx-muted">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <button onClick={() => {
              items.forEach(i => { addItem({ id:i.id, slug:i.slug, name:i.name, price:i.price, originalPrice:i.price, image:i.image, stock:99 }); toggle(i) })
              setOpen(true)
              toast.success('All items moved to cart! 🛒')
            }} className="ml-auto btn-em px-5 py-2.5 text-[13px] font-700 rounded-xl flex items-center gap-2">
              <ShoppingCart size={14}/> Move All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-cx-surface border border-cx-border flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-cx-muted opacity-30"/>
            </div>
            <h2 className="font-700 text-xl text-cx-text mb-3">No saved items yet</h2>
            <p className="text-cx-muted text-[13px] mb-6 max-w-xs mx-auto">Browse products and click the ❤️ to save them here.</p>
            <Link href="/products" className="btn-em px-7 py-3 text-[13px] font-700 rounded-xl inline-flex items-center gap-2">
              Browse Products <ArrowRight size={14}/>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className="p-5 rounded-2xl cx-card group hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-cx-surface border border-cx-border mb-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="flex items-center justify-center h-full text-3xl">📦</div>
                  )}
                  <button onClick={() => toggle(item)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-cx-rose hover:bg-cx-rose/20 transition-all">
                    <Trash2 size={13}/>
                  </button>
                </div>
                <h3 className="font-700 text-[14px] text-cx-text mb-1 line-clamp-2 group-hover:text-cx-emerald transition-colors">{item.name}</h3>
                <p className="font-800 text-[17px] grad-emerald num mb-4">{formatPrice(item.price)}</p>
                <div className="flex gap-2">
                  <button onClick={() => moveToCart(item)}
                    className="btn-em flex-1 py-2.5 text-[12px] font-700 rounded-xl flex items-center justify-center gap-1.5">
                    <ShoppingCart size={13}/> Add to Cart
                  </button>
                  <Link href={`/products/${item.slug}`}
                    className="px-3 py-2.5 rounded-xl border border-cx-border text-cx-muted hover:text-cx-text hover:border-cx-emerald/20 transition-all flex items-center justify-center">
                    <Package size={14}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
