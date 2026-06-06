'use client'
import { useState } from 'react'
import { Send, Loader2, CheckCircle2, AlertCircle, User, Mail, FileText, Tag, AlertTriangle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'
interface F { name: string; email: string; subject: string; message: string; category: string; priority: string }

export function ContactForm() {
  const [f, setF]           = useState<F>({ name: '', email: '', subject: '', message: '', category: 'support', priority: 'normal' })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')
  const set = (k: keyof F, v: string) => setF(p => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim())    { setError('Please enter your name'); return }
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Please enter a valid email address'); return }
    if (!f.subject.trim()) { setError('Please enter a subject'); return }
    if (!f.message.trim()) { setError('Please enter your message'); return }
    setError(''); setStatus('loading')
    try {
      const res  = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setStatus('success')
      setF({ name: '', email: '', subject: '', message: '', category: 'support', priority: 'normal' })
    } catch (e: any) { setError(e.message || 'Something went wrong'); setStatus('error') }
  }

  if (status === 'success') return (
    <div className="p-8 rounded-3xl cx-card-flat flex flex-col items-center gap-5 min-h-72 justify-center text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/25 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-cx-emerald" />
      </div>
      <div>
        <h3 className="font-display font-700 text-2xl text-white mb-2">Message Sent!</h3>
        <p className="text-cx-muted text-[13px] leading-relaxed max-w-sm">
          Your message has been securely delivered to our team. A confirmation has been sent to your email. We'll reply within 24–48 hours.
        </p>
      </div>
      <button onClick={() => setStatus('idle')} className="btn-outline-em px-6 py-2.5 text-[13px] rounded-xl">Send Another</button>
    </div>
  )

  return (
    <form onSubmit={submit} className="p-6 sm:p-8 rounded-3xl cx-card-flat">
      <h2 className="font-display font-700 text-2xl text-white mb-2">Send a Message</h2>
      <p className="text-[12px] text-cx-muted mb-6">Enter your email so we can reply directly. No character limits — write as much as you need.</p>
      {error && (
        <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-cx-rose/10 border border-cx-rose/20 text-[13px] text-cx-rose">
          <AlertCircle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Your Name</label>
          <div className="relative"><User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Alex Rivera" className="cx-input w-full pl-9 pr-4 py-3 text-[13px]" /></div>
        </div>
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Email <span className="text-cx-emerald normal-case font-400">(for reply)</span></label>
          <div className="relative"><Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" className="cx-input w-full pl-9 pr-4 py-3 text-[13px]" /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Category</label>
          <div className="relative"><Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <select value={f.category} onChange={e => set('category', e.target.value)} className="cx-input w-full pl-9 pr-4 py-3 text-[13px] appearance-none">
              {['support','partnership','press','general'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select></div>
        </div>
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Priority</label>
          <div className="relative"><AlertTriangle size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
            <select value={f.priority} onChange={e => set('priority', e.target.value)} className="cx-input w-full pl-9 pr-4 py-3 text-[13px] appearance-none">
              {['normal','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select></div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Subject</label>
        <div className="relative"><FileText size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
          <input value={f.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief description" className="cx-input w-full pl-9 pr-4 py-3 text-[13px]" /></div>
      </div>
      <div className="mb-6">
        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-2">Message</label>
        <textarea value={f.message} onChange={e => set('message', e.target.value)} rows={8}
          placeholder="Tell us how we can help you. No limits — write as much as needed."
          className="cx-input w-full px-4 py-3 text-[13px] resize-y" />
      </div>
      <button type="submit" disabled={status === 'loading'}
        className="btn-em w-full py-4 text-[13px] font-700 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
        {status === 'loading' ? <><Loader2 size={15} className="animate-spin" />Sending…</> : <><Send size={15} />Send Message</>}
      </button>
    </form>
  )
}
