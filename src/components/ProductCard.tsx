'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Zap, Eye, TrendingUp } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, calcDiscount, getStockStatus, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  id: string; slug: string; name: string; brand?: string|null
  price: number; originalPrice?: number|null; comparePrice?: number|null
  image: string; images?: string[]; rating: number; reviewCount: number
  stock: number; isFeatured?: boolean; tags?: string[]
  priceReason?: string|null; dynamicPrice?: boolean; className?: string
}

export function ProductCard({ id, slug, name, brand, price, originalPrice, comparePrice,
  image, images, rating, reviewCount, stock, isFeatured, priceReason, dynamicPrice, className }: Props) {
  const [imgIdx, setImgIdx] = useState(0)
  const [hovering, setHovering] = useState(false)
  const addItem    = useCartStore(s => s.addItem)
  const setOpen    = useCartStore(s => s.setCartOpen)
  const { toggle, has } = useWishlistStore()
  const wished = has(id)
  const base   = comparePrice || originalPrice || price
  const disc   = base > price ? calcDiscount(base, price) : 0
  const { label: stockLabel, color: stockColor } = getStockStatus(stock)
  const cur = images?.[imgIdx] ?? image

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (stock === 0) return
    addItem({ id, slug, name, price, originalPrice: base, image, stock, brand: brand||undefined, priceReason, dynamicPrice })
    setOpen(true)
    toast.success(`${name} added!`, { icon: '🛒' })
  }
  const wishToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    toggle({ id, slug, name, price, image })
    toast(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  return (
    <Link href={`/products/${slug}`} className={cn('group block', className)}>
      <div className={cn('relative cx-card overflow-hidden transition-all duration-350', stock===0 && 'opacity-60')}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setImgIdx(0) }}>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-cx-surface img-zoom">
          <Image src={cur} alt={name} fill className="object-cover" sizes="(max-width:768px)50vw,(max-width:1200px)33vw,25vw" />

          {/* Image switcher */}
          {images && images.length > 1 && hovering && (
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_,i) => (
                <button key={i} onMouseEnter={e=>{e.preventDefault();setImgIdx(i)}}
                  className={cn('h-1.5 rounded-full transition-all duration-200',i===imgIdx?'w-4 bg-cx-emerald':'w-1.5 bg-white/40')} />
              ))}
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {disc > 0   && <span className="badge-rose text-[10px]">-{disc}%</span>}
            {isFeatured && <span className="badge-gold text-[10px] flex items-center gap-1"><Zap size={8}/>HOT</span>}
            {stock<=5 && stock>0 && <span className="badge-rose text-[10px]">LOW STOCK</span>}
            {dynamicPrice && <span className="badge-em text-[10px] flex items-center gap-1"><TrendingUp size={8}/>AI PRICE</span>}
          </div>

          {/* Wishlist */}
          <button onClick={wishToggle}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
            <Heart size={14} className={cn('transition-colors', wished ? 'fill-cx-rose text-cx-rose' : 'text-white')} />
          </button>

          {/* Hover overlay */}
          <div className={cn('absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 transition-opacity duration-300', hovering && 'opacity-100')}>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-600 text-white pointer-events-none">
              <Eye size={12}/> Quick View
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {brand && <p className="text-[10px] font-700 text-cx-muted uppercase tracking-wider mb-0.5">{brand}</p>}
          <h3 className="text-[13px] font-600 text-cx-text leading-snug line-clamp-2 mb-2 group-hover:text-cx-emerald transition-colors">{name}</h3>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} size={10} className={cn(s<=Math.round(rating)?'fill-cx-gold text-cx-gold':'text-cx-border')}/>)}</div>
            <span className="text-[10px] text-cx-muted">({reviewCount.toLocaleString()})</span>
          </div>

          {/* Price + add to cart */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-800 text-lg grad-emerald num">{formatPrice(price)}</span>
                {base > price && <span className="text-[11px] text-cx-muted line-through">{formatPrice(base)}</span>}
              </div>
              {priceReason && <p className="text-[10px] text-cx-emerald/70 mt-0.5">{priceReason}</p>}
              <p className={cn('text-[10px] mt-0.5', stockColor)}>{stockLabel}</p>
            </div>
            <button onClick={addToCart} disabled={stock===0}
              className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                stock===0 ? 'bg-cx-border/50 text-cx-muted cursor-not-allowed' : 'bg-gradient-to-br from-cx-emerald to-cx-sky text-cx-bg hover:shadow-cx-em hover:scale-110')}>
              <ShoppingCart size={15}/>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
