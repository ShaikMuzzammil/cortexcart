'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2, Zap, CheckCircle2, AlertCircle, ShieldCheck, XCircle } from 'lucide-react'

function strength(pw: string) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)]
  return checks.filter(Boolean).length
}

function StrengthBar({ pw }: { pw: string }) {
  if (!pw) return null
  const score = strength(pw)
  const colors = ['#f43f6e','#f5b731','#38bdf8','#10d988']
  const labels = ['Weak','Fair','Good','Strong']
  const c = colors[score - 1] || '#1a2035'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:4, background: i<=score ? c : '#1a2035', transition:'background 0.3s' }}/>
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

function ResetForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''
  const [phase, setPhase]       = useState<'checking'|'valid'|'invalid'|'done'>('checking')
  const [email, setEmail]       = useState('')
  const [pw, setPw]             = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [showC, setShowC]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!token) { setPhase('invalid'); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
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
    if (pw !== confirm) { setError('Passwords do not match'); return }
    if (pw.length < 8)  { setError('Minimum 8 characters required'); return }
    if (strength(pw) < 2) { setError('Please choose a stronger password'); return }
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

  const base: React.CSSProperties = {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    padding:'80px 16px', background:'#080b14', fontFamily:'inherit',
  }
  const card: React.CSSProperties = {
    background:'#0d1221', border:'1px solid #1e2640', borderRadius:20,
    padding:'32px', width:'100%', maxWidth:420,
  }
  const inputStyle: React.CSSProperties = {
    width:'100%', background:'#0a0f1e', border:'1px solid #1e2640', borderRadius:12,
    padding:'12px 40px 12px 40px', color:'#e8edf8', fontSize:13, outline:'none', boxSizing:'border-box' as const,
  }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, color:'#4a5a7a', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:8 }

  return (
    <div style={base}>
      {/* BG glows */}
      <div style={{ position:'fixed', top:'30%', left:'30%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:'25%', right:'30%', width:250, height:250, borderRadius:'50%', background:'rgba(16,217,136,0.06)', filter:'blur(80px)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:14, background:'linear-gradient(135deg,#10d988,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={18} color="#080b14"/>
            </div>
            <span style={{ fontWeight:900, fontSize:20, color:'#fff' }}>Cortex<span style={{ color:'#10d988' }}>Cart</span></span>
          </Link>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', marginBottom:6 }}>Reset Password</h1>
          <p style={{ fontSize:13, color:'#6b7fa3' }}>Set a strong new password for your account</p>
        </div>

        <div style={card}>
          {/* CHECKING */}
          {phase === 'checking' && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <Loader2 size={32} color="#10d988" style={{ animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
              <p style={{ color:'#6b7fa3', fontSize:13 }}>Verifying your reset link…</p>
            </div>
          )}

          {/* INVALID */}
          {phase === 'invalid' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:16, background:'rgba(244,63,110,0.12)', border:'1px solid rgba(244,63,110,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <XCircle size={32} color="#f43f6e"/>
              </div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>Link expired or invalid</h2>
              <p style={{ color:'#6b7fa3', fontSize:13, lineHeight:1.7, marginBottom:20 }}>
                This reset link has been used or has expired (valid for 1 hour). Please request a new one.
              </p>
              <Link href="/auth/forgot-password" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'12px 20px', borderRadius:12, textDecoration:'none', marginBottom:12 }}>
                Request New Link
              </Link>
              <Link href="/auth/login" style={{ display:'block', fontSize:13, color:'#6b7fa3', textAlign:'center', textDecoration:'none' }}>← Back to sign in</Link>
            </div>
          )}

          {/* VALID FORM */}
          {phase === 'valid' && (
            <div>
              {email && (
                <div style={{ background:'rgba(16,217,136,0.08)', border:'1px solid rgba(16,217,136,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <ShieldCheck size={14} color="#10d988"/>
                  <span style={{ fontSize:12, color:'#10d988' }}>Resetting for: <strong>{email}</strong></span>
                </div>
              )}
              {error && (
                <div style={{ background:'rgba(244,63,110,0.1)', border:'1px solid rgba(244,63,110,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={14} color="#f43f6e"/>
                  <span style={{ fontSize:13, color:'#f43f6e' }}>{error}</span>
                </div>
              )}
              <form onSubmit={submit}>
                <div style={{ marginBottom:16 }}>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} color="#4a5a7a" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }}/>
                    <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                      required placeholder="Create a strong password" style={inputStyle}/>
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4a5a7a' }}>
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <StrengthBar pw={pw}/>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} color="#4a5a7a" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }}/>
                    <input type={showC ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      required placeholder="Repeat your password" style={inputStyle}/>
                    <button type="button" onClick={() => setShowC(!showC)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4a5a7a' }}>
                      {showC ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {confirm && (
                    <p style={{ fontSize:11, marginTop:6, display:'flex', alignItems:'center', gap:4, color: pw===confirm ? '#10d988' : '#f43f6e' }}>
                      {pw===confirm ? <><CheckCircle2 size={10}/> Passwords match</> : <><AlertCircle size={10}/> Passwords don't match</>}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading || pw !== confirm || pw.length < 8}
                  style={{ width:'100%', background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:14, padding:'13px', borderRadius:12, border:'none', cursor: (loading || pw!==confirm || pw.length<8) ? 'not-allowed' : 'pointer', opacity:(loading || pw!==confirm || pw.length<8) ? 0.5 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Updating…</> : <><ShieldCheck size={15}/> Set New Password</>}
                </button>
              </form>
            </div>
          )}

          {/* SUCCESS */}
          {phase === 'done' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:16, background:'rgba(16,217,136,0.12)', border:'1px solid rgba(16,217,136,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <CheckCircle2 size={32} color="#10d988"/>
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:8 }}>Password Updated! 🎉</h2>
              <p style={{ color:'#6b7fa3', fontSize:13, marginBottom:4 }}>Your password has been changed successfully.</p>
              <p style={{ color:'#6b7fa3', fontSize:12, marginBottom:20 }}>
                Redirecting to sign in in <strong style={{ color:'#10d988' }}>{countdown}s</strong>…
              </p>
              <Link href="/auth/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'12px 20px', borderRadius:12, textDecoration:'none' }}>
                Sign In Now →
              </Link>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#3a4a6a', marginTop:16 }}>
          <Link href="/auth/login" style={{ color:'#10d988', textDecoration:'none' }}>← Back to sign in</Link>
          {' · '}
          <Link href="/" style={{ color:'#10d988', textDecoration:'none' }}>Go to store</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080b14' }}>
        <Loader2 size={24} color="#10d988" style={{ animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <ResetForm/>
    </Suspense>
  )
}
