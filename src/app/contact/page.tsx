import { ContactForm } from '@/components/ContactForm'
import { Mail, Phone, MapPin, Clock, MessageSquare, Zap, Shield, HeartHandshake } from 'lucide-react'

const INFO = [
  { icon:Mail,          label:'Email Us',        value:'support@cortexcart.com',    sub:'Replies within 24–48 hours',  color:'text-cx-emerald', bg:'bg-cx-emerald/8', border:'border-cx-emerald/20' },
  { icon:Phone,         label:'Call Us',          value:'+1 (888) CORTEX-1',         sub:'Mon–Fri, 9 AM – 6 PM EST',    color:'text-cx-sky',     bg:'bg-cx-sky/8',     border:'border-cx-sky/20' },
  { icon:MapPin,        label:'Headquarters',     value:'San Francisco, CA 94105',   sub:'Cortex Tower, Floor 42',      color:'text-cx-violet',  bg:'bg-cx-violet/8',  border:'border-cx-violet/20' },
  { icon:Clock,         label:'Support Hours',    value:'24/7 AI Support',           sub:'Human agents Mon–Sun 8–8 EST',color:'text-cx-gold',    bg:'bg-cx-gold/8',    border:'border-cx-gold/20' },
]

const FAQS = [
  { q:'How long does shipping take?',          a:'Standard shipping is 5–7 business days. Express is 2–3 days. Overnight is next business day.' },
  { q:'Can I change or cancel my order?',      a:'Yes, within 2 hours of placing. After that, contact support and we\'ll do our best to help before dispatch.' },
  { q:'What\'s your return policy?',           a:'30-day hassle-free returns on all items. Just contact support and we\'ll arrange free collection.' },
  { q:'Do you offer Pay on Delivery?',         a:'Yes! Select "Pay on Delivery" at checkout. Available on all orders. A small COD handling fee applies.' },
  { q:'How do I track my order?',              a:'Visit /orders, enter your order number, and see real-time status with estimated delivery time.' },
  { q:'Are my payment details secure?',        a:'Absolutely. All payments use 256-bit SSL encryption. We never store card numbers.' },
]

export default function ContactPage() {
  return (
    <div className="page-enter min-h-screen pb-24">

      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px]" style={{background:'rgba(16,217,136,0.05)'}}/>
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px]" style={{background:'rgba(139,92,246,0.05)'}}/>
        </div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-6">
            <MessageSquare size={13} className="text-cx-emerald"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Get in Touch</span>
          </div>
          <h1 className="font-display font-800 text-5xl sm:text-6xl text-white mb-4 leading-tight">
            We're Here to <span className="grad-emerald">Help</span>
          </h1>
          <p className="text-cx-muted text-lg max-w-xl mx-auto leading-relaxed">
            Questions, feedback, or just want to say hello — our team is here for you. No message is too long or too short.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INFO.map(item => (
            <div key={item.label} className={`p-5 rounded-2xl ${item.bg} border ${item.border} transition-all hover:-translate-y-1 duration-300`}>
              <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center mb-3`}>
                <item.icon size={18} className={item.color}/>
              </div>
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className="font-700 text-[13px] text-cx-text">{item.value}</p>
              <p className="text-[11px] text-cx-muted mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form — wider */}
          <div className="lg:col-span-3">
            <div className="p-8 rounded-3xl cx-card-flat">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20 flex items-center justify-center">
                  <Zap size={17} className="text-cx-emerald"/>
                </div>
                <div>
                  <h2 className="font-display font-700 text-xl text-white">Send a Message</h2>
                  <p className="text-[12px] text-cx-muted">Write as much as you need — no limits</p>
                </div>
              </div>
              <ContactForm/>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake size={18} className="text-cx-violet"/>
              <h2 className="font-display font-700 text-xl text-white">Quick Answers</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl cx-card-flat hover:border-cx-emerald/20 transition-all">
                <p className="font-700 text-[13px] text-cx-text mb-1.5 flex items-start gap-2">
                  <span className="text-cx-emerald mt-0.5 flex-shrink-0">Q.</span>{faq.q}
                </p>
                <p className="text-[12px] text-cx-muted leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}

            {/* Trust badges */}
            <div className="p-5 rounded-2xl bg-cx-violet/5 border border-cx-violet/15 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} className="text-cx-violet"/>
                <span className="font-700 text-[13px] text-cx-text">Our Commitments</span>
              </div>
              <ul className="space-y-2 text-[12px] text-cx-muted">
                <li className="flex items-center gap-2">✓ <span>No automated brushoffs — real human answers</span></li>
                <li className="flex items-center gap-2">✓ <span>30-day money back on everything</span></li>
                <li className="flex items-center gap-2">✓ <span>We read every single message</span></li>
                <li className="flex items-center gap-2">✓ <span>Your data is never shared or sold</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
