'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, Zap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        toast.error('Invalid password')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at center, #0d1525 0%, #07090f 70%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10d988, #38bdf8)' }}>
              <Zap size={20} className="text-black" />
            </div>
            <span className="text-xl font-black text-white">Cortex<span style={{ color: '#10d988' }}>Cart</span></span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Host Dashboard</h1>
          <p className="text-sm" style={{ color: '#4a5a7a' }}>Private · Admin Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5a7a' }} />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input pl-9 pr-9"
                required
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                style={{ color: '#4a5a7a' }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            {loading ? 'Signing In...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: '#2a3356' }}>
          This is a private admin interface. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
