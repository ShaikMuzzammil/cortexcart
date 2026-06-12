'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, Zap, CheckCircle2, AlertCircle, Send } from 'lucide-react'

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
        method:'POST', headers:{'Content-Type':'application/json'},
        body:  JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSent(true)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const base: React.CSSProperties = {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    padding:'80px 16px', background:'#080b14', fontFamily:'inherit',
  }
  const card: React.CSSProperties = {
    background:'#0d1221', border:'1px solid #1e2640', borderRadius:20,
    padding:'32px', width:'100%', maxWidth:400,
  }
  const inputStyle: React.CSSProperties = {
    width:'100%', background:'#0a0f1e', border:'1px solid #1e2640', borderRadius:12,
    padding:'12px 12px 12px 40px', color:'#e8edf8', fontSize:13, outline:'none', boxSizing:'border-box' as const,
  }

  return (
    <div style={base}>
      <div style={{ position:'fixed', top:'30%', left:'30%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.07)', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:400, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:14, background:'linear-gradient(135deg,#10d988,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={18} color="#080b14"/>
            </div>
            <span style={{ fontWeight:900, fontSize:20, color:'#fff' }}>Cortex<span style={{ color:'#10d988' }}>Cart</span></span>
          </Link>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', marginBottom:6 }}>Forgot Password?</h1>
          <p style={{ fontSize:13, color:'#6b7fa3' }}>Enter your email and we'll send you a reset link</p>
        </div>
        <div style={card}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:60, height:60, borderRadius:16, background:'rgba(16,217,136,0.1)', border:'1px solid rgba(16,217,136,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <CheckCircle2 size={28} color="#10d988"/>
              </div>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, marginBottom:8 }}>Check your inbox</h2>
              <p style={{ color:'#6b7fa3', fontSize:13, lineHeight:1.7, marginBottom:20 }}>
                We sent a password reset link to <strong style={{ color:'#fff' }}>{email}</strong>. 
                Valid for 1 hour.
              </p>
              <Link href="/auth/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:13, padding:'12px 20px', borderRadius:12, textDecoration:'none' }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <div>
              {error && (
                <div style={{ background:'rgba(244,63,110,0.1)', border:'1px solid rgba(244,63,110,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={14} color="#f43f6e"/>
                  <span style={{ fontSize:13, color:'#f43f6e' }}>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#4a5a7a', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:8 }}>
                  Email Address
                </label>
                <div style={{ position:'relative', marginBottom:20 }}>
                  <Mail size={14} color="#4a5a7a" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }}/>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com" style={inputStyle}/>
                </div>
                <button type="submit" disabled={loading || !email.trim()}
                  style={{ width:'100%', background:'linear-gradient(135deg,#10d988,#0a9e62)', color:'#080b14', fontWeight:800, fontSize:14, padding:'13px', borderRadius:12, border:'none', cursor:(loading||!email.trim())?'not-allowed':'pointer', opacity:(loading||!email.trim())?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Sending…</> : <><Send size={15}/> Send Reset Link</>}
                </button>
              </form>
            </div>
          )}
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:'#3a4a6a', marginTop:16 }}>
          <Link href="/auth/login" style={{ color:'#10d988', textDecoration:'none' }}>← Back to sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
