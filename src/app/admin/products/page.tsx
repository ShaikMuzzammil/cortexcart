import { prisma }      from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, Star, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy:{ createdAt:'desc' }, include:{ category:{ select:{ name:true } } } })
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-2xl text-white flex items-center gap-2"><Package size={20} className="text-cx-emerald"/> Manage Products</h1>
        <p className="text-cx-muted text-[13px] mt-1">{products.length} products</p>
      </div>
      <div className="cx-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cx-border text-[11px] text-cx-muted uppercase tracking-wide">
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cx-border/50">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-cx-surface/30 transition-colors">
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-cx-surface border border-cx-border flex-shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>}
                    </div>
                    <div>
                      <p className="text-[13px] font-600 text-white">{p.name}</p>
                      <p className="text-[11px] text-cx-muted font-mono">{p.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-cx-dim">{p.category?.name}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-[13px] font-700 text-cx-emerald">{formatPrice(p.currentPrice)}</p>
                    {p.comparePrice && <p className="text-[10px] text-cx-muted line-through">{formatPrice(p.comparePrice)}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[12px] font-700 flex items-center justify-end gap-1 ${p.stock<=5?'text-cx-rose':p.stock<=20?'text-cx-gold':'text-cx-emerald'}`}>
                      {p.stock<=5 && <AlertTriangle size={11}/>}{p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-cx-muted flex items-center gap-1">
                    <Star size={11} className="text-cx-gold fill-cx-gold"/>{p.rating} ({p.reviewCount})
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-700 px-2 py-0.5 rounded-full ${p.isActive?'bg-cx-emerald/10 text-cx-emerald':'bg-cx-rose/10 text-cx-rose'}`}>
                      {p.isActive?'Active':'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
