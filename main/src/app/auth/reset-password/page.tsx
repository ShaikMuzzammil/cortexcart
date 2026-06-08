'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Lock, Eye, EyeOff, Loader2, Zap, CheckCircle2,
  AlertCircle, ShieldCheck, XCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8,   label:'8+ chars'     },
    { ok: /[A-Z]/.test(password), label:'Uppercase'    },
    { ok: /[0-9]/.test(password), label:'Number'       },
    { ok: /[^a-zA-Z0-9]/.test(password), label:'Symbol' },
  ]
  const score = checks.filter(c => c.ok).length
  const color = ['#f43f6e','#f5b731','#38bdf8','#10d988'][score - 1] || '#2a3356'
  const label = ['','Weak','Fair','Good','Strong'][score]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : '#1a2035' }}/>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map(c => (
            <span key={c.label} className="text-[10px] flex items-center gap-1"
              style={{ color: c.ok ? '#10d988' : '#3a4a6a' }}>
              {c.ok ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {label && <span className="text-[11px] font-700" style={{ color }}>{label}</span>}
      </div>
    </div>
  )
}

function ResetForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''
  const [phase,    setPhase]    = useState<'checking'|'valid'|'invalid'|'done'>('checking')
  const [email,    setEmail]    = useState('')
  const [pw,       setPw]       = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showC,    setShowC]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [countdown,setCountdown]= useState(3)

  useEffect(() => {
    if (!token) { setPhase('invalid'); return }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.valid) { setPhase('valid'); setEmail(d.email) } else setPhase('invalid') })
      .catch(() => setPhase('invalid'))
  }, [token])

  // Countdown then redirect after success
  useEffect(() => {
    if (phase !== 'done') return
    const iv = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(iv); router.push('/account?tab=profile'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(iv)
  }, [phase, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (pw !== confirm)  { setError('Passwords do not match'); return }
    if (pw.length < 8)   { setError('Minimum 8 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ token, password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPhase('done')
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-[120px] opacity-15" style={{ background: '#8b5cf6' }}/>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full blur-[90px] opacity-12" style={{ background: '#10d988' }}/>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#10d988,#38bdf8)' }}>
              <Zap size={18} className="text-black"/>
            </div>
            <span className="font-display font-800 text-xl text-white">
              Cortex<span style={{ color: '#10d988' }}>Cart</span>
            </span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Set new password</h1>
          <p className="text-[14px]" style={{ color: '#6b7fa3' }}>Secure your account with a strong password</p>
        </div>

        <div className="cx-card p-8">
          <AnimatePresence mode="wait">

            {/* Checking */}
            {phase === 'checking' && (
              <motion.div key="chk" initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="flex flex-col items-center py-10 gap-4">
                <Loader2 size={32} className="animate-spin text-cx-emerald"/>
                <p className="text-cx-muted text-[13px]">Verifying your link…</p>
              </motion.div>
            )}

            {/* Invalid */}
            {phase === 'invalid' && (
              <motion.div key="inv" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-cx-rose/15 border border-cx-rose/25 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-cx-rose"/>
                </div>
                <h2 className="font-800 text-[18px] text-white mb-2">Link expired or invalid</h2>
                <p className="text-cx-muted text-[13px] leading-relaxed mb-6">
                  This reset link has been used or expired (valid for 1 hour). Request a new one.
                </p>
                <Link href="/auth/forgot-password"
                  className="btn-em w-full py-3 text-[13px] rounded-xl flex items-center justify-center gap-2">
                  Request New Link
                </Link>
                <Link href="/auth/login"
                  className="block text-[13px] text-cx-muted hover:text-cx-text transition-colors mt-3 text-center">
                  ← Back to sign in
                </Link>
              </motion.div>
            )}

            {/* Valid form */}
            {phase === 'valid' && (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
                {email && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]"
                    style={{ background:'rgba(16,217,136,0.08)', border:'1px solid rgba(16,217,136,0.2)', color:'#10d988' }}>
                    <ShieldCheck size={13} className="flex-shrink-0"/>
                    Resetting password for <strong className="truncate ml-1">{email}</strong>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-[13px] bg-cx-rose/10 border border-cx-rose/20 text-cx-rose">
                    <AlertCircle size={14} className="flex-shrink-0"/> {error}
                  </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted"/>
                      <input type={showPw ? 'text' : 'password'} value={pw}
                        onChange={e => setPw(e.target.value)} required
                        placeholder="Create a strong password"
                        className="cx-input w-full pl-10 pr-10 py-3 text-[13px]"/>
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text">
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    <StrengthBar password={pw}/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted"/>
                      <input type={showC ? 'text' : 'password'} value={confirm}
                        onChange={e => setConfirm(e.target.value)} required
                        placeholder="Repeat your password"
                        className="cx-input w-full pl-10 pr-10 py-3 text-[13px]"/>
                      <button type="button" onClick={() => setShowC(!showC)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text">
                        {showC ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {confirm && (
                      <p className={cn('text-[11px] mt-1.5 flex items-center gap-1',
                        pw === confirm ? 'text-cx-emerald' : 'text-cx-rose')}>
                        {pw === confirm ? <><CheckCircle2 size={10}/> Passwords match</> : <><AlertCircle size={10}/> Passwords don't match</>}
                      </p>
                    )}
                  </div>

                  <button type="submit"
                    disabled={loading || pw !== confirm || pw.length < 8}
                    className="btn-em w-full py-3.5 text-[14px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                    {loading
                      ? <><Loader2 size={15} className="animate-spin"/> Updating…</>
                      : <><ShieldCheck size={15}/> Set New Password</>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Success */}
            {phase === 'done' && (
              <motion.div key="ok" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-4">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:'spring', damping:15 }}
                  className="w-16 h-16 rounded-2xl bg-cx-emerald/15 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-cx-emerald"/>
                </motion.div>
                <h2 className="font-800 text-[20px] text-white mb-2">Password Updated! 🎉</h2>
                <p className="text-cx-muted text-[13px] mb-1">Your password has been changed successfully.</p>
                <p className="text-cx-muted text-[12px] mb-5">
                  Redirecting to your profile in <strong className="text-cx-emerald">{countdown}s</strong>…
                </p>
                <Link href="/account?tab=profile"
                  className="btn-em w-full py-3 text-[13px] rounded-xl flex items-center justify-center gap-2">
                  Go to Profile Now →
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-[12px] mt-4" style={{ color: '#3a4a6a' }}>
          <Link href="/auth/login" className="text-cx-emerald hover:underline">← Back to sign in</Link>
          {' · '}
          <Link href="/" className="text-cx-emerald hover:underline">Go to store</Link>
        </p>
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
