'use client'
import { useState, useEffect, Suspense, Component } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2, Zap, CheckCircle2, AlertCircle, ShieldCheck, XCircle, Mail } from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function strength(pw: string) {
  return [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)].filter(Boolean).length
}

function StrengthBar({ pw }: { pw: string }) {
  if (!pw) return null
  const score  = strength(pw)
  const colors = ['#f43f6e','#f5b731','#38bdf8','#10d988']
  const labels = ['Weak','Fair','Good','Strong']
  const c      = colors[score - 1] || '#1a2035'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:4, background: i <= score ? c : '#1a2035', transition:'background 0.3s' }}/>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const }}>
        {[['8+ chars', pw.length>=8],['Uppercase',/[A-Z]/.test(pw)],['Number',/[0-9]/.test(pw)],['Symbol',/[^a-zA-Z0-9]/.test(pw)]].map(([l, ok]) => (
          <span key={l as string} style={{ fontSize:10, color: ok ? '#10d988' : '#3a4a6a' }}>{ok ? '✓' : '○'} {l}</span>
        ))}
        {labels[score-1] && <span style={{ fontSize:11, fontWeight:700, color:c, marginLeft:'auto' }}>{labels[score-1]}</span>}
      </div>
    </div>
  )
}

/* ─── error boundary (prevents silent blank page on render crash) ─────────── */
class ResetErrorBoundary extends Component<{ children: React.ReactNode }, { crashed: boolean; msg: string }> {
  constructor(props: any) { super(props); this.state = { crashed: false, msg: '' } }
  static getDerivedStateFromError(e: Error) { return { crashed: true, msg: e.message } }
  render() {
    if (!this.state.crashed) return this.props.children
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080b14', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:'rgba(244,63,110,0.12)', border:'1px solid rgba(244,63,110,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <XCircle size={32} color="#f43f6e"/>
          </div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>Something went wrong</h2>
          <p style={{ color:'#6b7fa3', fontSize:13, marginBottom:20 }}>
            Unable to load the reset page. This usually means the reset link is malformed or the browser blocked the script.
          </p>
          <Link href="/auth/forgot-password" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'12px 24px', borderRadius:12, textDecoration:'none' }}>
            <Mail size={14}/> Request a New Link
          </Link>
        </div>
      </div>
    )
  }
}

/* ─── main form ───────────────────────────────────────────────────────────── */
function ResetForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''

  const [phase,     setPhase]     = useState<'checking'|'valid'|'invalid'|'done'>('checking')
  const [email,     setEmail]     = useState('')
  const [pw,        setPw]        = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [showC,     setShowC]     = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!token) { setPhase('invalid'); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => {
        // Guard against non-JSON responses (old server error pages)
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error('Server error')
        return r.json()
      })
      .then(d => { if (d.valid) { setPhase('valid'); setEmail(d.email || '') } else setPhase('invalid') })
      .catch(() => setPhase('invalid'))
  }, [token])

  useEffect(() => {
    if (phase !== 'done') return
    const iv = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(iv); router.push('/auth/login?reset=1'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(iv)
  }, [phase, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (pw !== confirm)    { setError('Passwords do not match'); return }
    if (pw.length < 8)     { setError('Minimum 8 characters required'); return }
    if (strength(pw) < 2)  { setError('Please choose a stronger password (add uppercase + number)'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token, password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setPhase('done')
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const card: React.CSSProperties = {
    background:'rgba(13,18,33,0.9)', border:'1px solid #1e2640', borderRadius:20,
    padding:'32px', width:'100%', maxWidth:440, backdropFilter:'blur(12px)',
    boxShadow:'0 25px 60px rgba(0,0,0,0.5)',
  }
  const inputStyle: React.CSSProperties = {
    width:'100%', background:'#080b14', border:'1px solid #1e2640', borderRadius:12,
    padding:'12px 44px', color:'#e8edf8', fontSize:13, outline:'none',
    boxSizing:'border-box' as const, transition:'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    display:'block', fontSize:11, fontWeight:700, color:'#4a5a7a',
    textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:8,
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 16px', background:'#080b14', fontFamily:'inherit' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .reset-wrap { animation: fadeUp 0.5s ease forwards }
        .reset-input:focus { border-color: rgba(16,217,136,0.5) !important; box-shadow: 0 0 0 3px rgba(16,217,136,0.08) }
        .reset-btn:hover:not(:disabled) { opacity: 0.9 }
        .reset-btn:disabled { opacity: 0.45; cursor: not-allowed }
      `}</style>

      {/* BG glows */}
      <div style={{ position:'fixed', top:'20%', left:'20%', width:400, height:400, borderRadius:'50%', background:'rgba(139,92,246,0.07)', filter:'blur(120px)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:'20%', right:'20%', width:350, height:350, borderRadius:'50%', background:'rgba(16,217,136,0.05)', filter:'blur(100px)', pointerEvents:'none', zIndex:0 }}/>

      <div className="reset-wrap" style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:18 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#10d988,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(16,217,136,0.3)' }}>
              <Zap size={20} color="#080b14"/>
            </div>
            <span style={{ fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-0.02em' }}>Cortex<span style={{ color:'#10d988' }}>Cart</span></span>
          </Link>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.02em' }}>Reset Password</h1>
          <p style={{ fontSize:13, color:'#6b7fa3', margin:0 }}>Set a strong new password for your account</p>
        </div>

        <div style={card}>
          {/* Accent top line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, borderRadius:'20px 20px 0 0', background:'linear-gradient(90deg, transparent, #10d988, #38bdf8, transparent)' }}/>

          {/* ── CHECKING ── */}
          {phase === 'checking' && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <Loader2 size={32} color="#10d988" style={{ animation:'spin 1s linear infinite', margin:'0 auto 14px', display:'block' }}/>
              <p style={{ color:'#6b7fa3', fontSize:13, margin:0 }}>Verifying your reset link…</p>
              <p style={{ color:'#3a4a6a', fontSize:11, marginTop:8 }}>This takes just a moment</p>
            </div>
          )}

          {/* ── INVALID ── */}
          {phase === 'invalid' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'rgba(244,63,110,0.1)', border:'1px solid rgba(244,63,110,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                <XCircle size={32} color="#f43f6e"/>
              </div>
              <h2 style={{ fontSize:19, fontWeight:800, color:'#fff', marginBottom:10 }}>Link expired or invalid</h2>
              <p style={{ color:'#6b7fa3', fontSize:13, lineHeight:1.7, marginBottom:24 }}>
                This password reset link has either been used or has expired. Reset links are valid for <strong style={{ color:'#c0cfe8' }}>1 hour</strong>.
                Please request a new one.
              </p>
              <Link href="/auth/forgot-password" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'13px 20px', borderRadius:12, textDecoration:'none', marginBottom:12, boxShadow:'0 4px 20px rgba(16,217,136,0.25)' }}>
                <Mail size={14}/> Request New Reset Link
              </Link>
              <Link href="/auth/login" style={{ display:'block', fontSize:13, color:'#6b7fa3', textDecoration:'none', marginTop:4 }}>← Back to sign in</Link>
            </div>
          )}

          {/* ── VALID FORM ── */}
          {phase === 'valid' && (
            <div>
              {email && (
                <div style={{ background:'rgba(16,217,136,0.07)', border:'1px solid rgba(16,217,136,0.18)', borderRadius:12, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
                  <ShieldCheck size={14} color="#10d988" style={{ flexShrink:0 }}/>
                  <span style={{ fontSize:12, color:'#10d988' }}>Resetting password for: <strong>{email}</strong></span>
                </div>
              )}
              {error && (
                <div style={{ background:'rgba(244,63,110,0.08)', border:'1px solid rgba(244,63,110,0.2)', borderRadius:12, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={14} color="#f43f6e" style={{ flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#f43f6e' }}>{error}</span>
                </div>
              )}

              <form onSubmit={submit}>
                {/* New password */}
                <div style={{ marginBottom:18 }}>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} color="#4a5a7a" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                    <input type={showPw ? 'text' : 'password'} value={pw}
                      onChange={e => setPw(e.target.value)}
                      required placeholder="Create a strong password"
                      className="reset-input"
                      style={{ ...inputStyle }}/>
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4a5a7a', padding:2, display:'flex', alignItems:'center' }}>
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <StrengthBar pw={pw}/>
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom:22 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} color="#4a5a7a" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                    <input type={showC ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required placeholder="Repeat your password"
                      className="reset-input"
                      style={{ ...inputStyle }}/>
                    <button type="button" onClick={() => setShowC(!showC)}
                      style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4a5a7a', padding:2, display:'flex', alignItems:'center' }}>
                      {showC ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {confirm && (
                    <p style={{ fontSize:11, marginTop:6, display:'flex', alignItems:'center', gap:5, color: pw === confirm ? '#10d988' : '#f43f6e' }}>
                      {pw === confirm
                        ? <><CheckCircle2 size={10}/> Passwords match</>
                        : <><AlertCircle size={10}/> Passwords don't match</>}
                    </p>
                  )}
                </div>

                <button type="submit" className="reset-btn"
                  disabled={loading || pw !== confirm || pw.length < 8}
                  style={{ width:'100%', background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:14, padding:'14px', borderRadius:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity 0.2s', boxShadow:'0 4px 20px rgba(16,217,136,0.3)' }}>
                  {loading
                    ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Updating…</>
                    : <><ShieldCheck size={15}/> Set New Password</>}
                </button>
              </form>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {phase === 'done' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'rgba(16,217,136,0.12)', border:'1px solid rgba(16,217,136,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'0 0 30px rgba(16,217,136,0.15)' }}>
                <CheckCircle2 size={32} color="#10d988"/>
              </div>
              <h2 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>Password Updated! 🎉</h2>
              <p style={{ color:'#6b7fa3', fontSize:13, marginBottom:4 }}>Your password has been changed successfully.</p>
              <p style={{ color:'#6b7fa3', fontSize:12, marginBottom:24 }}>
                Redirecting in <strong style={{ color:'#10d988' }}>{countdown}s</strong>…
              </p>
              <Link href="/auth/login"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'13px 20px', borderRadius:12, textDecoration:'none', boxShadow:'0 4px 20px rgba(16,217,136,0.25)' }}>
                Sign In Now →
              </Link>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <Link href="/auth/login" style={{ fontSize:12, color:'#10d988', textDecoration:'none', marginRight:12 }}>← Sign in</Link>
          <span style={{ color:'#3a4a6a', fontSize:12 }}>·</span>
          <Link href="/" style={{ fontSize:12, color:'#10d988', textDecoration:'none', marginLeft:12 }}>Go to store</Link>
        </div>
      </div>
    </div>
  )
}

/* ─── page export with Suspense + error boundary ─────────────────────────── */
export default function ResetPasswordPage() {
  return (
    <ResetErrorBoundary>
      <Suspense fallback={
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080b14' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <Loader2 size={28} color="#10d988" style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      }>
        <ResetForm/>
      </Suspense>
    </ResetErrorBoundary>
  )
}
