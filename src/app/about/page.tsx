import { Zap, Brain, Globe, Award } from 'lucide-react'
export const metadata = { title:'About — CortexCart' }
export default function AboutPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="badge-em mb-4 inline-block">Our Story</span>
          <h1 className="font-display font-900 text-5xl text-white mt-3 mb-4">About <span className="grad-emerald">CortexCart</span></h1>
          <p className="text-cx-muted text-lg max-w-2xl mx-auto leading-relaxed">We're building the future of personalized commerce — where AI understands your taste better than you do.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {[
            {icon:Brain,title:'AI-First',desc:'Every decision — from recommendations to pricing — is powered by machine learning.',color:'text-cx-violet',bg:'bg-cx-violet/8',border:'border-cx-violet/20'},
            {icon:Globe,title:'Global Reach',desc:'Serving customers in 45+ countries with localized experiences and fast delivery.',color:'text-cx-emerald',bg:'bg-cx-emerald/8',border:'border-cx-emerald/20'},
            {icon:Award,title:'Quality Curated',desc:'Every product is vetted by our team before listing. No junk, no fakes.',color:'text-cx-gold',bg:'bg-cx-gold/8',border:'border-cx-gold/20'},
            {icon:Zap,title:'Lightning Fast',desc:'Built on the edge with Next.js 14, sub-100ms page loads globally.',color:'text-cx-rose',bg:'bg-cx-rose/8',border:'border-cx-rose/20'},
          ].map(f=>(
            <div key={f.title} className={`p-6 rounded-2xl ${f.bg} border ${f.border}`}>
              <f.icon size={22} className={`${f.color} mb-3`}/>
              <h3 className="font-700 text-white mb-2">{f.title}</h3>
              <p className="text-[13px] text-cx-muted">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-8 rounded-3xl cx-card-flat text-center">
          <p className="text-cx-muted text-[15px] leading-relaxed max-w-2xl mx-auto">CortexCart was founded in 2023 with a simple mission: make online shopping smarter, faster, and more personal. Today we serve over 50,000 customers worldwide, powered by a team of 40+ engineers, designers, and AI researchers.</p>
        </div>
      </div>
    </div>
  )
}
