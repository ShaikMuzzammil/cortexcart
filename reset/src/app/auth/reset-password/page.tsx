'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, AlertCircle, XCircle, Mail,
} from 'lucide-react'
import MinimalNavbar from '@/components/MinimalNavbar'

const STORE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cortexcart.vercel.app').replace(/\/$/, '')

function strength(pw: string) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)]
  return checks.filter(Boolean).length
}

function StrengthBar({ pw }: { pw: string }) {
  if (!pw) return null
  const score  = strength(pw)
  const colors = ['bg-cx-rose', 'bg-cx-gold', 'bg-cx-sky', 'bg-cx-emerald']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const labelColors = ['text-cx-rose', 'text-cx-gold', 'text-cx-sky', 'text-cx-emerald']
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-[3px] rounded-full transition-colors ${i <= score ? colors[score - 1] : 'bg-cx-border'}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {[['8+ chars', pw.length >= 8], ['Uppercase', /[A-Z]/.test(pw)], ['Number', /[0-9]/.test(pw)], ['Symbol', /[^a-zA-Z0-9]/.test(pw)]].map(([l, ok]) => (
          <span key={l as string} className={`text-[10px] ${ok ? 'text-cx-emerald' : 'text-cx-muted'}`}>
            {ok ? '✓' : '○'} {l}
          </span>
        ))}
        {labels[score - 1] && <span className={`text-[11px] font-700 ml-auto ${labelColors[score - 1]}`}>{labels[score - 1]}</span>}
      </div>
    </div>
  )
}

function AnimatedBackground() {
  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    size: 2 + Math.round(Math.random() * 3),
    duration: 9 + Math.round(Math.random() * 12),
    delay: Math.round(Math.random() * 10),
  })), [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="login-grid-bg absolute inset-0 animate-grid-pan" />
      <div className="absolute -top-32 -left-24 w-80 h-80 rounded-full animate-orb-1"
        style={{ background: 'radial-gradient(circle, rgba(16,217,136,0.16) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full animate-orb-2"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      {particles.map(p => (
        <span key={p.id} className="absolute rounded-full bg-cx-emerald animate-particle"
          style={{
            left: `${p.left}%`, bottom: '-10px',
            width: p.size, height: p.size,
            animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
            boxShadow: '0 0 6px rgba(16,217,136,0.8)',
          }} />
      ))}
    </div>
  )
}

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [phase, setPhase]         = useState<'checking' | 'valid' | 'invalid' | 'done'>('checking')
  const [email, setEmail]         = useState('')
  const [pw, setPw]               = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showC, setShowC]         = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!token) { setPhase('invalid'); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => { if (d.valid) { setPhase('valid'); setEmail(d.email || '') } else setPhase('invalid') })
      .catch(() => setPhase('invalid'))
  }, [token])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (pw !== confirm)   { setError('Passwords do not match'); return }
    if (pw.length < 8)    { setError('Minimum 8 characters required'); return }
    if (strength(pw) < 2) { setError('Please choose a stronger password'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setPhase('done')
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <AnimatedBackground />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10">

        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-glow-pulse"
            style={{ background: 'linear-gradient(135deg, #10d988, #38bdf8)' }}>
            <Lock size={24} className="text-cx-bg" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1.5 tracking-tight">Reset Password</h1>
          <p className="text-sm text-cx-dim">Set a strong new password for your CortexCart account</p>
        </div>

        <div className="relative rounded-2xl border border-cx-border bg-cx-card/70 backdrop-blur-md p-7 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #10d988, #38bdf8, transparent)' }} />

          <AnimatePresence mode="wait">
            {/* CHECKING */}
            {phase === 'checking' && (
              <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
                <Loader2 size={32} className="text-cx-emerald animate-spin mx-auto mb-3" />
                <p className="text-cx-dim text-sm">Verifying your reset link…</p>
              </motion.div>
            )}

            {/* INVALID */}
            {phase === 'invalid' && (
              <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-cx-rose/10 border border-cx-rose/25 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-cx-rose" />
                </div>
                <h2 className="text-lg font-extrabold text-white mb-2">Link expired or invalid</h2>
                <p className="text-cx-dim text-sm leading-relaxed mb-5">
                  This reset link has been used or has expired (valid for 1 hour).
                  Head back to the store and request a new one from the sign-in page.
                </p>
                <a href={`${STORE_URL}/auth/forgot-password`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-cx-emerald to-emerald-600 text-cx-bg font-extrabold text-sm py-3 rounded-xl mb-3 hover:opacity-90 transition-opacity">
                  <Mail size={15} /> Request New Link
                </a>
                <a href={STORE_URL} className="block text-sm text-cx-dim hover:text-cx-emerald transition-colors">
                  ← Back to CortexCart
                </a>
              </motion.div>
            )}

            {/* VALID FORM */}
            {phase === 'valid' && (
              <motion.div key="valid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {email && (
                  <div className="flex items-center gap-2 bg-cx-emerald/8 border border-cx-emerald/20 rounded-xl px-3.5 py-2.5 mb-4">
                    <ShieldCheck size={14} className="text-cx-emerald flex-shrink-0" />
                    <span className="text-xs text-cx-emerald">Resetting for: <strong>{email}</strong></span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 bg-cx-rose/10 border border-cx-rose/25 rounded-xl px-3.5 py-2.5 mb-4">
                    <AlertCircle size={14} className="text-cx-rose flex-shrink-0" />
                    <span className="text-[13px] text-cx-rose">{error}</span>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted" />
                      <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                        required placeholder="Create a strong password"
                        className="w-full bg-cx-bg border border-cx-border rounded-xl pl-10 pr-10 py-3 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-colors" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cx-muted hover:text-white transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <StrengthBar pw={pw} />
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted" />
                      <input type={showC ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                        required placeholder="Repeat your password"
                        className="w-full bg-cx-bg border border-cx-border rounded-xl pl-10 pr-10 py-3 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-colors" />
                      <button type="button" onClick={() => setShowC(!showC)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cx-muted hover:text-white transition-colors">
                        {showC ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirm && (
                      <p className={`text-[11px] mt-1.5 flex items-center gap-1.5 ${pw === confirm ? 'text-cx-emerald' : 'text-cx-rose'}`}>
                        {pw === confirm ? <><CheckCircle2 size={10} /> Passwords match</> : <><AlertCircle size={10} /> Passwords don't match</>}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || pw !== confirm || pw.length < 8}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-cx-emerald to-emerald-600 text-cx-bg font-extrabold text-sm py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <><ShieldCheck size={15} /> Set New Password</>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS */}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-cx-emerald" />
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2">Password Updated! 🎉</h2>
                <p className="text-cx-dim text-sm mb-1">Your password has been changed successfully.</p>
                <p className="text-cx-muted text-xs mb-6">A confirmation email is on its way to {email || 'your inbox'}.</p>
                <a href={`${STORE_URL}/auth/login?reset=1`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-cx-emerald to-emerald-600 text-cx-bg font-extrabold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Sign In Now →
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-cx-muted mt-5">
          <a href={STORE_URL} className="text-cx-emerald hover:underline">← Back to CortexCart</a>
        </p>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <MinimalNavbar />
      <Suspense fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 size={24} className="text-cx-emerald animate-spin" />
        </div>
      }>
        <ResetForm />
      </Suspense>
    </>
  )
}
