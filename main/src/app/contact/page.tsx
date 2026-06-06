'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, MapPin, Send, CheckCircle2, Loader2, MessageSquare,
  Clock, Shield, Zap, HelpCircle, ChevronDown, ChevronUp,
  Headphones, Package, Star, Users, ArrowRight, Phone
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Support','Partnerships','Press & Media','General']
const PRIORITIES  = ['low','medium','high','urgent']

const SUPPORT_TYPES = [
  {
    icon: Headphones, color: 'text-cx-emerald', bg: 'bg-cx-emerald/10', border: 'border-cx-emerald/20',
    label: 'Customer Support', sub: 'Orders, returns, account help', dot: 'bg-cx-emerald'
  },
  {
    icon: Users, color: 'text-cx-violet', bg: 'bg-cx-violet/10', border: 'border-cx-violet/20',
    label: 'Partnerships', sub: 'Brands, API integrations, white-label', dot: 'bg-cx-violet'
  },
  {
    icon: Star, color: 'text-cx-gold', bg: 'bg-cx-gold/10', border: 'border-cx-gold/20',
    label: 'Press & Media', sub: 'Interviews, press kits, enquiries', dot: 'bg-cx-gold'
  },
  {
    icon: MessageSquare, color: 'text-cx-rose', bg: 'bg-cx-rose/10', border: 'border-cx-rose/20',
    label: 'General', sub: 'Anything else — we\'re happy to hear', dot: 'bg-cx-rose'
  },
  {
    icon: Shield, color: 'text-cx-sky', bg: 'bg-cx-sky/10', border: 'border-cx-sky/20',
    label: 'Secure Delivery', sub: 'Messages are processed via our secure email integration and delivered to our team. Your contact details are never exposed publicly.', dot: 'bg-cx-sky', wide: true
  },
]

const INFO_ITEMS = [
  { icon: Clock,   label: 'RESPONSE TIME',   val: 'Within 24–48 hours' },
  { icon: MapPin,  label: 'HEADQUARTERS',    val: 'San Francisco, CA' },
  { icon: Zap,     label: 'SUPPORT HOURS',   val: 'Mon–Fri 9am–6pm EST' },
]

const FAQ = [
  { q: 'How long does shipping take?', a: 'Standard 3–7 days. Express 1–2 days. Free on orders over $99.' },
  { q: 'What is your return policy?', a: '30-day hassle-free returns. Submit a request from your order page.' },
  { q: 'Is my payment secure?', a: 'Yes. Stripe handles all payments with 256-bit encryption.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to 45+ countries. Rates calculated at checkout.' },
  { q: 'How does AI pricing work?', a: 'Our AI adjusts prices based on demand, stock, and market trends.' },
  { q: 'How do I track my order?', a: 'Visit /orders with your order number for real-time updates.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', category: 'Support', priority: 'medium' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch { toast.error('Failed to send message. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cx-emerald/10 border border-cx-emerald/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-cx-emerald animate-pulse" />
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Support Online</span>
          </div>
          <h1 className="font-display font-800 text-5xl sm:text-6xl text-white mb-4">
            Get In <span className="grad-emerald">Touch</span>
          </h1>
          <p className="text-cx-muted text-[15px] max-w-xl mx-auto leading-relaxed">
            Our team typically responds within 24 hours. All messages are securely delivered — nothing is exposed publicly.
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-8">

          {/* Left Column — Support Types + Info */}
          <div className="space-y-4">
            <h2 className="text-[13px] font-700 text-cx-muted uppercase tracking-wide mb-4">What can we help with?</h2>
            {SUPPORT_TYPES.map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={cn('cx-card p-4 flex items-start gap-3 border transition-all hover:scale-[1.01] cursor-default', item.border)}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', item.bg)}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-700 text-white">{item.label}</p>
                  <p className="text-[12px] text-cx-muted leading-relaxed mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Info Panel */}
            <div className="cx-card p-5 space-y-4 mt-2">
              {INFO_ITEMS.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cx-surface flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-cx-emerald" />
                  </div>
                  <div>
                    <p className="text-[10px] font-700 text-cx-muted uppercase tracking-wide">{item.label}</p>
                    <p className="text-[13px] font-700 text-white">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Form */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="cx-card p-10 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-cx-emerald/15 border-2 border-cx-emerald/30 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-cx-emerald" />
                </div>
                <h3 className="font-800 text-[26px] text-white mb-2">Message Sent! ✅</h3>
                <p className="text-cx-muted text-[14px] mb-6 leading-relaxed max-w-sm">
                  Thanks <strong className="text-white">{form.name}</strong>! We'll reply to{' '}
                  <strong className="text-cx-emerald">{form.email}</strong> within 24–48 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '', category: 'Support', priority: 'medium' }) }}
                  className="btn-outline-em px-6 py-3 text-[13px] rounded-xl flex items-center gap-2">
                  <ArrowRight size={14} /> Send Another
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cx-card p-8">
                <h2 className="font-display font-800 text-[22px] text-white mb-1 flex items-center gap-2">
                  <Send size={18} className="text-cx-emerald" /> Send a Message
                </h2>
                <p className="text-[13px] text-cx-muted mb-6">Enter your email so we can reply directly. No character limits — write as much as you need.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Your Name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted text-[13px]">⟨/⟩</span>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Rivera" required
                          className="w-full bg-cx-surface border border-cx-border rounded-xl pl-8 pr-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Email <span className="text-cx-emerald normal-case font-500">(for reply)</span></label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted" />
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" required
                          className="w-full bg-cx-surface border border-cx-border rounded-xl pl-8 pr-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Category</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted">🏷</span>
                        <select value={form.category} onChange={e => set('category', e.target.value)}
                          className="w-full bg-cx-surface border border-cx-border rounded-xl pl-8 pr-4 py-3 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-all appearance-none">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Priority</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted">⚠</span>
                        <select value={form.priority} onChange={e => set('priority', e.target.value)}
                          className="w-full bg-cx-surface border border-cx-border rounded-xl pl-8 pr-4 py-3 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-all capitalize appearance-none">
                          {PRIORITIES.map(p => <option key={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Subject</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted">📄</span>
                      <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief description" required
                        className="w-full bg-cx-surface border border-cx-border rounded-xl pl-8 pr-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1.5">Message</label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={6}
                      placeholder="Tell us how we can help you. No limits — write as much as needed."
                      className="w-full bg-cx-surface border border-cx-border rounded-xl px-4 py-3 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all resize-none" />
                    <p className="text-[10px] text-cx-muted mt-1">{form.message.length} characters · No limit</p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-em w-full py-4 text-[14px] rounded-xl font-800 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Common Questions (bottom) */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16">
          <h2 className="text-[22px] font-display font-800 text-white text-center mb-2">Common Questions</h2>
          <div className="flex justify-center mb-8">
            <span className="w-2 h-2 rounded-full bg-cx-emerald" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FAQ.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="cx-card p-5 cursor-pointer hover:border-cx-emerald/30 transition-all group"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <p className="text-[14px] font-700 text-white group-hover:text-cx-emerald transition-colors">{faq.q}</p>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="text-[12px] text-cx-muted mt-2 leading-relaxed overflow-hidden">{faq.a}</motion.p>
                  )}
                  {openFaq !== i && (
                    <p className="text-[12px] text-cx-muted mt-1 truncate">{faq.a}</p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
