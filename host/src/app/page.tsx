'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, Zap, Loader2, ShieldCheck, Activity, Server, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  // Particle field — generated once per mount
  const particles = useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    size: 2 + Math.round(Math.random() * 3),
    duration: 8 + Math.round(Math.random() * 12),
    delay: Math.round(Math.random() * 10),
  })), [])

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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0d1525 0%, #07090f 70%)' }}>

      {/* Animated grid backdrop */}
      <div className="login-grid-bg absolute inset-0 pointer-events-none" />

      {/* Floating gradient orbs */}
      <div className="login-orb-1 absolute -top-32 -left-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,217,136,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="login-orb-2 absolute -bottom-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Drifting particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <span key={p.id} className="login-particle absolute rounded-full bg-emerald-500"
            style={{
              left: `${p.left}%`, bottom: '-10px',
              width: p.size, height: p.size,
              animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
              boxShadow: '0 0 6px rgba(16,217,136,0.8)',
            }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-sm z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="login-logo-glow inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(17,21,32,0.6)', border: '1px solid #1a2035', backdropFilter: 'blur(8px)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10d988, #38bdf8)' }}>
              <Zap size={20} className="text-black" />
            </div>
            <span className="text-xl font-black text-white">Cortex<span style={{ color: '#10d988' }}>Cart</span></span>
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1.5 tracking-tight">Host Dashboard</h1>
          <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: '#4a5a7a' }}>
            <Activity size={12} className="text-emerald-500" />
            Private · Admin Access Only
          </p>
        </div>

        <motion.form onSubmit={handleLogin} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="card p-7 space-y-5 relative overflow-hidden"
          style={{ background: 'rgba(17,21,32,0.7)', backdropFilter: 'blur(12px)' }}>

          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #10d988, #38bdf8, transparent)' }} />

          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ left: 14, color: '#10d988', opacity: 0.7 }} />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                autoFocus
                required
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                style={{ right: 14, color: '#4a5a7a' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 group">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} className="group-hover:scale-110 transition-transform" />}
            {loading ? 'Signing In...' : 'Access Dashboard'}
          </button>

          {/* Mini status strip */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: '#1a2035' }}>
            {[
              { icon: ShieldCheck, label: 'Encrypted', color: '#10d988' },
              { icon: Server,      label: 'Neon DB',   color: '#38bdf8' },
              { icon: Sparkles,    label: 'AI-ready',  color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-[10px] font-semibold" style={{ color: '#4a5a7a' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-xs mt-5" style={{ color: '#2a3356' }}>
          This is a private admin interface. Unauthorized access is prohibited.
        </motion.p>
      </motion.div>
    </div>
  )
}
