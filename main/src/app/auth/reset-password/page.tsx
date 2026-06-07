'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Lock, Eye, EyeOff, Loader2, Zap, CheckCircle2,
  AlertCircle, ShieldCheck, ArrowRight, XCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',       pass: password.length >= 8 },
    { label: 'Uppercase letter',     pass: /[A-Z]/.test(password) },
    { label: 'Number',               pass: /[0-9]/.test(password) },
    { label: 'Special character',    pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const color = score <= 1 ? '#f43f6e' : score === 2 ? '#f5b731' : score === 3 ? '#38bdf8' : '#10d988'
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'

  if (!password) return null
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-cx-muted">Password strength</span>
        <span className="font-700" style={{ color }}>{label}</span>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : '#1a2035' }}/>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5 text-[11px]"
            style={{ color: c.pass ? '#10d988' : '#4a5a7a' }}>
            {c.pass
              ? <CheckCircle2 size={10} className="text-cx-emerald flex-shrink-0"/>
              : <div className="w-2.5 h-2.5 rounded-full border border-current flex-shrink-0"/>}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResetForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''

  const [status,   setStatus]   = useState<'checking'|'valid'|'invalid'|'done'>('checking')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showP,    setShowP]    = useState(false)
  const [showC,    setShowC]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Verify token on mount
  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setStatus('valid'); setEmail(d.email) }
        else         { setStatus('invalid') }
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('done')
      setTimeout(() => router.push('/auth/login?reset=success'), 2500)
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_20px_rgba(16,217,136,0.3)]">
              <Zap size={18} className="text-cx-bg"/>
            </div>
            <span className="font-display font-800 text-xl text-white">Cortex<span className="grad-emerald">Cart</span></span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Set new password</h1>
          <p className="text-cx-muted text-[14px]">Choose a strong password to secure your account</p>
        </div>

        <div className="auth-card p-8">
          <AnimatePresence mode="wait">

            {/* Checking token */}
            {status === 'checking' && (
              <motion.div key="checking" initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="flex flex-col items-center py-8 gap-4">
                <Loader2 size={32} className="animate-spin text-cx-emerald"/>
                <p className="text-cx-muted text-[13px]">Verifying your reset link…</p>
              </motion.div>
            )}

            {/* Invalid / expired */}
            {status === 'invalid' && (
              <motion.div key="invalid" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-cx-rose/15 border border-cx-rose/25 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-cx-rose"/>
                </div>
                <h2 className="font-800 text-[18px] text-white mb-2">Link invalid or expired</h2>
                <p className="text-cx-muted text-[13px] leading-relaxed mb-6">
                  This reset link has already been used or has expired (links are valid for 1 hour).
                  Please request a new one.
                </p>
                <Link href="/auth/forgot-password" className="btn-em w-full py-3 text-[13px] rounded-xl flex items-center justify-center gap-2">
                  Request New Link <ArrowRight size={13}/>
                </Link>
                <Link href="/auth/login"
                  className="block text-[13px] text-cx-muted hover:text-cx-text transition-colors mt-3">
                  Back to sign in
                </Link>
              </motion.div>
            )}

            {/* Valid — show form */}
            {status === 'valid' && (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {email && (
                  <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-cx-emerald/8 border border-cx-emerald/20 text-[12px] text-cx-emerald">
                    <ShieldCheck size={13} className="flex-shrink-0"/>
                    Resetting password for <strong className="truncate">{email}</strong>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose">
                    <AlertCircle size={14} className="flex-shrink-0"/> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                      <input type={showP ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} required
                        placeholder="Create a strong password"
                        className="cx-input w-full pl-10 pr-10 py-3 text-[13px]"/>
                      <button type="button" onClick={() => setShowP(!showP)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text transition-colors">
                        {showP ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    <PasswordStrength password={password}/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none"/>
                      <input type={showC ? 'text' : 'password'} value={confirm}
                        onChange={e => setConfirm(e.target.value)} required
                        placeholder="Repeat your new password"
                        className="cx-input w-full pl-10 pr-10 py-3 text-[13px]"/>
                      <button type="button" onClick={() => setShowC(!showC)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text transition-colors">
                        {showC ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-[11px] text-cx-rose mt-1.5 flex items-center gap-1">
                        <AlertCircle size={10}/> Passwords do not match
                      </p>
                    )}
                    {confirm && password === confirm && confirm.length >= 8 && (
                      <p className="text-[11px] text-cx-emerald mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={10}/> Passwords match
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || password !== confirm || password.length < 8}
                    className="btn-em w-full py-3.5 text-[14px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                    {loading
                      ? <><Loader2 size={15} className="animate-spin"/> Updating password…</>
                      : <><ShieldCheck size={15}/> Set New Password</>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Success */}
            {status === 'done' && (
              <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-4">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', damping:15 }}
                  className="w-16 h-16 rounded-2xl bg-cx-emerald/15 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-cx-emerald"/>
                </motion.div>
                <h2 className="font-800 text-[20px] text-white mb-2">Password updated! 🎉</h2>
                <p className="text-cx-muted text-[13px] mb-1">
                  Your password has been successfully changed.
                </p>
                <p className="text-cx-muted text-[12px] mb-5">
                  Redirecting you to sign in…
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-cx-emerald"/>
                  <span className="text-cx-emerald text-[12px]">Redirecting…</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cx-emerald"/>
      </div>
    }>
      <ResetForm/>
    </Suspense>
  )
}
