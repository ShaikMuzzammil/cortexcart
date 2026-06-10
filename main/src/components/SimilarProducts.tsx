import { prisma }     from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { Sparkles }    from 'lucide-react'

interface Props { categoryId: string; currentId: string; limit?: number }

export async function SimilarProducts({ categoryId, currentId, limit = 4 }: Props) {
  const products = await prisma.product.findMany({
    where:   { isActive: true, categoryId, id: { not: currentId } },
    orderBy: { reviewCount: 'desc' },
    take:    limit,
    include: { category: true },
  })
  if (products.length === 0) return null
  return (
    <section className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={16} className="text-cx-emerald"/>
        <h2 className="font-display font-700 text-xl text-white">Similar Products</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard
            key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
            price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
            image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
            stock={p.stock} isFeatured={p.isFeatured} tags={p.tags}
          />
        ))}
      </div>
    </section>
  )
}
