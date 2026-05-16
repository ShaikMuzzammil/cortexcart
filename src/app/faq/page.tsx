export const metadata = { title:'FAQ — CortexCart' }
const FAQS = [
  {q:'How does AI pricing work?',a:'Our system analyzes real-time demand, inventory levels, and market trends to offer you the best possible price. Some users may see personalized offers based on their shopping history.'},
  {q:'How long does shipping take?',a:'Standard shipping takes 3–7 business days. Express shipping (1–2 days) is available at checkout. Free standard shipping on all orders over $99.'},
  {q:'What is your return policy?',a:'We offer hassle-free 30-day returns on all products. Items must be in original condition. Simply initiate a return from your order page.'},
  {q:'How do I track my order?',a:'Visit the Track Order page and enter your order number from your confirmation email. You\'ll see real-time status and estimated delivery date.'},
  {q:'Is my payment information secure?',a:'Absolutely. All payments are processed by Stripe with 256-bit SSL encryption. We never store your card details on our servers.'},
  {q:'Can I change or cancel my order?',a:'Orders can be modified or cancelled within 1 hour of placement. After that, contact our support team immediately.'},
  {q:'Do you ship internationally?',a:'Yes! We ship to 45+ countries. International shipping rates and delivery times are shown at checkout based on your location.'},
  {q:'How do AI recommendations work?',a:'Our neural engine analyzes your browsing history, purchase patterns, and similar users to surface products you\'ll love. It improves over time.'},
]
export default function FAQPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-900 text-4xl text-white mb-3">Frequently Asked <span className="grad-emerald">Questions</span></h1>
          <p className="text-cx-muted">Everything you need to know about CortexCart</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((f,i)=>(
            <div key={i} className="p-5 rounded-2xl cx-card-flat">
              <h3 className="font-700 text-[14px] text-cx-text mb-2">{f.q}</h3>
              <p className="text-[13px] text-cx-muted leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
