import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { SortBar } from '@/components/SortBar'
import { ProductFilters } from '@/components/ProductFilters'
import { Search, Package, X } from 'lucide-react'
import Link from 'next/link'

interface SP {
  category?: string; q?: string; featured?: string; deals?: string
  sort?: string; minPrice?: string; maxPrice?: string; brand?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const { category, q, featured, deals, sort = 'popular', minPrice, maxPrice, brand } = searchParams

  const where: any = { isActive: true }

  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category } }).catch(() => null)
    if (cat) where.categoryId = cat.id
  }
  if (q) {
    where.OR = [
      { name:        { contains: q, mode: 'insensitive' } },
      { brand:       { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (featured === 'true') where.isFeatured = true
  if (deals    === 'true') where.comparePrice = { not: null }
  if (minPrice) where.currentPrice = { ...where.currentPrice, gte: parseFloat(minPrice) }
  if (maxPrice) where.currentPrice = { ...where.currentPrice, lte: parseFloat(maxPrice) }
  if (brand)    where.brand = { equals: brand, mode: 'insensitive' }

  const orderBy: any =
    sort === 'rating'     ? { rating: 'desc' } :
    sort === 'newest'     ? { createdAt: 'desc' } :
    sort === 'price_asc'  ? { currentPrice: 'asc' } :
    sort === 'price_desc' ? { currentPrice: 'desc' } :
                            { reviewCount: 'desc' }

  const [products, categories, allBrands] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: true } }).catch(() => []),
    prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.product.findMany({ where: { isActive: true }, select: { brand: true }, distinct: ['brand'] }).catch(() => []),
  ])

  const brands = [...new Set(allBrands.map(p => p.brand).filter(Boolean) as string[])].sort()
  const hasFilters = !!(category || q || featured || deals || minPrice || maxPrice || brand)

  const fallback = hasFilters && products.length === 0
    ? await prisma.product.findMany({ where: { isActive: true }, take: 8, orderBy: { reviewCount: 'desc' } }).catch(() => [])
    : []

  const pageTitle =
    q        ? `Results for "${q}"` :
    category ? (categories.find(c => c.slug === category)?.name || 'Category') :
    featured ? 'Featured Picks' :
    deals    ? 'Current Deals' :
    'All Products'

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-cx-surface/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-emerald to-cx-sky"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">
              {category ? 'Category' : q ? 'Search Results' : 'Shop'}
            </span>
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl text-white">{pageTitle}</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <ProductFilters
              categories={categories} brands={brands}
              currentCategory={category} currentBrand={brand}
              currentMinPrice={minPrice} currentMaxPrice={maxPrice}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <SortBar count={products.length > 0 ? products.length : fallback.length} currentSort={sort} />

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-[11px] text-cx-muted font-600">Filters:</span>
                {category && (
                  <Link href={`/products?${new URLSearchParams({ ...(q?{q}:{}), ...(sort?{sort}:{}) }).toString()}`}
                    className="badge-em text-[10px] flex items-center gap-1 hover:bg-cx-emerald/20 transition-colors">
                    {category} <X size={8}/>
                  </Link>
                )}
                {q && (
                  <Link href={`/products?${new URLSearchParams({ ...(category?{category}:{}), ...(sort?{sort}:{}) }).toString()}`}
                    className="badge-sky text-[10px] flex items-center gap-1 hover:bg-cx-sky/20 transition-colors">
                    "{q}" <X size={8}/>
                  </Link>
                )}
                {featured && <span className="badge-gold text-[10px]">Featured</span>}
                {deals    && <span className="badge-rose text-[10px]">Deals</span>}
                <Link href="/products" className="text-[11px] text-cx-muted hover:text-cx-rose transition-colors ml-1 flex items-center gap-1">
                  <X size={10}/> Clear all
                </Link>
              </div>
            )}

            {/* No results */}
            {products.length === 0 && (
              <div className="mb-8">
                <div className="p-8 rounded-3xl cx-card-flat text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cx-surface border border-cx-border flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-cx-muted opacity-40"/>
                  </div>
                  <h3 className="font-700 text-[16px] text-cx-text mb-2">No products found</h3>
                  <p className="text-[13px] text-cx-muted mb-5 max-w-sm mx-auto">
                    No products matched your filters. Try adjusting your search or browse all products.
                  </p>
                  <Link href="/products" className="btn-em px-6 py-2.5 text-[13px] font-700 rounded-xl inline-flex items-center gap-2">
                    <X size={13}/> Clear All Filters
                  </Link>
                </div>

                {fallback.length > 0 && (
                  <>
                    <p className="text-[13px] text-cx-muted mb-5 flex items-center gap-2">
                      <Package size={14} className="text-cx-emerald"/> Suggested products you might like:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {fallback.map(p => (
                        <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                          price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                          image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                          stock={p.stock} isFeatured={p.isFeatured} dynamicPrice={p.dynamicPrice}/>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Products grid */}
            {products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map(p => (
                  <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                    price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                    image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                    stock={p.stock} isFeatured={p.isFeatured} dynamicPrice={p.dynamicPrice}/>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
