import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductCard }    from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { SortBar }        from '@/components/SortBar'
import { Search }         from 'lucide-react'

interface SP { category?:string; q?:string; featured?:string; deals?:string; sort?:string; minPrice?:string; maxPrice?:string; brand?:string }

async function getProducts(p: SP) {
  const where: any = { isActive: true }
  if (p.category)          where.category = { slug: p.category }
  if (p.featured === 'true') where.isFeatured = true
  if (p.deals === 'true')    where.comparePrice = { not: null }
  if (p.q) where.OR = [
    { name:        { contains: p.q, mode: 'insensitive' } },
    { description: { contains: p.q, mode: 'insensitive' } },
    { brand:       { contains: p.q, mode: 'insensitive' } },
    { tags:        { has: p.q.toLowerCase() } },
  ]
  if (p.brand)    where.brand = { contains: p.brand, mode: 'insensitive' }
  if (p.minPrice || p.maxPrice) {
    where.currentPrice = {}
    if (p.minPrice) where.currentPrice.gte = parseFloat(p.minPrice)
    if (p.maxPrice) where.currentPrice.lte = parseFloat(p.maxPrice)
  }
  const ob: any =
    p.sort === 'price_asc'  ? { currentPrice: 'asc' } :
    p.sort === 'price_desc' ? { currentPrice: 'desc' } :
    p.sort === 'newest'     ? { createdAt: 'desc' } :
    p.sort === 'rating'     ? { rating: 'desc' } :
    { reviewCount: 'desc' }
  return prisma.product.findMany({ where, orderBy: ob, include: { category: true } })
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const title =
    searchParams.q              ? `Results for "${searchParams.q}"` :
    searchParams.category       ? (categories.find(c => c.slug === searchParams.category)?.name ?? 'Products') :
    searchParams.featured==='true' ? 'Featured Products' :
    searchParams.deals==='true'    ? 'Deals & Offers' :
    'All Products'

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-800 text-3xl sm:text-4xl text-white mb-1">{title}</h1>
          <p className="text-cx-muted text-[13px]">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <Suspense fallback={<div className="skeleton h-96 rounded-2xl"/>}>
              <ProductFilters categories={categories} currentParams={searchParams as any}/>
            </Suspense>
          </aside>

          {/* Products */}
          <main className="flex-1 min-w-0">
            {/* Sort bar — always visible */}
            <SortBar count={products.length} currentSort={searchParams.sort}/>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                <div className="w-20 h-20 rounded-2xl cx-card-flat flex items-center justify-center">
                  <Search size={30} className="text-cx-muted"/>
                </div>
                <div>
                  <p className="font-700 text-cx-text text-xl mb-2">No products found</p>
                  <p className="text-cx-muted text-[13px]">Try adjusting your filters or search terms</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map(p => (
                  <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                    price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                    image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                    stock={p.stock} isFeatured={p.isFeatured} tags={p.tags}/>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
