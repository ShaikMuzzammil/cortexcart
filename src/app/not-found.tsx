import Link from 'next/link'
import { Zap, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display font-800 text-[120px] leading-none grad-emerald mb-4 select-none">404</div>
        <h1 className="font-display font-800 text-3xl text-white mb-3">Page Not Found</h1>
        <p className="text-cx-muted text-[14px] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-em px-7 py-3.5 text-[13px] font-700 rounded-2xl flex items-center gap-2">
            <ArrowLeft size={14}/> Back to Home
          </Link>
          <Link href="/products" className="btn-outline-em px-7 py-3.5 text-[13px] rounded-2xl flex items-center gap-2">
            <Search size={14}/> Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
