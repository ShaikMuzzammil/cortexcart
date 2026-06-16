import MinimalNavbar from '@/components/MinimalNavbar'
import { ArrowRight, Mail, Lock, ShoppingBag } from 'lucide-react'

const STORE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app').replace(/\/$/, '')

export default function Home() {
  return (
    <>
      <MinimalNavbar />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        {/* Background grid */}
        <div className="fixed inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,217,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,217,136,0.04) 1px,transparent 1px)',
            backgroundSize:'60px 60px',
          }} />
        <div className="fixed -top-32 -left-24 w-80 h-80 rounded-full -z-10"
          style={{background:'radial-gradient(circle,rgba(16,217,136,0.12) 0%,transparent 70%)',filter:'blur(50px)'}}/>
        <div className="fixed -bottom-32 -right-24 w-96 h-96 rounded-full -z-10"
          style={{background:'radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)',filter:'blur(60px)'}}/>

        <div className="w-full max-w-md text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Cortex<span className="text-cx-emerald">Cart</span> Account
          </h1>
          <p className="text-cx-dim text-sm mb-8 leading-relaxed">
            Securely manage your CortexCart account. Reset your password or head back to the store.
          </p>

          <div className="space-y-3 mb-8">
            <a href={`${STORE_URL}/auth/forgot-password`}
              className="flex items-center justify-between gap-3 w-full px-5 py-4 rounded-2xl font-700 text-sm transition-all group"
              style={{background:'linear-gradient(135deg,#10d988,#0a9e62)',color:'#07090f'}}>
              <div className="flex items-center gap-3">
                <Mail size={18}/>
                <div className="text-left">
                  <div className="font-800">Reset your password</div>
                  <div className="text-[11px] font-500 opacity-80">Get a reset link sent to your email</div>
                </div>
              </div>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </a>

            <a href={`${STORE_URL}/auth/login`}
              className="flex items-center justify-between gap-3 w-full px-5 py-4 rounded-2xl font-700 text-sm transition-all group"
              style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',color:'#a78bfa'}}>
              <div className="flex items-center gap-3">
                <Lock size={18}/>
                <div className="text-left">
                  <div className="font-800">Sign in to your account</div>
                  <div className="text-[11px] font-500 opacity-80">Already know your password?</div>
                </div>
              </div>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </a>

            <a href={`${STORE_URL}/products`}
              className="flex items-center justify-between gap-3 w-full px-5 py-4 rounded-2xl font-700 text-sm transition-all group"
              style={{background:'rgba(56,189,248,0.08)',border:'1px solid rgba(56,189,248,0.2)',color:'#38bdf8'}}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={18}/>
                <div className="text-left">
                  <div className="font-800">Go to Shop</div>
                  <div className="text-[11px] font-500 opacity-80">158+ products across 17 categories</div>
                </div>
              </div>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </a>
          </div>

          <p className="text-cx-muted text-xs">
            <a href={STORE_URL} className="text-cx-emerald hover:underline">← Back to CortexCart</a>
          </p>
        </div>
      </main>
    </>
  )
}
