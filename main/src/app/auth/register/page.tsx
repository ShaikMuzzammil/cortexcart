'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, Zap, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const strength = (() => {
    const p = form.password
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/account')
    router.refresh()
  }

  const strengthColor = ['bg-cx-rose', 'bg-orange-500', 'bg-cx-gold', 'bg-cx-emerald'][strength - 1] || 'bg-cx-border'
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || ''

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed top-1/4 right-1/4 w-72 h-72 orb-em rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-56 h-56 orb-gold rounded-full blur-[80px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-cx-em">
              <Zap size={18} className="text-cx-bg" />
            </div>
            <span className="font-display font-900 text-xl text-white">Cortex<span className="grad-emerald">Cart</span></span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white mb-2">Create account</h1>
          <p className="text-cx-muted text-sm">Join thousands of smart shoppers</p>
        </div>

        <div className="auth-card p-8">
          {error && (
            <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-cx-rose/10 border border-cx-rose/20 text-sm text-cx-rose">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cx-muted uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
                <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Alex Rivera" className="cx-input w-full pl-10 pr-4 py-3 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cx-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" className="cx-input w-full pl-10 pr-4 py-3 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cx-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 8 characters" className="cx-input w-full pl-10 pr-10 py-3 text-sm" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text"><Eye size={15} /></button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= strength ? strengthColor : 'bg-cx-border')} />)}
                  </div>
                  <span className="text-[11px] text-cx-muted">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-cx-muted uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
                <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required placeholder="Repeat password" className="cx-input w-full pl-10 pr-4 py-3 text-sm" />
                {form.confirm && form.password === form.confirm && <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-emerald" />}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-em w-full py-3.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-cx-muted mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cx-emerald hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
