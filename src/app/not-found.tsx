import Link from 'next/link'
import { ArrowLeft, Zap, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="relative mb-6 inline-block">
          <span className="font-display font-900 text-[160px] leading-none grad-white opacity-10 select-none block">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl cx-card-flat flex items-center justify-center">
              <Search size={36} className="text-cx-emerald"/>
            </div>
          </div>
        </div>
        <h1 className="font-display font-800 text-3xl text-white mb-3">Page Not Found</h1>
        <p className="text-cx-muted mb-8 leading-relaxed text-[14px]">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"        className="btn-em px-6 py-3 text-[13px] font-700 rounded-2xl inline-flex items-center gap-2"><Zap size={14}/> Go Home</Link>
          <Link href="/products" className="btn-outline-em px-6 py-3 text-[13px] font-700 rounded-2xl">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}
