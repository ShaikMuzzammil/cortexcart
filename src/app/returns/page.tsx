export const metadata = { title:'Returns — CortexCart' }
export default function ReturnsPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-900 text-4xl text-white mb-3">Return <span className="grad-gold">Policy</span></h1>
        <p className="text-cx-muted mb-10">Hassle-free returns within 30 days.</p>
        <div className="space-y-5">
          {[
            {t:'30-Day Window',d:'You have 30 days from delivery to return any item for a full refund or exchange.'},
            {t:'Original Condition',d:'Items must be in original condition with all packaging and accessories included.'},
            {t:'How to Return',d:'Go to your order history, select the item, and click "Return Item". A prepaid label will be emailed within 24 hours.'},
            {t:'Refund Timeline',d:'Refunds are processed within 3–5 business days after we receive the return. Credit typically appears in 5–10 days.'},
            {t:'Exceptions',d:'Software downloads, gift cards, and custom-configured items are non-returnable once activated.'},
          ].map(item=>(
            <div key={item.t} className="p-5 rounded-2xl cx-card-flat">
              <h3 className="font-700 text-[14px] text-cx-text mb-2">{item.t}</h3>
              <p className="text-[13px] text-cx-muted">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
