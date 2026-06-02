'use client'
import { useState } from 'react'
import { Send, Loader2, CheckCircle2, Mail, Phone, MapPin, Clock, MessageSquare, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const CATEGORIES = ['General Inquiry','Order Support','Product Question','Returns & Refunds','Technical Support','Partnership','Press','Other']
const PRIORITIES  = ['Low','Normal','High','Urgent']

export function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', category:'General Inquiry', priority:'Normal', message:'' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in your name, email, and message.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSubmitted(true)
      toast.success('Message sent! We\'ll reply within 24–48 hours.', { duration: 5000 })
    } catch(err: any) {
      toast.error(err.message || 'Failed to send message. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="p-10 rounded-3xl cx-card-flat text-center animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-cx-emerald/10 border border-cx-emerald/25 flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
          <CheckCircle2 size={36} className="text-cx-emerald"/>
        </div>
        <h3 className="font-display font-800 text-2xl text-white mb-2">Message Sent!</h3>
        <p className="text-cx-muted text-[14px] mb-6 max-w-xs mx-auto leading-relaxed">
          We've received your message and will reply to <strong className="text-cx-text">{form.email}</strong> within 24–48 hours.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <button onClick={() => { setSubmitted(false); setForm({ name:'', email:'', subject:'', category:'General Inquiry', priority:'Normal', message:'' }) }}
            className="btn-outline-em px-6 py-2.5 text-[13px] rounded-xl">
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Your Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Full name" className="cx-input w-full px-4 py-3 text-[13px]" required/>
        </div>
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Email Address *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="your@email.com" className="cx-input w-full px-4 py-3 text-[13px]" required/>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Subject</label>
        <input value={form.subject} onChange={e => set('subject', e.target.value)}
          placeholder="What's on your mind?" className="cx-input w-full px-4 py-3 text-[13px]"/>
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="cx-input w-full px-4 py-3 text-[13px]">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}
            className="cx-input w-full px-4 py-3 text-[13px]">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Message — NO LIMIT */}
      <div>
        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1.5">Message *</label>
        <textarea value={form.message} onChange={e => set('message', e.target.value)}
          rows={6} placeholder="Describe your question or concern in as much detail as you like..."
          className="cx-input w-full px-4 py-3 text-[13px] resize-y min-h-[140px]" required/>
      </div>

      <button type="submit" disabled={submitting}
        className="btn-em w-full py-4 text-[14px] font-700 rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60">
        {submitting
          ? <><Loader2 size={16} className="animate-spin"/> Sending…</>
          : <><Send size={15}/> Send Message</>}
      </button>
    </form>
  )
}
