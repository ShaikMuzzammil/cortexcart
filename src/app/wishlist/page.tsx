'use client'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore }     from '@/store/cart'
import { ProductCard }      from '@/components/ProductCard'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, toggle, clear } = useWishlistStore()
  const { addItem, setCartOpen }  = useCartStore()

  const moveAll = () => {
    items.forEach(item => addItem({ id:item.id, slug:item.slug, name:item.name, price:item.price, originalPrice:item.price, image:item.image, stock:99 }))
    setCartOpen(true)
    toast.success('All items added to cart!')
  }

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={17} className="text-cx-rose fill-cx-rose"/>
              <span className="text-[11px] font-700 text-cx-rose uppercase tracking-widest">Saved Items</span>
            </div>
            <h1 className="font-display font-800 text-3xl text-white">
              My Wishlist <span className="text-cx-muted text-xl font-400">({items.length})</span>
            </h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button onClick={moveAll} className="btn-em px-5 py-2.5 text-[13px] font-700 rounded-xl flex items-center gap-2">
                <ShoppingBag size={14}/> Add All to Cart
              </button>
              <button onClick={clear} className="p-2.5 rounded-xl border border-cx-rose/20 text-cx-rose hover:bg-cx-rose/10 transition-colors">
                <Trash2 size={15}/>
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-24 h-24 rounded-3xl cx-card-flat flex items-center justify-center">
              <Heart size={36} className="text-cx-muted"/>
            </div>
            <div>
              <p className="font-display font-700 text-2xl text-white mb-2">Your wishlist is empty</p>
              <p className="text-cx-muted text-[13px]">Save products you love and come back to them later</p>
            </div>
            <Link href="/products" className="btn-em px-6 py-3 text-[13px] font-700 rounded-2xl inline-flex items-center gap-2">
              Browse Products <ArrowRight size={14}/>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map(item => (
              <div key={item.id} className="relative">
                <ProductCard id={item.id} slug={item.slug} name={item.name} price={item.price} image={item.image} rating={4.5} reviewCount={100} stock={10}/>
                <button onClick={() => { toggle(item); toast('Removed from wishlist') }}
                  className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg bg-cx-rose/10 border border-cx-rose/20 text-cx-rose text-[11px] font-600 hover:bg-cx-rose/20 transition-colors flex items-center gap-1">
                  <Trash2 size={10}/> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
