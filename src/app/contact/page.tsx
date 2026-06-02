import { ContactForm } from '@/components/ContactForm'
import { Mail, Clock, MapPin, Zap, Shield, MessageSquare, HeartHandshake, Newspaper } from 'lucide-react'

export const metadata = { title: 'Contact — CortexCart' }

const CATEGORIES = [
  { id:'support',     icon:MessageSquare,  label:'Customer Support',  desc:'Orders, returns, account help',          color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/20' },
  { id:'partnership', icon:HeartHandshake, label:'Partnerships',       desc:'Brands, API integrations, white-label',  color:'text-cx-violet',  bg:'bg-cx-violet/8',  border:'border-cx-violet/20' },
  { id:'press',       icon:Newspaper,      label:'Press & Media',      desc:'Interviews, press kits, enquiries',      color:'text-cx-gold',    bg:'bg-cx-gold/8',    border:'border-cx-gold/20' },
  { id:'general',     icon:Mail,           label:'General',            desc:'Anything else — we\'re happy to hear',   color:'text-cx-rose',    bg:'bg-cx-rose/8',    border:'border-cx-rose/20' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-cx-emerald animate-pulse-soft"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Support Online</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-6xl text-white mb-4">
            Get In <span className="grad-multi">Touch</span>
          </h1>
          <p className="text-cx-muted text-lg max-w-xl mx-auto leading-relaxed">
            Our team typically responds within 24 hours. All messages are securely delivered — nothing is exposed publicly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="space-y-4">
            <h2 className="font-display font-700 text-lg text-white">What can we help with?</h2>
            {CATEGORIES.map(c => (
              <div key={c.id} className={`flex items-start gap-3 p-4 rounded-2xl ${c.bg} border ${c.border} transition-all hover:-translate-x-0.5`}>
                <c.icon size={16} className={`${c.color} flex-shrink-0 mt-0.5`}/>
                <div>
                  <p className="font-600 text-[13px] text-cx-text">{c.label}</p>
                  <p className="text-[11px] text-cx-muted mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-cx-violet/8 border border-cx-violet/20">
              <div className="flex items-start gap-3">
                <Shield size={15} className="text-cx-violet flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-600 text-[12px] text-white mb-1">Secure Delivery</p>
                  <p className="text-[11px] text-cx-muted leading-relaxed">
                    Messages are processed via our secure email integration and delivered to our team. Your contact details are never exposed publicly.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl cx-card-flat">
              <div className="space-y-3">
                {[
                  { icon:Clock,  label:'Response Time', val:'Within 24–48 hours' },
                  { icon:MapPin, label:'Headquarters',  val:'San Francisco, CA' },
                  { icon:Zap,    label:'Support Hours', val:'Mon–Fri 9am–6pm EST' },
                ].map(i => (
                  <div key={i.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cx-border flex items-center justify-center flex-shrink-0">
                      <i.icon size={13} className="text-cx-emerald"/>
                    </div>
                    <div>
                      <p className="text-[10px] text-cx-muted uppercase tracking-wide">{i.label}</p>
                      <p className="text-[12px] text-cx-text">{i.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm/>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="font-display font-700 text-2xl text-white mb-8 text-center">Common Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { q:'How long does shipping take?', a:'Standard 3–7 days. Express 1–2 days. Free on orders over $99.' },
              { q:'What is your return policy?',  a:'30-day hassle-free returns. Submit a request from your order page.' },
              { q:'Is my payment secure?',        a:'Yes. Stripe handles all payments with 256-bit encryption.' },
              { q:'Do you ship internationally?', a:'Yes! We ship to 45+ countries. Rates calculated at checkout.' },
              { q:'How does AI pricing work?',    a:'Our AI adjusts prices based on demand, stock, and market trends.' },
              { q:'How do I track my order?',     a:'Visit /orders with your order number for real-time updates.' },
            ].map(f => (
              <div key={f.q} className="p-5 rounded-2xl cx-card-flat hover:border-cx-emerald/25 transition-colors">
                <p className="font-600 text-[13px] text-cx-text mb-2">{f.q}</p>
                <p className="text-[12px] text-cx-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
