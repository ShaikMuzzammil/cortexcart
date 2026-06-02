import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
export default function Page() {
  return (
    <div className="min-h-screen pt-16 pb-24 px-4 sm:px-6 lg:px-8 page-enter">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-[12px] text-cx-muted hover:text-cx-emerald transition-colors mb-8">
          <ArrowLeft size={13}/> Back to Home
        </Link>
        <div className="p-10 rounded-3xl cx-card-flat text-center">
          <div className="w-16 h-16 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">📄</span>
          </div>
          <h1 className="font-display font-800 text-3xl text-white mb-3 capitalize">careers</h1>
          <p className="text-cx-muted text-[14px] mb-6">This page is coming soon. Have a question? <Link href="/contact" className="text-cx-emerald hover:underline">Contact us</Link>.</p>
          <Link href="/products" className="btn-em px-6 py-3 text-[13px] font-700 rounded-xl inline-flex">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}
