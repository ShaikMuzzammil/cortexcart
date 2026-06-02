import Link from 'next/link'
export const metadata = { title:'Blog — CortexCart' }
const POSTS = [
  {title:'How AI Is Transforming Online Shopping in 2025',date:'May 10, 2025',tag:'AI',excerpt:'From personalized recommendations to dynamic pricing, artificial intelligence is reshaping the retail landscape.'},
  {title:'The Science Behind Dynamic Pricing',date:'Apr 28, 2025',tag:'Pricing',excerpt:'How real-time demand signals and inventory data create fair, optimized prices for every shopper.'},
  {title:'Top 10 Tech Gadgets of 2025',date:'Apr 15, 2025',tag:'Products',excerpt:'Our curated selection of must-have technology products that are defining this year.'},
  {title:'CortexCart Reaches 50,000 Customers',date:'Mar 30, 2025',tag:'News',excerpt:'We celebrate a major milestone and share what we\'ve learned building an AI-first commerce platform.'},
]
export default function BlogPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-900 text-4xl text-white mb-2">CortexCart <span className="grad-violet">Blog</span></h1>
        <p className="text-cx-muted mb-10">Insights on AI, commerce, and technology</p>
        <div className="space-y-5">
          {POSTS.map(p=>(
            <div key={p.title} className="p-6 rounded-2xl cx-card-flat hover:border-cx-emerald/25 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="badge-em">{p.tag}</span>
                <span className="text-[11px] text-cx-muted">{p.date}</span>
              </div>
              <h3 className="font-700 text-[16px] text-cx-text mb-2">{p.title}</h3>
              <p className="text-[13px] text-cx-muted leading-relaxed">{p.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
