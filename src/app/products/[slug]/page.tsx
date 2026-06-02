import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, calcDiscount, getStockStatus } from '@/lib/utils'
import { ProductActions } from '@/components/ProductActions'
import { ProductCard }    from '@/components/ProductCard'
import { ProductGallery } from '@/components/ProductGallery'
import { Star, Shield, Truck, RotateCcw, ChevronRight, Tag, Package, Zap, Award, CheckCircle2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  }).catch(() => null)
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug)
  if (!p) return {}
  return {
    title: `${p.name} — CortexCart`,
    description: p.description.slice(0, 160),
    openGraph: { title: p.name, description: p.description.slice(0, 100), images: p.images[0] ? [p.images[0]] : [] },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    orderBy: { reviewCount: 'desc' },
  }).catch(() => [])

  const { label: stockLabel, color: stockColor } = getStockStatus(product.stock)
  const disc  = product.comparePrice ? calcDiscount(product.comparePrice, product.currentPrice) : 0
  const attrs = product.attributes as Record<string, string> | null

  const trustFeatures = [
    { icon: Shield,    text: '2-Year Warranty',     sub: 'Full coverage' },
    { icon: Truck,     text: 'Free Shipping',        sub: 'Orders over $99' },
    { icon: RotateCcw, text: '30-Day Returns',       sub: 'No questions asked' },
    { icon: Award,     text: 'Authentic Product',    sub: '100% guaranteed' },
  ]

  return (
    <div className="page-enter min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-cx-muted mb-8 flex-wrap">
          <Link href="/"        className="hover:text-cx-emerald transition-colors">Home</Link>
          <ChevronRight size={10}/>
          <Link href="/products" className="hover:text-cx-emerald transition-colors">Products</Link>
          <ChevronRight size={10}/>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-cx-emerald transition-colors">{product.category.name}</Link>
          <ChevronRight size={10}/>
          <span className="text-cx-text truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} discount={disc} />

          {/* Info panel */}
          <div className="space-y-5">
            {/* Brand + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="badge-sky text-[10px]">{product.brand}</span>
              )}
              {product.isFeatured && (
                <span className="badge-gold text-[10px] flex items-center gap-1"><Zap size={8}/> Featured</span>
              )}
              {product.dynamicPrice && (
                <span className="badge-em text-[10px] flex items-center gap-1"><TrendingUp size={8}/> Smart Price</span>
              )}
              {disc > 0 && (
                <span className="badge-rose text-[10px]">{disc}% OFF</span>
              )}
            </div>

            <h1 className="font-display font-800 text-3xl sm:text-4xl text-white leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={15} className={s <= Math.round(product.rating) ? 'fill-cx-gold text-cx-gold' : 'text-cx-border'}/>
                  ))}
                </div>
                <span className="font-700 text-[13px] text-cx-text">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-[12px] text-cx-muted">({product.reviewCount.toLocaleString()} reviews)</span>
              <span className={`text-[12px] font-700 ${stockColor}`}>{stockLabel}</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 py-4 border-y border-cx-border/40">
              <span className="font-display font-800 text-4xl grad-emerald num">{formatPrice(product.currentPrice)}</span>
              {product.comparePrice && product.comparePrice > product.currentPrice && (
                <div className="flex flex-col">
                  <span className="text-xl text-cx-muted line-through num">{formatPrice(product.comparePrice)}</span>
                  <span className="text-[11px] text-cx-emerald font-700">
                    You save {formatPrice(product.comparePrice - product.currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic price note */}
            {product.dynamicPrice && product.priceReason && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-cx-emerald/5 border border-cx-emerald/20">
                <TrendingUp size={14} className="text-cx-emerald flex-shrink-0 mt-0.5"/>
                <p className="text-[12px] text-cx-emerald">{product.priceReason}</p>
              </div>
            )}

            {/* Description */}
            <p className="text-[14px] text-cx-muted leading-relaxed">{product.description}</p>

            {/* Specifications */}
            {attrs && Object.keys(attrs).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Specifications</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(attrs).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-cx-surface border border-cx-border">
                      <p className="text-[10px] text-cx-muted uppercase tracking-wide mb-0.5">{k}</p>
                      <p className="text-[12px] font-600 text-cx-text">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={12} className="text-cx-muted"/>
                {product.tags.map(tag => (
                  <Link key={tag} href={`/products?q=${tag}`}
                    className="tag hover:border-cx-emerald/30 hover:text-cx-emerald transition-colors text-[10px]">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Cart / Wishlist actions */}
            <ProductActions
              id={product.id} slug={product.slug} name={product.name}
              price={product.currentPrice} originalPrice={product.basePrice}
              image={product.images[0] || ''} stock={product.stock} brand={product.brand || undefined}
              priceReason={product.priceReason || undefined} dynamicPrice={product.dynamicPrice}
            />

            {/* Trust strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {trustFeatures.map(f => (
                <div key={f.text} className="flex flex-col items-center text-center p-3 rounded-xl bg-cx-surface border border-cx-border">
                  <f.icon size={16} className="text-cx-emerald mb-1.5"/>
                  <p className="text-[11px] font-700 text-cx-text">{f.text}</p>
                  <p className="text-[9px] text-cx-muted mt-0.5">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {product.reviews.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-gold to-cx-rose"/>
              <h2 className="font-display font-700 text-2xl text-white">Customer Reviews</h2>
              <span className="badge-gold text-[11px] ml-1">{product.reviews.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map(review => (
                <div key={review.id} className="p-5 rounded-2xl cx-card-flat hover:border-cx-gold/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center text-[12px] font-700 text-white">
                        {(review.user?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-700 text-cx-text">{review.user?.name || 'Customer'}</p>
                        {review.verified && (
                          <div className="flex items-center gap-1 text-[10px] text-cx-emerald">
                            <CheckCircle2 size={9}/> Verified Purchase
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className={s <= review.rating ? 'fill-cx-gold text-cx-gold' : 'text-cx-border'}/>
                      ))}
                    </div>
                  </div>
                  {review.title && <p className="font-700 text-[13px] text-cx-text mb-1">{review.title}</p>}
                  {review.body  && <p className="text-[12px] text-cx-muted leading-relaxed">{review.body}</p>}
                  <p className="text-[10px] text-cx-muted mt-3">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-sky to-cx-violet"/>
                <h2 className="font-display font-700 text-2xl text-white">Related Products</h2>
              </div>
              <Link href={`/products?category=${product.category.slug}`}
                className="text-[12px] text-cx-muted hover:text-cx-emerald transition-colors font-600 flex items-center gap-1">
                View All <ChevronRight size={13}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                  price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                  image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                  stock={p.stock} isFeatured={p.isFeatured} dynamicPrice={p.dynamicPrice}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
