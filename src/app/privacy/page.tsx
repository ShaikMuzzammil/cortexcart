export const metadata = { title:'Privacy Policy — CortexCart' }
export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="font-display font-900 text-4xl text-white mb-3">Privacy <span className="grad-violet">Policy</span></h1>
        <p className="text-cx-muted mb-10">Last updated: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
        {[
          {t:'Information We Collect',d:'We collect information you provide (name, email, payment details) and automatically collected data (browsing behavior, device type, IP address) to improve your experience.'},
          {t:'How We Use Your Data',d:'Your data powers AI recommendations, personalizes pricing, processes orders, and helps us communicate with you. We never sell personal data to third parties.'},
          {t:'Data Security',d:'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Payment data is handled exclusively by Stripe and never stored on our servers.'},
          {t:'Your Rights',d:'You may request access, correction, or deletion of your data at any time by contacting support@cortexcart.com. We will respond within 30 days.'},
          {t:'Cookies',d:'We use essential cookies for authentication and optional analytics cookies. You can manage cookie preferences in your browser settings.'},
          {t:'Contact',d:'For privacy questions, email privacy@cortexcart.com or write to CortexCart Inc., 123 AI Avenue, San Francisco CA 94105.'},
        ].map(s=>(
          <div key={s.t} className="p-5 rounded-2xl cx-card-flat mb-4">
            <h3 className="font-700 text-[14px] text-cx-text mb-2">{s.t}</h3>
            <p className="text-[13px] text-cx-muted leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
