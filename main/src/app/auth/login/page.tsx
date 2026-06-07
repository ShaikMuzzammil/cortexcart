'use client'
import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, Zap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // Show success message if redirected from password reset
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccess('Password updated successfully! Sign in with your new password.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Incorrect email or password. Please try again.'); return }
    const callbackUrl = searchParams.get('callbackUrl') || '/account'
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed top-1/4 left-1/4 w-72 h-72 orb-vio rounded-full blur-[100px] opacity-25 pointer-events-none"/>
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 orb-em  rounded-full blur-[80px]  opacity-18 pointer-events-none"/>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_20px_rgba(16,217,136,0.3)]">
              <Zap size={18} className="text-cx-bg"/>
            </div>
            <span className="font-display font-800 text-xl text-white">Cortex<span className="grad-emerald">Cart</span></span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-cx-muted text-[14px]">Sign in to continue shopping</p>
        </div>

        <div className="auth-card p-8">
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20 text-[13px] text-cx-emerald">
                <CheckCircle2 size={14} className="flex-shrink-0"/> {success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose">
                <AlertCircle size={14} className="flex-shrink-0"/> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com" className="cx-input w-full pl-10 pr-4 py-3 text-[13px]"/>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-700 text-cx-muted uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot-password"
                  className="text-[11px] text-cx-emerald hover:underline font-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                <input type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" className="cx-input w-full pl-10 pr-10 py-3 text-[13px]"/>
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text transition-colors">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-em w-full py-3.5 text-[14px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading
                ? <><Loader2 size={15} className="animate-spin"/> Signing in…</>
                : <><span>Sign In</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <p className="text-center text-[13px] text-cx-muted mt-5">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-cx-emerald hover:underline font-600">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cx-emerald"/>
      </div>
    }>
      <LoginForm/>
    </Suspense>
  )
}
