'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Zap, Eye, TrendingUp, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice, calcDiscount, getStockStatus, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  id:string; slug:string; name:string; brand?:string|null
  price:number; originalPrice?:number|null; comparePrice?:number|null
  image:string; images?:string[]; rating:number; reviewCount:number
  stock:number; isFeatured?:boolean; tags?:string[]
  priceReason?:string|null; dynamicPrice?:boolean; className?:string
}

function SafeImage({ src, alt, fill, sizes, className }: { src:string; alt:string; fill?:boolean; sizes?:string; className?:string }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cx-surface to-cx-card">
        <div className="text-center">
          <ImageOff size={28} className="text-cx-muted mx-auto mb-2 opacity-40"/>
          <p className="text-[10px] text-cx-muted opacity-50">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 skeleton"/>
      )}
      <Image
        src={src} alt={alt}
        fill={fill} sizes={sizes}
        className={cn(className, 'transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        unoptimized={src.includes('unsplash.com')}
      />
    </>
  )
}

export function ProductCard({ id, slug, name, brand, price, originalPrice, comparePrice,
  image, images, rating, reviewCount, stock, isFeatured, priceReason, dynamicPrice, className }: Props) {

  const [imgIdx,   setImgIdx]   = useState(0)
  const [hovering, setHovering] = useState(false)
  const [preview,  setPreview]  = useState(false)
  const addItem     = useCartStore(s => s.addItem)
  const setOpen     = useCartStore(s => s.setCartOpen)
  const { toggle, has } = useWishlistStore()
  const wished  = has(id)
  const allImgs = images && images.length > 0 ? images : [image]
  const base    = comparePrice || originalPrice || price
  const disc    = base > price ? calcDiscount(base, price) : 0
  const { label: stockLabel, color: stockColor } = getStockStatus(stock)

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (stock === 0) return
    addItem({ id, slug, name, price, originalPrice: base, image: allImgs[0], stock, brand: brand||undefined, priceReason, dynamicPrice })
    setOpen(true)
    toast.success(`${name} added to cart!`, { icon: '🛒', style: { background: '#131829', color: '#e8edf8', border: '1px solid #1e2640' } })
  }
  const wishToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    toggle({ id, slug, name, price, image: allImgs[0] })
    toast(wished ? 'Removed from wishlist' : '❤️ Added to wishlist', {
      style: { background: '#131829', color: '#e8edf8', border: '1px solid #1e2640' }
    })
  }
  const prevImg = (e: React.MouseEvent) => { e.preventDefault(); setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length) }
  const nextImg = (e: React.MouseEvent) => { e.preventDefault(); setImgIdx(i => (i + 1) % allImgs.length) }

  return (
    <>
      <Link href={`/products/${slug}`} className={cn('group block', className)}>
        <div className={cn('relative cx-card overflow-hidden', stock === 0 && 'opacity-60')}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}>

          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cx-surface to-cx-card">
            <SafeImage src={allImgs[imgIdx]} alt={name} fill
              sizes="(max-width:768px)50vw,(max-width:1200px)33vw,25vw"
              className="object-cover group-hover:scale-[1.06] transition-transform duration-700"/>

            {/* Image nav arrows */}
            {allImgs.length > 1 && hovering && (
              <>
                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full glass flex items-center justify-center z-20 opacity-90 hover:opacity-100 hover:scale-110 transition-all">
                  <ChevronLeft size={14} className="text-white"/>
                </button>
                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full glass flex items-center justify-center z-20 opacity-90 hover:opacity-100 hover:scale-110 transition-all">
                  <ChevronRight size={14} className="text-white"/>
                </button>
              </>
            )}

            {/* Dot indicators */}
            {allImgs.length > 1 && (
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10">
                {allImgs.map((_,i) => (
                  <button key={i} onClick={e => { e.preventDefault(); setImgIdx(i) }}
                    className={cn('rounded-full transition-all duration-200', i===imgIdx ? 'w-4 h-1.5 bg-cx-emerald' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70')}/>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {disc > 0      && <span className="badge-rose text-[10px]">-{disc}%</span>}
              {isFeatured    && <span className="badge-gold text-[10px] flex items-center gap-1"><Zap size={8}/>Featured</span>}
              {stock<=5&&stock>0 && <span className="badge-rose text-[10px]">Low Stock</span>}
              {dynamicPrice  && <span className="badge-em text-[10px] flex items-center gap-1"><TrendingUp size={8}/>Smart Price</span>}
            </div>

            {/* Wishlist */}
            <button onClick={wishToggle}
              className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
              <Heart size={14} className={cn('transition-colors', wished ? 'fill-cx-rose text-cx-rose' : 'text-white')}/>
            </button>

            {/* Quick preview overlay */}
            <div className={cn('absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300', hovering && 'opacity-100')}>
              <button onClick={e => { e.preventDefault(); setPreview(true) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full glass text-[12px] font-600 text-white hover:bg-white/20 transition-colors border border-white/20">
                <Eye size={13}/> Quick View
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            {brand && <p className="text-[10px] font-700 text-cx-muted uppercase tracking-wider mb-0.5">{brand}</p>}
            <h3 className="text-[13px] font-600 text-cx-text leading-snug line-clamp-2 mb-2 group-hover:text-cx-emerald transition-colors">{name}</h3>

            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} size={10} className={cn(s<=Math.round(rating)?'fill-cx-gold text-cx-gold':'text-cx-border')}/>)}</div>
              <span className="text-[10px] text-cx-muted">({reviewCount.toLocaleString()})</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-800 text-[17px] grad-emerald num">{formatPrice(price)}</span>
                  {base > price && <span className="text-[11px] text-cx-muted line-through">{formatPrice(base)}</span>}
                </div>
                {priceReason && <p className="text-[10px] text-cx-emerald/70 mt-0.5">{priceReason}</p>}
                <p className={cn('text-[10px] mt-0.5 font-600', stockColor)}>{stockLabel}</p>
              </div>
              <button onClick={addToCart} disabled={stock===0}
                className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                  stock===0 ? 'bg-cx-border/50 text-cx-muted cursor-not-allowed' : 'bg-gradient-to-br from-cx-emerald to-cx-sky text-cx-bg hover:shadow-cx-em hover:scale-110 active:scale-95')}>
                <ShoppingCart size={15}/>
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreview(false)}>
          <div className="bg-cx-card border border-cx-border rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto animate-scale-in shadow-[0_40px_120px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-cx-border">
              <h3 className="font-display font-700 text-white text-[16px] truncate mr-4">{name}</h3>
              <button onClick={() => setPreview(false)} className="w-8 h-8 rounded-xl bg-cx-border flex items-center justify-center text-cx-muted hover:text-cx-text transition-colors flex-shrink-0">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
              <div className="space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-cx-surface">
                  <SafeImage src={allImgs[imgIdx]} alt={name} fill className="object-cover" sizes="400px"/>
                </div>
                {allImgs.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImgs.slice(0,4).map((img,i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={cn('relative aspect-square rounded-xl overflow-hidden border-2 transition-all', i===imgIdx ? 'border-cx-emerald' : 'border-cx-border hover:border-cx-emerald/40')}>
                        <SafeImage src={img} alt={`${name} ${i+1}`} fill className="object-cover" sizes="80px"/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {brand && <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">{brand}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  {disc > 0      && <span className="badge-rose">{disc}% OFF</span>}
                  {isFeatured    && <span className="badge-gold">Featured</span>}
                  {dynamicPrice  && <span className="badge-em">Smart Price</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(s=><Star key={s} size={13} className={s<=Math.round(rating)?'fill-cx-gold text-cx-gold':'text-cx-border'}/>)}
                  <span className="text-[12px] text-cx-muted ml-1">({reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="font-display font-800 text-3xl grad-emerald num">{formatPrice(price)}</span>
                  {base > price && <span className="text-lg text-cx-muted line-through">{formatPrice(base)}</span>}
                </div>
                <p className={cn('text-[12px] font-600', stockColor)}>{stockLabel}</p>
                <div className="flex gap-3 pt-2">
                  <button onClick={addToCart} disabled={stock===0}
                    className="btn-em flex-1 py-3 text-[13px] font-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    <ShoppingCart size={15}/> Add to Cart
                  </button>
                  <button onClick={wishToggle}
                    className={cn('w-11 h-11 rounded-xl border flex items-center justify-center transition-all', wished ? 'border-cx-rose/50 bg-cx-rose/10 text-cx-rose' : 'border-cx-border text-cx-muted hover:text-cx-rose hover:border-cx-rose/30')}>
                    <Heart size={18} className={cn(wished && 'fill-cx-rose')}/>
                  </button>
                </div>
                <Link href={`/products/${slug}`} onClick={() => setPreview(false)}
                  className="block text-center text-[12px] text-cx-emerald hover:underline mt-2">
                  View full details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
