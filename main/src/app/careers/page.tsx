export const metadata = { title:'Careers — CortexCart' }
const JOBS = [
  {title:'Senior ML Engineer',dept:'Engineering',loc:'San Francisco / Remote',type:'Full-time'},
  {title:'Product Designer',dept:'Design',loc:'Remote',type:'Full-time'},
  {title:'Backend Engineer (Next.js)',dept:'Engineering',loc:'Remote',type:'Full-time'},
  {title:'Growth Marketing Manager',dept:'Marketing',loc:'San Francisco',type:'Full-time'},
]
export default function CareersPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-900 text-4xl text-white mb-3">Join <span className="grad-gold">Our Team</span></h1>
          <p className="text-cx-muted">Help us build the future of AI-powered commerce</p>
        </div>
        <div className="space-y-4">
          {JOBS.map(j=>(
            <div key={j.title} className="flex items-center justify-between p-5 rounded-2xl cx-card-flat hover:border-cx-gold/25 transition-colors">
              <div>
                <p className="font-700 text-[14px] text-cx-text">{j.title}</p>
                <p className="text-[12px] text-cx-muted mt-0.5">{j.dept} · {j.loc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge-gold">{j.type}</span>
                <button className="btn-outline-gold px-4 py-1.5 text-[12px] rounded-lg">Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
