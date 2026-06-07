'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, Zap, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSent(true)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed top-1/4 left-1/4 w-72 h-72 orb-vio rounded-full blur-[100px] opacity-20 pointer-events-none"/>
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 orb-em  rounded-full blur-[80px]  opacity-15 pointer-events-none"/>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_20px_rgba(16,217,136,0.3)]">
              <Zap size={18} className="text-cx-bg"/>
            </div>
            <span className="font-display font-800 text-xl text-white">Cortex<span className="grad-emerald">Cart</span></span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Forgot password?</h1>
          <p className="text-cx-muted text-[14px]">No worries — we'll email you a reset link</p>
        </div>

        <div className="auth-card p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-cx-emerald/15 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-cx-emerald"/>
                </div>
                <h2 className="font-800 text-[20px] text-white mb-2">Check your inbox ✉️</h2>
                <p className="text-cx-muted text-[13px] leading-relaxed mb-1">
                  If <strong className="text-cx-text">{email}</strong> is registered, a reset link has been sent.
                </p>
                <p className="text-cx-muted text-[12px] mb-6">
                  The link expires in <strong className="text-cx-text">1 hour</strong>. Check your spam folder if you don't see it.
                </p>
                <div className="space-y-3">
                  <button onClick={() => { setSent(false); setEmail('') }}
                    className="btn-outline-em w-full py-3 text-[13px] rounded-xl">
                    Try a different email
                  </button>
                  <Link href="/auth/login"
                    className="flex items-center justify-center gap-2 text-[13px] text-cx-muted hover:text-cx-text transition-colors">
                    <ArrowLeft size={13}/> Back to sign in
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose">
                    <AlertCircle size={14} className="flex-shrink-0"/> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@example.com"
                        className="cx-input w-full pl-10 pr-4 py-3 text-[13px]"/>
                    </div>
                    <p className="text-[11px] text-cx-muted mt-1.5">
                      Enter the email address you signed up with
                    </p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-em w-full py-3.5 text-[14px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><Loader2 size={15} className="animate-spin"/> Sending link…</>
                      : <><Send size={14}/> Send Reset Link</>}
                  </button>
                </form>

                <Link href="/auth/login"
                  className="flex items-center justify-center gap-2 text-[13px] text-cx-muted hover:text-cx-text transition-colors mt-5">
                  <ArrowLeft size={13}/> Back to sign in
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help note */}
        <p className="text-center text-[12px] text-cx-muted mt-4">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-cx-emerald hover:underline font-600">Sign in</Link>
          {' '}·{' '}
          <Link href="/auth/register" className="text-cx-emerald hover:underline font-600">Create account</Link>
        </p>
      </div>
    </div>
  )
}
