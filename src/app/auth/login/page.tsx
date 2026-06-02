'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Loader2, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Incorrect email or password. Please check and try again.')
      toast.error('Login failed')
    } else {
      toast.success('Welcome back! 👋')
      router.push('/account')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 page-enter">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_20px_rgba(16,217,136,0.3)] group-hover:shadow-[0_0_32px_rgba(16,217,136,0.5)] transition-all">
            <Zap size={17} className="text-cx-bg"/>
          </div>
          <span className="font-display font-800 text-[18px] text-white">Cortex<span className="grad-emerald">Cart</span></span>
        </Link>

        <div className="p-8 rounded-3xl cx-card-flat">
          <h1 className="font-display font-800 text-2xl text-white mb-1 text-center">Welcome Back</h1>
          <p className="text-cx-muted text-[13px] text-center mb-7">Sign in to your account</p>

          {error && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-cx-rose/8 border border-cx-rose/25 mb-5 text-[12px] text-cx-rose">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="cx-input w-full px-4 py-3.5 text-[13px]" autoComplete="email"/>
            </div>
            <div>
              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="cx-input w-full px-4 py-3.5 text-[13px] pr-11" autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text transition-colors">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-em w-full py-4 text-[14px] font-700 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader2 size={15} className="animate-spin"/> Signing in…</> : <><LogIn size={15}/> Sign In</>}
            </button>
          </form>

          <p className="text-center text-[12px] text-cx-muted mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-cx-emerald hover:underline font-600">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
