export const dynamic = 'force-dynamic'
import { Suspense }       from 'react'
import { prisma }         from '@/lib/prisma'
import { ProductCard }    from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { SortBar }        from '@/components/SortBar'
import { Search, Package, Sparkles, TrendingUp, Tag, Flame } from 'lucide-react'
import Link from 'next/link'

interface SP {
  category?: string; q?: string; featured?: string; deals?: string
  sort?: string; minPrice?: string; maxPrice?: string; brand?: string
  rating?: string; inStock?: string; page?: string
}

const PER_PAGE = 24

async function getProducts(p: SP) {
  const where: any = { isActive: true }
  if (p.category) where.category = { slug: p.category }
  if (p.featured === 'true') where.isFeatured = true
  if (p.deals    === 'true') where.isDeal      = true
  if (p.inStock  === 'true') where.stock       = { gt: 0 }
  if (p.rating) where.rating = { gte: parseFloat(p.rating) }
  if (p.q) where.OR = [
    { name:        { contains: p.q, mode: 'insensitive' } },
    { description: { contains: p.q, mode: 'insensitive' } },
    { brand:       { contains: p.q, mode: 'insensitive' } },
  ]
  if (p.brand) where.brand = { contains: p.brand, mode: 'insensitive' }
  if (p.minPrice || p.maxPrice) {
    where.currentPrice = {}
    if (p.minPrice) where.currentPrice.gte = parseFloat(p.minPrice)
    if (p.maxPrice) where.currentPrice.lte = parseFloat(p.maxPrice)
  }
  const ob: any =
    p.sort === 'price_asc'  ? { currentPrice: 'asc' }  :
    p.sort === 'price_desc' ? { currentPrice: 'desc' } :
    p.sort === 'newest'     ? { createdAt: 'desc' }    :
    p.sort === 'rating'     ? { rating: 'desc' }       :
    { reviewCount: 'desc' }

  const page = Math.max(1, parseInt(p.page || '1'))
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: ob, include: { category: true },
      skip: (page - 1) * PER_PAGE, take: PER_PAGE,
    }),
    prisma.product.count({ where }),
  ])
  return { items, total, page, pages: Math.ceil(total / PER_PAGE) }
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const [data, categories] = await Promise.all([
    getProducts(searchParams),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  const { items: products, total, page, pages } = data
  const activeCategory = categories.find(c => c.slug === searchParams.category)

  const title =
    searchParams.q                    ? `Results for "${searchParams.q}"` :
    searchParams.featured === 'true'  ? 'Featured Picks' :
    searchParams.deals    === 'true'  ? 'Deals & Sales' :
    activeCategory?.name              ? activeCategory.name :
    'All Products'

  const hasFilters = !!(
    searchParams.category || searchParams.minPrice ||
    searchParams.rating   || searchParams.featured ||
    searchParams.deals    || searchParams.inStock
  )

  return (
    <div className="min-h-screen pt-6 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {searchParams.featured === 'true' && <Sparkles size={18} className="text-cx-gold"/>}
              {searchParams.deals    === 'true' && <Flame     size={18} className="text-cx-rose"/>}
              {searchParams.q                   && <Search    size={18} className="text-cx-sky"/>}
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-white">{title}</h1>
            </div>
            <p className="text-cx-muted text-[13px] flex items-center gap-2">
              <Tag size={11}/>
              <span className="text-cx-emerald font-600">{total}</span> product{total !== 1 ? 's' : ''}
              {activeCategory && <> in <span className="text-cx-emerald">{activeCategory.name}</span></>}
            </p>
          </div>

          {/* Category quick-filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {categories.slice(0, 6).map(c => (
              <Link key={c.id} href={`/products?category=${c.slug}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-700 transition-all ${
                  searchParams.category === c.slug
                    ? 'bg-cx-emerald/15 text-cx-emerald border border-cx-emerald/25'
                    : 'bg-cx-surface text-cx-muted border border-cx-border hover:border-cx-emerald/30'
                }`}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <Suspense fallback={<div className="cx-card h-96 animate-pulse rounded-2xl"/>}>
              <ProductFilters categories={categories} currentParams={searchParams as any}/>
            </Suspense>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Mobile filters row */}
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <Suspense fallback={null}>
                <ProductFilters categories={categories} currentParams={searchParams as any}/>
              </Suspense>
              <SortBar count={total} currentSort={searchParams.sort}/>
            </div>
            <div className="hidden lg:block mb-4">
              <SortBar count={total} currentSort={searchParams.sort}/>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div className="w-20 h-20 rounded-3xl cx-card flex items-center justify-center">
                  <Search size={30} className="text-cx-muted"/>
                </div>
                <div>
                  <p className="font-display font-700 text-xl text-white mb-2">No products found</p>
                  <p className="text-cx-muted text-[13px] mb-5 max-w-sm">
                    {searchParams.q
                      ? `No results for "${searchParams.q}". Try a different search.`
                      : 'No products match your filters. Clear some and try again.'}
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Link href="/products" className="btn-em px-5 py-2.5 text-[13px] rounded-xl">
                      Browse All
                    </Link>
                    {hasFilters && (
                      <Link href="/products" className="btn-outline-em px-5 py-2.5 text-[13px] rounded-xl">
                        Clear Filters
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {products.map(p => (
                    <ProductCard
                      key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                      price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                      image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                      stock={p.stock} isFeatured={p.isFeatured} tags={p.tags}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <Link href={`/products?${new URLSearchParams({...searchParams as any, page: String(page-1)})}`}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-700 cx-card hover:border-cx-emerald/30 transition-all text-cx-muted hover:text-white">
                        ← Prev
                      </Link>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({length: Math.min(pages, 7)}, (_, i) => {
                        const pg = i + 1
                        return (
                          <Link key={pg}
                            href={`/products?${new URLSearchParams({...searchParams as any, page: String(pg)})}`}
                            className={`w-9 h-9 rounded-xl text-[13px] font-700 flex items-center justify-center transition-all ${
                              pg === page
                                ? 'bg-cx-emerald/15 text-cx-emerald border border-cx-emerald/25'
                                : 'cx-card text-cx-muted hover:text-white hover:border-cx-emerald/20'
                            }`}>
                            {pg}
                          </Link>
                        )
                      })}
                    </div>
                    {page < pages && (
                      <Link href={`/products?${new URLSearchParams({...searchParams as any, page: String(page+1)})}`}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-700 cx-card hover:border-cx-emerald/30 transition-all text-cx-muted hover:text-white">
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
