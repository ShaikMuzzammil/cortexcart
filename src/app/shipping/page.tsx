import { Truck, Globe, Zap, Clock } from 'lucide-react'
export const metadata = { title:'Shipping — CortexCart' }
export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-900 text-4xl text-white mb-3">Shipping <span className="grad-emerald">Policy</span></h1>
        <p className="text-cx-muted mb-10">Fast, reliable delivery worldwide.</p>
        <div className="space-y-5">
          {[
            {icon:Zap,title:'Free Standard Shipping',desc:'All orders over $99 qualify for free standard shipping (3–7 business days) within the US.',color:'text-cx-emerald',bg:'bg-cx-emerald/8',border:'border-cx-emerald/20'},
            {icon:Clock,title:'Express Shipping',desc:'Need it fast? Express shipping (1–2 business days) is available for $19.99.',color:'text-cx-gold',bg:'bg-cx-gold/8',border:'border-cx-gold/20'},
            {icon:Globe,title:'International',desc:'We ship to 45+ countries. International rates calculated at checkout. Delivery 7–14 business days.',color:'text-cx-sky',bg:'bg-cx-sky/8',border:'border-cx-sky/20'},
            {icon:Truck,title:'Order Tracking',desc:'Every order includes a tracking number. Track in real time on our Orders page.',color:'text-cx-violet',bg:'bg-cx-violet/8',border:'border-cx-violet/20'},
          ].map(f=>(
            <div key={f.title} className={`flex items-start gap-4 p-5 rounded-2xl ${f.bg} border ${f.border}`}>
              <f.icon size={20} className={`${f.color} flex-shrink-0 mt-0.5`}/>
              <div><h3 className="font-700 text-[14px] text-cx-text mb-1">{f.title}</h3><p className="text-[13px] text-cx-muted">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
