import { Zap, Home } from 'lucide-react'

const STORE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app').replace(/\/$/, '')

export default function MinimalNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-cx-border/60 bg-cx-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href={STORE_URL} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cx-emerald to-cx-sky group-hover:scale-105 transition-transform">
            <Zap size={18} className="text-cx-bg" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Cortex<span className="text-cx-emerald">Cart</span>
          </span>
        </a>

        <a href={STORE_URL}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-700 text-cx-dim border border-cx-border hover:border-cx-emerald/40 hover:text-cx-emerald hover:bg-cx-emerald/5 transition-all">
          <Home size={14} />
          Home
        </a>
      </div>
    </nav>
  )
}
