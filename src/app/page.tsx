import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { LiveStats } from '@/components/LiveStats'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Zap, Shield, Truck, Sparkles, TrendingUp, Star, Package, Users, Award, ChevronRight, Cpu, Watch, Headphones, Monitor, Camera, Gamepad2 } from 'lucide-react'
import Image from 'next/image'

async function getFeatured() {
  return prisma.product.findMany({ where:{ isActive:true, isFeatured:true }, take:8, orderBy:{ reviewCount:'desc' },
    include:{ category:true } }).catch(()=>[])
}
async function getCategories() {
  return prisma.category.findMany({ take:6 }).catch(()=>[])
}
async function getStats() {
  const [orders, users, products] = await Promise.all([
    prisma.order.count().catch(()=>12847),
    prisma.user.count().catch(()=>48293),
    prisma.product.count({ where:{ isActive:true } }).catch(()=>52),
  ])
  return { orders, users, products }
}

const CATEGORY_ICONS: Record<string,any> = {
  electronics: Cpu, wearables: Watch, audio: Headphones,
  computing: Monitor, photography: Camera, gaming: Gamepad2,
}
const CATEGORY_COLORS: Record<string,string> = {
  electronics:'from-cx-sky/20 to-cx-sky/5 border-cx-sky/20 text-cx-sky',
  wearables:  'from-cx-emerald/20 to-cx-emerald/5 border-cx-emerald/20 text-cx-emerald',
  audio:      'from-cx-violet/20 to-cx-violet/5 border-cx-violet/20 text-cx-violet',
  computing:  'from-cx-gold/20 to-cx-gold/5 border-cx-gold/20 text-cx-gold',
  photography:'from-cx-rose/20 to-cx-rose/5 border-cx-rose/20 text-cx-rose',
  gaming:     'from-cx-emerald/20 to-cx-emerald/5 border-cx-emerald/20 text-cx-emerald',
}

const FEATURES = [
  { icon:Zap,       title:'AI-Powered Picks',       desc:'Machine learning recommends products tuned to your taste and browsing history.', color:'text-cx-gold',   bg:'bg-cx-gold/8',   border:'border-cx-gold/15' },
  { icon:TrendingUp,title:'Dynamic Smart Pricing',  desc:'Real-time price adjustments ensure you always get fair, competitive rates.',     color:'text-cx-emerald',bg:'bg-cx-emerald/8',border:'border-cx-emerald/15' },
  { icon:Shield,    title:'Secure Payments',         desc:'256-bit SSL, COD option, and zero card data storage. Shop worry-free.',           color:'text-cx-sky',    bg:'bg-cx-sky/8',    border:'border-cx-sky/15' },
  { icon:Truck,     title:'Real-Time Tracking',      desc:'End-to-end visibility with live status emails from order to doorstep.',           color:'text-cx-violet', bg:'bg-cx-violet/8', border:'border-cx-violet/15' },
]

const TESTIMONIALS = [
  { name:'Sarah K.',    role:'Designer',          rating:5, text:'Fastest AI recommendations I\'ve ever seen. Found exactly what I needed in seconds. The checkout is buttery smooth.' },
  { name:'Marcus T.',   role:'Software Engineer', rating:5, text:'Smart pricing is genuinely useful — saw a price drop alert before I even added to cart. COD option was a bonus.' },
  { name:'Priya M.',    role:'Content Creator',   rating:5, text:'The order tracking emails are so detailed with product images. Felt like a premium service throughout.' },
]

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([getFeatured(), getCategories(), getStats()])

  return (
    <div className="page-enter">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"/>
        <div className="absolute top-1/4 -left-40  w-[700px] h-[700px] rounded-full blur-[200px] opacity-25 orb-em   animate-float-slow pointer-events-none"/>
        <div className="absolute bottom-0  right-0  w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 orb-vio  animate-float      pointer-events-none" style={{animationDelay:'-2s'}}/>
        <div className="absolute top-0    right-1/3 w-[400px] h-[400px] rounded-full blur-[140px] opacity-15 orb-gold animate-float-slow pointer-events-none" style={{animationDelay:'-1s'}}/>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cx-emerald/25 mb-8 group hover:border-cx-emerald/50 transition-all">
                <div className="w-2 h-2 rounded-full bg-cx-emerald animate-pulse-soft"/>
                <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">AI-Powered Shopping Experience</span>
                <Sparkles size={11} className="text-cx-emerald opacity-70"/>
              </div>

              <h1 className="font-display font-800 text-6xl sm:text-7xl lg:text-[80px] leading-[1.02] tracking-tight mb-6">
                <span className="text-white">Shop</span>
                <br/>
                <span className="grad-emerald">Smarter.</span>
                <br/>
                <span className="text-white opacity-50">Live Better.</span>
              </h1>

              <p className="text-cx-muted text-[17px] leading-relaxed mb-10 max-w-lg">
                Discover products curated by AI — intelligent recommendations, dynamic pricing, and end-to-end delivery tracking.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="btn-em px-8 py-4 text-[14px] font-700 rounded-2xl flex items-center gap-2.5 group">
                  Explore Products
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link href="/products?featured=true" className="btn-outline-em px-8 py-4 text-[14px] rounded-2xl flex items-center gap-2.5">
                  <Star size={15}/> Featured Picks
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-cx-border/40">
                {[
                  { label:'Orders Delivered', value:`${(stats.orders/1000).toFixed(1)}K+` },
                  { label:'Happy Customers',  value:`${(stats.users/1000).toFixed(0)}K+` },
                  { label:'Products',         value:`${stats.products}+` },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-display font-800 text-2xl grad-emerald num">{s.value}</p>
                    <p className="text-[11px] text-cx-muted font-600 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-[480px] h-[480px]">
                {/* Orbiting rings */}
                <div className="absolute inset-0 rounded-full border border-cx-emerald/8 animate-float-slow"/>
                <div className="absolute inset-8 rounded-full border border-cx-violet/8 animate-float" style={{animationDelay:'-1.5s'}}/>
                <div className="absolute inset-16 rounded-full border border-cx-gold/8 animate-float-slow" style={{animationDelay:'-0.5s'}}/>

                {/* Center glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-52 h-52 rounded-3xl glass border border-cx-emerald/20 flex items-center justify-center shadow-[0_0_80px_rgba(16,217,136,0.15)] animate-glow-pulse">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(16,217,136,0.4)]">
                        <Zap size={28} className="text-cx-bg"/>
                      </div>
                      <p className="font-display font-800 text-xl text-white">CortexCart</p>
                      <p className="text-[10px] text-cx-emerald font-600 uppercase tracking-widest mt-0.5">AI Shopping</p>
                    </div>
                  </div>
                </div>

                {/* Orbiting feature pills */}
                {[
                  { label:'Smart Pricing',     icon:'💰', pos:'top-4 left-4',      delay:'0s' },
                  { label:'AI Picks',          icon:'🧠', pos:'top-4 right-4',     delay:'-1s' },
                  { label:'Live Tracking',     icon:'📦', pos:'bottom-4 left-4',   delay:'-2s' },
                  { label:'Secure Pay',        icon:'🔒', pos:'bottom-4 right-4',  delay:'-3s' },
                ].map(pill => (
                  <div key={pill.label} className={`absolute ${pill.pos} px-3 py-2 glass rounded-xl border border-cx-border flex items-center gap-2 animate-float-slow`} style={{animationDelay:pill.delay}}>
                    <span className="text-sm">{pill.icon}</span>
                    <span className="text-[11px] font-700 text-cx-text whitespace-nowrap">{pill.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ───────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <LiveStats/>
      </Suspense>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-emerald to-cx-sky"/>
                <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-widest">Browse by Category</span>
              </div>
              <h2 className="font-display font-800 text-3xl text-white">Shop Your <span className="grad-emerald">Passion</span></h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-[13px] text-cx-muted hover:text-cx-emerald transition-colors font-600">
              All Categories <ChevronRight size={14}/>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => {
              const Icon   = CATEGORY_ICONS[cat.slug] || Package
              const colors = CATEGORY_COLORS[cat.slug] || 'from-cx-emerald/20 to-cx-emerald/5 border-cx-emerald/20 text-cx-emerald'
              return (
                <Link key={cat.id} href={`/products?category=${cat.slug}`}
                  className={`group p-5 rounded-2xl bg-gradient-to-br ${colors} border transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 duration-300 bg-current/10">
                    <Icon size={22} />
                  </div>
                  <p className="font-700 text-[12px] text-cx-text group-hover:text-white transition-colors">{cat.name}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-gold to-cx-rose"/>
                  <span className="text-[11px] font-700 text-cx-gold uppercase tracking-widest">Editor's Picks</span>
                </div>
                <h2 className="font-display font-800 text-3xl text-white">Featured <span className="grad-gold">Products</span></h2>
              </div>
              <Link href="/products?featured=true" className="hidden sm:flex items-center gap-1.5 text-[13px] text-cx-muted hover:text-cx-gold transition-colors font-600">
                View All <ChevronRight size={14}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map(p => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                  price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                  image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                  stock={p.stock} isFeatured={p.isFeatured} dynamicPrice={p.dynamicPrice}/>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-violet to-cx-sky"/>
              <span className="text-[11px] font-700 text-cx-violet uppercase tracking-widest">Why CortexCart</span>
            </div>
            <h2 className="font-display font-800 text-4xl text-white mb-3">Built for the <span className="grad-violet">Future</span></h2>
            <p className="text-cx-muted max-w-lg mx-auto text-[15px]">Every feature is designed to make your shopping experience faster, smarter, and more enjoyable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className={`p-6 rounded-2xl ${f.bg} border ${f.border} hover:-translate-y-2 transition-all duration-300 group`}>
                <div className={`w-12 h-12 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color}/>
                </div>
                <h3 className="font-700 text-[14px] text-white mb-2">{f.title}</h3>
                <p className="text-[12px] text-cx-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cx-gold to-cx-rose"/>
              <span className="text-[11px] font-700 text-cx-gold uppercase tracking-widest">Customer Love</span>
            </div>
            <h2 className="font-display font-800 text-4xl text-white">What They're <span className="grad-gold">Saying</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 rounded-3xl cx-card-flat hover:-translate-y-2 transition-all duration-300">
                <div className="flex mb-3">{[1,2,3,4,5].map(s => <Star key={s} size={13} className={s<=t.rating?'fill-cx-gold text-cx-gold':'text-cx-border'}/>)}</div>
                <p className="text-[13px] text-cx-muted leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center text-[12px] font-700 text-cx-bg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-700 text-[13px] text-cx-text">{t.name}</p>
                    <p className="text-[11px] text-cx-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl overflow-hidden" style={{background:'linear-gradient(135deg,rgba(16,217,136,0.06) 0%,rgba(139,92,246,0.06) 50%,rgba(245,183,49,0.04) 100%)',border:'1px solid rgba(16,217,136,0.15)'}}>
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"/>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cx-emerald/50 to-transparent"/>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(16,217,136,0.3)]">
                <Zap size={28} className="text-cx-bg"/>
              </div>
              <h2 className="font-display font-800 text-5xl text-white mb-4">Ready to <span className="grad-emerald">Shop Smarter?</span></h2>
              <p className="text-cx-muted text-[16px] mb-8 max-w-lg mx-auto">Join thousands experiencing AI-powered shopping. Free account, instant access.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/register" className="btn-em px-10 py-4 text-[14px] font-700 rounded-2xl flex items-center gap-2 group">
                  Create Free Account <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link href="/products" className="btn-outline-em px-10 py-4 text-[14px] rounded-2xl">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-cx-border/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center">
                  <Zap size={14} className="text-cx-bg"/>
                </div>
                <span className="font-display font-800 text-[16px] text-white">Cortex<span className="grad-emerald">Cart</span></span>
              </Link>
              <p className="text-[12px] text-cx-muted leading-relaxed">AI-powered e-commerce for the next generation. Smart, fast, secure.</p>
            </div>
            {/* Shop */}
            <div>
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-4">Shop</p>
              {['All Products','Electronics','Audio','Wearables','Computing','Photography','Gaming','Deals'].map(l => (
                <Link key={l} href={`/products${l==='All Products'?'':l==='Deals'?'?deals=true':`?category=${l.toLowerCase()}`}`}
                  className="block text-[12px] text-cx-muted hover:text-cx-emerald transition-colors py-1">{l}</Link>
              ))}
            </div>
            {/* Support */}
            <div>
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-4">Support</p>
              {[['Contact','contact'],['Track Order','orders'],['FAQ','contact'],['Shipping','contact'],['Returns','contact']].map(([l,h]) => (
                <Link key={l} href={`/${h}`} className="block text-[12px] text-cx-muted hover:text-cx-emerald transition-colors py-1">{l}</Link>
              ))}
            </div>
            {/* Company */}
            <div>
              <p className="text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-4">Company</p>
              {[['About','contact'],['Careers','contact'],['Blog','contact'],['Privacy','contact'],['Terms','contact']].map(([l,h]) => (
                <Link key={l} href={`/${h}`} className="block text-[12px] text-cx-muted hover:text-cx-emerald transition-colors py-1">{l}</Link>
              ))}
            </div>
          </div>
          <div className="section-divider mb-6"/>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-cx-muted">© 2025 CortexCart Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] text-cx-muted">
              <span className="flex items-center gap-1.5"><Shield size={10} className="text-cx-emerald"/> SSL Secured</span>
              <span>·</span>
              <span>Made with ❤️ for smart shoppers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
