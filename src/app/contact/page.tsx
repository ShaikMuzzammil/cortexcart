'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, MessageSquare, Clock, Headphones, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['General Inquiry','Order Support','Returns & Refunds','Technical Support','Partnership','Billing','Feedback','Other']
const PRIORITIES  = ['low','medium','high','urgent']
const FAQ = [
  { q:'How do I track my order?', a:'Visit the Track Order page and enter your order number from your confirmation email. You\'ll see real-time status updates.' },
  { q:'What payment methods do you accept?', a:'We accept all major credit/debit cards (Visa, Mastercard, Amex), digital wallets, and Cash on Delivery for eligible orders.' },
  { q:'How long does shipping take?', a:'Standard: 5–7 business days. Express: 2–3 business days. Overnight: Next business day. Free shipping on orders over $99.' },
  { q:'What is your return policy?', a:'We offer a hassle-free 30-day return policy on all items. Items must be unused and in original packaging. Initiate returns from your account.' },
  { q:'Is my payment information secure?', a:'Absolutely. We use 256-bit SSL encryption and never store card details on our servers. All payments go through PCI-DSS certified processors.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'', category:'General Inquiry', priority:'medium' })
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [openFaq,  setOpenFaq]  = useState<number|null>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch { toast.error('Failed to send message. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 pb-24 sm:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display font-800 text-4xl text-white mb-3">Get in Touch</h1>
          <p className="text-cx-muted text-[15px] max-w-xl mx-auto">Our support team is here to help. Reach out and we'll get back to you within 24 hours.</p>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon:Mail,      color:'text-cx-emerald', bg:'bg-cx-emerald/10', border:'border-cx-emerald/20', label:'Email Support', val:'support@cortexcart.com', sub:'Response within 24h' },
            { icon:Phone,     color:'text-cx-sky',     bg:'bg-cx-sky/10',     border:'border-cx-sky/20',     label:'Live Chat',     val:'Available 9AM–6PM',   sub:'Mon–Fri' },
            { icon:MapPin,    color:'text-cx-violet',  bg:'bg-cx-violet/10',  border:'border-cx-violet/20',  label:'Office',        val:'San Francisco, CA',   sub:'USA' },
          ].map(item => (
            <div key={item.label} className={`cx-card p-5 flex items-center gap-4 border ${item.border}`}>
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon size={22} className={item.color}/>
              </div>
              <div>
                <p className="text-[11px] text-cx-muted uppercase tracking-wide">{item.label}</p>
                <p className="text-[14px] font-700 text-white">{item.val}</p>
                <p className="text-[12px] text-cx-dim">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* FAQ */}
          <div>
            <h2 className="font-display font-800 text-[22px] text-white mb-6 flex items-center gap-2">
              <HelpCircle size={20} className="text-cx-emerald"/> Frequently Asked Questions
            </h2>
            <div className="space-y-3 mb-8">
              {FAQ.map((faq, i) => (
                <div key={i} className={`cx-card overflow-hidden transition-all cursor-pointer ${openFaq===i?'border-cx-emerald/30':''}`}
                  onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  <div className="flex items-center justify-between p-4">
                    <p className="text-[14px] font-700 text-white pr-4">{faq.q}</p>
                    {openFaq===i ? <ChevronUp size={16} className="text-cx-emerald flex-shrink-0"/> : <ChevronDown size={16} className="text-cx-muted flex-shrink-0"/>}
                  </div>
                  <AnimatePresence>
                    {openFaq===i && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                        className="overflow-hidden">
                        <p className="px-4 pb-4 text-[13px] text-cx-dim leading-relaxed border-t border-cx-border pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="sent" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                  className="cx-card p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cx-emerald/15 border-2 border-cx-emerald/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-cx-emerald"/>
                  </div>
                  <h3 className="font-800 text-[22px] text-white mb-2">Message Sent! ✅</h3>
                  <p className="text-cx-muted text-[14px] mb-6 leading-relaxed">
                    Thanks <strong className="text-white">{form.name}</strong>! We've received your message and will reply to <strong className="text-cx-emerald">{form.email}</strong> within 24–48 business hours.
                  </p>
                  <p className="text-[12px] text-cx-muted">Check your inbox for a confirmation email.</p>
                  <button onClick={()=>{setSent(false);setForm({name:'',email:'',phone:'',subject:'',message:'',category:'General Inquiry',priority:'medium'})}}
                    className="mt-6 btn-outline-em px-6 py-3 text-[13px] rounded-xl">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="cx-card p-6 space-y-4">
                  <h2 className="font-display font-800 text-[20px] text-white flex items-center gap-2 mb-2">
                    <MessageSquare size={18} className="text-cx-emerald"/> Send a Message
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {[{k:'name',l:'Name',req:true},{k:'email',l:'Email',type:'email',req:true}].map(f=>(
                      <div key={f.k}>
                        <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">{f.l}{f.req&&<span className="text-cx-rose ml-1">*</span>}</label>
                        <input type={f.type||'text'} value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} required={f.req}
                          className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all"/>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">Phone (optional)</label>
                    <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
                      className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all"/>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">Category</label>
                      <select value={form.category} onChange={e=>set('category',e.target.value)}
                        className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-all">
                        {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">Priority</label>
                      <select value={form.priority} onChange={e=>set('priority',e.target.value)}
                        className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text outline-none focus:border-cx-emerald/50 transition-all capitalize">
                        {PRIORITIES.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">Subject <span className="text-cx-rose">*</span></label>
                    <input value={form.subject} onChange={e=>set('subject',e.target.value)} required
                      className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all"/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-700 text-cx-muted uppercase tracking-wide mb-1">Message <span className="text-cx-rose">*</span></label>
                    <textarea value={form.message} onChange={e=>set('message',e.target.value)} required rows={5}
                      placeholder="Describe your issue or question in detail..."
                      className="w-full bg-cx-surface border border-cx-border rounded-xl px-3 py-2.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/50 transition-all resize-none"/>
                    <p className="text-[11px] text-cx-muted mt-1">{form.message.length} characters</p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-em w-full py-3.5 text-[14px] rounded-xl font-800 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <><Send size={15}/> Send Message</>}
                  </button>

                  <p className="text-[11px] text-cx-muted text-center flex items-center justify-center gap-1.5">
                    <Clock size={11}/> Average response time: 12–24 business hours
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
