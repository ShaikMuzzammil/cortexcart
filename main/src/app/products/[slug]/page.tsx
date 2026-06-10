import { SimilarProducts } from '@/components/SimilarProducts'
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice, calcDiscount, getStockStatus } from '@/lib/utils'
import { ProductActions }  from '@/components/ProductActions'
import { ProductCard }     from '@/components/ProductCard'
import { ProductGallery }  from '@/components/ProductGallery'
import { Star, Shield, Truck, RotateCcw, ChevronRight, Award, Tag, Package } from 'lucide-react'

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug)
  if (!p) return {}
  return { title: `${p.name} — CortexCart`, description: p.description.slice(0, 160) }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
  })
  const { label: stockLabel, color: stockColor } = getStockStatus(product.stock)
  const disc  = product.comparePrice ? calcDiscount(product.comparePrice, product.currentPrice) : 0
  const attrs = product.attributes as Record<string,string> | null

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-cx-muted mb-8 flex-wrap">
          <a href="/" className="hover:text-cx-emerald transition-colors">Home</a>
          <ChevronRight size={11}/>
          <a href="/products" className="hover:text-cx-emerald transition-colors">Products</a>
          <ChevronRight size={11}/>
          <a href={`/products?category=${product.category.slug}`} className="hover:text-cx-emerald transition-colors">{product.category.name}</a>
          <ChevronRight size={11}/>
          <span className="text-cx-text truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Gallery — client component with full navigation */}
          <ProductGallery images={product.images} name={product.name} discount={disc} />

          {/* Info */}
          <div className="space-y-5">
            {product.brand && <p className="text-[11px] font-700 text-cx-muted uppercase tracking-widest">{product.brand}</p>}
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-white leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={15} className={s<=Math.round(product.rating)?'fill-cx-gold text-cx-gold':'text-cx-border'}/>)}
              </div>
              <span className="text-[13px] text-cx-muted">{product.rating} ({product.reviewCount.toLocaleString()} reviews)</span>
              <span className={`text-[12px] font-600 ${stockColor}`}>• {stockLabel}</span>
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              <span className="font-display font-800 text-4xl grad-emerald num">{formatPrice(product.currentPrice)}</span>
              {product.comparePrice && product.comparePrice > product.currentPrice && (
                <>
                  <span className="text-xl text-cx-muted line-through mb-1">{formatPrice(product.comparePrice)}</span>
                  <span className="badge-rose text-[13px] px-3 py-1 rounded-xl font-700 mb-1">
                    Save {formatPrice(product.comparePrice - product.currentPrice)}
                  </span>
                </>
              )}
            </div>

            <p className="text-cx-muted leading-relaxed text-[14px]">{product.description}</p>

            {/* Specs */}
            {attrs && (
              <div className="p-4 rounded-2xl cx-card-flat">
                <h3 className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-3">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(attrs).map(([k,v]) => (
                    <div key={k}>
                      <p className="text-[10px] text-cx-muted uppercase tracking-wide">{k}</p>
                      <p className="text-[13px] font-600 text-cx-text mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={12} className="text-cx-muted"/>
                {product.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            <ProductActions product={{ id:product.id, slug:product.slug, name:product.name, price:product.currentPrice, originalPrice:product.basePrice, image:product.images[0], stock:product.stock, brand:product.brand }}/>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:Truck,     label:'Free Shipping', sub:'Over $99' },
                { icon:RotateCcw, label:'30-Day Returns', sub:'No questions' },
                { icon:Shield,    label:'Secure Pay',    sub:'Stripe encrypted' },
              ].map(t => (
                <div key={t.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl cx-card-flat text-center">
                  <t.icon size={16} className="text-cx-emerald"/>
                  <p className="text-[10px] font-700 text-cx-text">{t.label}</p>
                  <p className="text-[9px] text-cx-muted">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mb-20">
            <h2 className="font-display font-700 text-2xl text-white mb-6 flex items-center gap-2">
              <Award size={20} className="text-cx-gold"/> Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map(r => (
                <div key={r.id} className="p-5 rounded-2xl cx-card-flat">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-600 text-[13px] text-cx-text">{r.user.name || 'Anonymous'}</p>
                      {r.verified && <span className="text-[10px] text-cx-emerald">✓ Verified Purchase</span>}
                    </div>
                    <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} size={11} className={s<=r.rating?'fill-cx-gold text-cx-gold':'text-cx-border'}/>)}</div>
                  </div>
                  {r.title && <p className="font-600 text-[13px] text-cx-text mb-1">{r.title}</p>}
                  {r.body  && <p className="text-[13px] text-cx-muted leading-relaxed">{r.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display font-700 text-2xl text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                  price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                  image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                  stock={p.stock} isFeatured={p.isFeatured}/>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
