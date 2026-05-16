import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { ArrowRight, Zap, Brain, TrendingUp, Shield, Sparkles, ChevronRight, Star, Package, Users, Award, Globe } from 'lucide-react'

async function getData() {
  const [featured, categories, productCount, orderCount] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, include: { category: true }, take: 6, orderBy: { reviewCount: 'desc' } }),
    prisma.category.findMany({ take: 6, orderBy: { name: 'asc' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
  ])
  return { featured, categories, productCount, orderCount }
}

const FEATURES = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Neural engine surfaces products you want before you search.', color: 'text-cx-violet', border: 'border-cx-violet/20', bg: 'bg-cx-violet/8' },
  { icon: TrendingUp, title: 'Dynamic Pricing', desc: 'Real-time price optimization based on demand and inventory.', color: 'text-cx-emerald', border: 'border-cx-emerald/20', bg: 'bg-cx-emerald/8' },
  { icon: Sparkles, title: 'Semantic Search', desc: 'Describe what you need in plain language — our AI finds it.', color: 'text-cx-gold', border: 'border-cx-gold/20', bg: 'bg-cx-gold/8' },
  { icon: Shield, title: 'Secure & Private', desc: 'Military-grade encryption. Zero data sold to third parties.', color: 'text-cx-rose', border: 'border-cx-rose/20', bg: 'bg-cx-rose/8' },
]

const CAT_ICONS: Record<string, string> = { electronics: '⚡', wearables: '⌚', audio: '🎧', computing: '💻', photography: '📷', gaming: '🎮' }

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Creative Director', text: 'The AI recommendations are uncanny. Found my perfect setup in minutes.', rating: 5, avatar: 'SK' },
  { name: 'Marcus T.', role: 'Software Engineer', text: 'Dynamic pricing saved me $340 on my laptop. Incredible platform.', rating: 5, avatar: 'MT' },
  { name: 'Priya M.', role: 'Photographer', text: 'Best camera gear selection I\'ve found online. Fast shipping too.', rating: 5, avatar: 'PM' },
]

export default async function HomePage() {
  const { featured, categories, productCount, orderCount } = await getData()

  return (
    <div className="page-enter overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-10 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-cx-violet/6 blur-[180px]" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-cx-emerald/5 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cx-gold/4 blur-[100px] animate-float" style={{animationDelay:'3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cx-emerald animate-pulse-soft" />
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-[0.15em]">Next-Gen AI Commerce Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-900 text-5xl sm:text-7xl lg:text-8xl leading-[0.92] tracking-tight mb-6 animate-slide-up">
            <span className="grad-white">Shopping</span><br />
            <span className="grad-multi">Reimagined</span><br />
            <span className="grad-white text-4xl sm:text-5xl lg:text-6xl font-700">by Artificial Intelligence</span>
          </h1>

          <p className="text-cx-dim text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{animationDelay:'0.2s'}}>
            Hyper-personalized shopping with real-time AI recommendations, dynamic pricing, and semantic product discovery. Commerce from the future.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in" style={{animationDelay:'0.3s'}}>
            <Link href="/products" className="btn-em px-8 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2.5 group">
              <Zap size={17} /> Explore Products
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/register" className="btn-outline-em px-8 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2">
              Create Free Account
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-px bg-cx-border rounded-2xl overflow-hidden border border-cx-border animate-fade-in" style={{animationDelay:'0.4s'}}>
            {[
              { v: `${productCount}+`, l: 'Products' },
              { v: `${(orderCount * 8).toLocaleString()}+`, l: 'Orders' },
              { v: '4.9★', l: 'Avg Rating' },
              { v: '45+', l: 'Countries' },
            ].map(s => (
              <div key={s.l} className="bg-cx-surface px-6 py-4 text-center">
                <div className="font-display font-800 text-xl grad-emerald num">{s.v}</div>
                <div className="text-[11px] text-cx-muted mt-0.5 font-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-16" />
          <div className="text-center mb-12">
            <span className="badge-em mb-3 inline-block">Why CortexCart</span>
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-white mt-3">Commerce Reimagined</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className={`p-6 rounded-2xl ${f.bg} border ${f.border} cx-card group`}>
                <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="font-display font-700 text-white mb-2 text-[15px]">{f.title}</h3>
                <p className="text-[13px] text-cx-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-gold mb-2 inline-block">Browse</span>
              <h2 className="font-display font-800 text-3xl text-white mt-2">Shop by Category</h2>
            </div>
            <Link href="/products" className="btn-outline-gold px-5 py-2 text-sm rounded-xl hidden sm:flex items-center gap-2">All <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl cx-card-flat hover:border-cx-gold/30 hover:bg-cx-gold/4 transition-all duration-300 text-center hover:-translate-y-1">
                <span className="text-3xl">{CAT_ICONS[cat.slug] || '🛒'}</span>
                <span className="text-xs font-600 text-cx-dim group-hover:text-cx-gold transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-16" />
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-rose mb-2 inline-block">Hand-picked</span>
              <h2 className="font-display font-800 text-3xl text-white mt-2">Featured Products</h2>
            </div>
            <Link href="/products?featured=true" className="btn-outline-em px-5 py-2 text-sm rounded-xl hidden sm:flex items-center gap-2">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(p => (
              <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                stock={p.stock} isFeatured={p.isFeatured} tags={p.tags} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-vio mb-3 inline-block">Social Proof</span>
            <h2 className="font-display font-800 text-4xl text-white mt-3">Loved by Thousands</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl cx-card-flat border-cx-border">
                <div className="flex mb-3">{[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-cx-gold text-cx-gold" />)}</div>
                <p className="text-cx-dim text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div><p className="text-sm font-600 text-cx-text">{t.name}</p><p className="text-xs text-cx-muted">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-cx-emerald/20 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cx-emerald/8 via-cx-bg to-cx-violet/8" />
            <div className="absolute top-0 left-0 w-64 h-64 orb-em rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-48 h-48 orb-vio rounded-full blur-[60px]" />
            <div className="relative">
              <Award size={40} className="text-cx-gold mx-auto mb-4" />
              <h2 className="font-display font-900 text-4xl sm:text-5xl text-white mb-4">Ready to Shop Smarter?</h2>
              <p className="text-cx-dim text-lg max-w-lg mx-auto mb-8">Join over 50,000 smart shoppers using AI to discover products they love.</p>
              <Link href="/auth/register" className="btn-em px-10 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2.5">
                <Brain size={18} /> Start for Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST + FOOTER ─────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-cx-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {[
              { icon: '🛡️', t: 'Secure Checkout', d: 'Stripe 256-bit SSL' },
              { icon: '🚚', t: 'Free Shipping',   d: 'On orders over $99' },
              { icon: '🔄', t: '30-Day Returns',  d: 'Hassle-free guarantee' },
              { icon: '💬', t: '24/7 Support',    d: 'AI + human assistance' },
            ].map(b => (
              <div key={b.t} className="flex items-start gap-3 p-4 rounded-2xl cx-card-flat">
                <span className="text-xl">{b.icon}</span>
                <div><p className="font-600 text-sm text-cx-text">{b.t}</p><p className="text-xs text-cx-muted mt-0.5">{b.d}</p></div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="section-divider mb-12" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center"><Zap size={14} className="text-cx-bg" /></div>
                <span className="font-display font-800 text-lg text-white">Cortex<span className="grad-emerald">Cart</span></span>
              </div>
              <p className="text-xs text-cx-muted leading-relaxed">AI-powered commerce for the modern shopper. Smart, fast, personalized.</p>
            </div>
            {[
              { h: 'Shop', links: [['All Products','/products'],['Electronics','/products?category=electronics'],['Wearables','/products?category=wearables'],['Audio','/products?category=audio'],['Gaming','/products?category=gaming']] },
              { h: 'Company', links: [['About','/about'],['Blog','/blog'],['Careers','/careers'],['Contact','/contact']] },
              { h: 'Support', links: [['FAQ','/faq'],['Shipping','/shipping'],['Returns','/returns'],['Track Order','/orders'],['Privacy','/privacy']] },
            ].map(col => (
              <div key={col.h}>
                <h4 className="text-xs font-700 text-cx-text uppercase tracking-wider mb-4">{col.h}</h4>
                <ul className="space-y-2">{col.links.map(([l,h]) => <li key={l}><Link href={h} className="text-xs text-cx-muted hover:text-cx-emerald transition-colors">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-cx-muted">
            <span>© {new Date().getFullYear()} CortexCart Inc. All rights reserved.</span>
            <span className="flex items-center gap-1">Powered by <span className="grad-emerald font-semibold ml-1">Cortex AI Engine v4.0</span></span>
          </div>
        </div>
      </section>
    </div>
  )
}
