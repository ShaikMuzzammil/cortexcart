export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Zap, Brain, TrendingUp, Shield, Sparkles, ChevronRight, Star, Package, Award, Cpu, Watch, Headphones, Monitor, Camera, Gamepad2, BadgeCheck, Truck, RotateCcw, MessageCircle, Shirt, Dumbbell, Briefcase, Music2, Plane, BookOpen, UtensilsCrossed, PawPrint, Home } from 'lucide-react'

async function getData() {
  const [featured, newArrivals, categories, productCount, orderCount] = await Promise.all([
    prisma.product.findMany({ where:{ isActive:true, isFeatured:true }, include:{ category:true }, take:6, orderBy:{ reviewCount:'desc' } }),
    prisma.product.findMany({ where:{ isActive:true }, include:{ category:true }, take:4, orderBy:{ createdAt:'desc' } }),
    prisma.category.findMany({ take:17, orderBy:{ name:'asc' } }),
    prisma.product.count({ where:{ isActive:true } }),
    prisma.order.count(),
  ])
  return { featured, newArrivals, categories, productCount, orderCount }
}

const FEATURES = [
  { icon:Brain,      title:'AI Recommendations', desc:'Neural engine learns your taste and surfaces perfect products instantly.', color:'text-cx-violet', border:'border-cx-violet/20', bg:'bg-cx-violet/8', glow:'rgba(139,92,246,0.15)' },
  { icon:TrendingUp, title:'Smart Pricing',       desc:'Real-time price optimization based on demand, inventory, and trends.',    color:'text-cx-emerald',border:'border-cx-emerald/20',bg:'bg-cx-emerald/8',glow:'rgba(16,217,136,0.15)' },
  { icon:Sparkles,   title:'Semantic Search',     desc:'Describe what you need in natural language — AI finds the perfect match.',color:'text-cx-gold',  border:'border-cx-gold/20',  bg:'bg-cx-gold/8',  glow:'rgba(245,183,49,0.12)' },
  { icon:Shield,     title:'Secure & Private',    desc:'Military-grade encryption. Your data stays yours — zero sold to third parties.',color:'text-cx-sky',border:'border-cx-sky/20',bg:'bg-cx-sky/8',glow:'rgba(56,189,248,0.12)' },
]

const CAT_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  electronics: { icon:Cpu,             color:'text-cx-sky',     bg:'bg-cx-sky/8' },
  wearables:   { icon:Watch,           color:'text-cx-emerald', bg:'bg-cx-emerald/8' },
  audio:       { icon:Headphones,      color:'text-cx-violet',  bg:'bg-cx-violet/8' },
  computing:   { icon:Monitor,         color:'text-cx-gold',    bg:'bg-cx-gold/8' },
  photography: { icon:Camera,          color:'text-cx-rose',    bg:'bg-cx-rose/8' },
  gaming:      { icon:Gamepad2,        color:'text-cx-emerald', bg:'bg-cx-emerald/8' },
  tech:        { icon:Cpu,             color:'text-cx-sky',     bg:'bg-cx-sky/8' },
  fashion:     { icon:Shirt,           color:'text-cx-rose',    bg:'bg-cx-rose/8' },
  beauty:      { icon:Sparkles,        color:'text-cx-gold',    bg:'bg-cx-gold/8' },
  sports:      { icon:Dumbbell,        color:'text-cx-emerald', bg:'bg-cx-emerald/8' },
  office:      { icon:Briefcase,       color:'text-cx-violet',  bg:'bg-cx-violet/8' },
  music:       { icon:Music2,          color:'text-cx-sky',     bg:'bg-cx-sky/8' },
  travel:      { icon:Plane,           color:'text-cx-gold',    bg:'bg-cx-gold/8' },
  books:       { icon:BookOpen,        color:'text-cx-rose',    bg:'bg-cx-rose/8' },
  kitchen:     { icon:UtensilsCrossed, color:'text-cx-emerald', bg:'bg-cx-emerald/8' },
  pets:        { icon:PawPrint,        color:'text-cx-violet',  bg:'bg-cx-violet/8' },
  home:        { icon:Home,            color:'text-cx-sky',     bg:'bg-cx-sky/8' },
}

const TESTIMONIALS = [
  { name:'Sarah K.',   role:'Creative Director', text:'The AI recommendations are uncanny — found my perfect setup in under 3 minutes. Nothing else comes close.', rating:5, avatar:'SK', color:'from-cx-violet to-cx-rose' },
  { name:'Marcus T.',  role:'Software Engineer', text:'Smart pricing saved me $340 on my laptop. The whole experience feels like shopping from the future.',          rating:5, avatar:'MT', color:'from-cx-emerald to-cx-sky' },
  { name:'Priya M.',   role:'Photographer',      text:'Best camera gear selection anywhere online. Delivered in 24 hours. I tell every photographer I know.',       rating:5, avatar:'PM', color:'from-cx-gold to-cx-rose' },
]

const TRUST = [
  { icon:Truck,          title:'Free Shipping',   desc:'On all orders over $99' },
  { icon:RotateCcw,      title:'30-Day Returns',  desc:'Hassle-free, no questions' },
  { icon:BadgeCheck,     title:'Secure Checkout', desc:'Stripe 256-bit encrypted' },
  { icon:MessageCircle,  title:'24/7 Support',    desc:'AI + human assistance' },
]

export default async function HomePage() {
  const { featured, newArrivals, categories, productCount, orderCount } = await getData()

  return (
    <div className="page-enter overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center justify-center pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[200px]" style={{background:'rgba(139,92,246,0.06)'}}/>
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-float" style={{background:'rgba(16,217,136,0.05)'}}/>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-float-slow" style={{background:'rgba(245,183,49,0.04)'}}/>
          {/* Floating particles */}
          {[...Array(6)].map((_,i) => (
            <div key={i} className="absolute rounded-full animate-float" style={{
              width: `${[3,4,2,5,3,4][i]}px`, height: `${[3,4,2,5,3,4][i]}px`,
              background: ['#10d988','#8b5cf6','#f5b731','#38bdf8','#f43f6e','#10d988'][i],
              top: `${[20,35,60,15,75,45][i]}%`, left: `${[10,80,20,60,40,90][i]}%`,
              animationDelay: `${i * 1.2}s`, opacity: 0.6,
            }}/>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-cx-emerald/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cx-emerald animate-pulse-soft"/>
            <span className="text-[11px] font-700 text-cx-emerald uppercase tracking-[0.15em]">Next-Generation AI Commerce</span>
          </div>

          <h1 className="font-display font-800 text-5xl sm:text-7xl lg:text-[88px] leading-[0.92] tracking-tight mb-6 animate-slide-up">
            <span className="grad-white">The Future of</span><br/>
            <span className="grad-multi">Shopping</span><br/>
            <span className="text-cx-dim text-3xl sm:text-4xl lg:text-5xl font-600 mt-2 block">Powered by Artificial Intelligence</span>
          </h1>

          <p className="text-cx-dim text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{animationDelay:'0.15s'}}>
            Discover products curated for you through real-time AI recommendations, adaptive pricing, and intelligent search — all in one premium experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in" style={{animationDelay:'0.25s'}}>
            <Link href="/products" className="btn-em px-9 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2.5 group">
              <Zap size={17}/> Explore Products
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/auth/register" className="btn-outline-em px-9 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2">
              Create Free Account
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-px bg-cx-border rounded-2xl overflow-hidden border border-cx-border animate-fade-in" style={{animationDelay:'0.35s'}}>
            {[
              { v:`${productCount}+`,                       l:'Products' },
              { v:`${(orderCount * 8).toLocaleString()}+`,  l:'Orders Fulfilled' },
              { v:'4.9/5',                                  l:'Avg Rating' },
              { v:'45+',                                    l:'Countries' },
            ].map(s => (
              <div key={s.l} className="bg-cx-surface px-7 py-4 text-center hover:bg-cx-card transition-colors">
                <div className="font-display font-800 text-xl grad-emerald num">{s.v}</div>
                <div className="text-[11px] text-cx-muted mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <div className="border-y border-cx-border/40 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRUST.map(t => (
              <div key={t.title} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20 flex items-center justify-center flex-shrink-0">
                  <t.icon size={16} className="text-cx-emerald"/>
                </div>
                <div>
                  <p className="text-[12px] font-700 text-cx-text">{t.title}</p>
                  <p className="text-[10px] text-cx-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-gold mb-2 inline-block">Browse</span>
              <h2 className="font-display font-800 text-3xl sm:text-4xl text-white mt-2">Shop by Category</h2>
            </div>
            <Link href="/products" className="btn-outline-em px-5 py-2 text-[13px] rounded-xl hidden sm:flex items-center gap-2">
              All Products <ChevronRight size={13}/>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => {
              const cfg = CAT_CONFIG[cat.slug] || { icon:Package, color:'text-cx-dim', bg:'bg-cx-border/30' }
              const Icon = cfg.icon
              return (
                <Link key={cat.id} href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl cx-card-flat hover:border-cx-emerald/30 hover:bg-cx-emerald/3 transition-all duration-300 text-center hover:-translate-y-1.5">
                  <div className={`w-12 h-12 rounded-2xl ${cfg.bg} border border-current/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={cfg.color}/>
                  </div>
                  <span className="text-[12px] font-700 text-cx-dim group-hover:text-cx-emerald transition-colors">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-16"/>
          <div className="text-center mb-12">
            <span className="badge-em mb-3 inline-block">Platform</span>
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-white mt-3">Why CortexCart?</h2>
            <p className="text-cx-muted text-[15px] max-w-xl mx-auto mt-3">We've reimagined every step of online shopping with AI at the core.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className={`p-6 rounded-2xl ${f.bg} border ${f.border} cx-card group cursor-default`}
                style={{ transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div className={`w-12 h-12 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color}/>
                </div>
                <h3 className="font-display font-700 text-white mb-2 text-[15px]">{f.title}</h3>
                <p className="text-[13px] text-cx-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-rose mb-2 inline-block">Curated</span>
              <h2 className="font-display font-800 text-3xl sm:text-4xl text-white mt-2">Featured Products</h2>
            </div>
            <Link href="/products?featured=true" className="btn-outline-em px-5 py-2 text-[13px] rounded-xl hidden sm:flex items-center gap-2">
              View All <ChevronRight size={13}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(p => (
              <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                stock={p.stock} isFeatured={p.isFeatured} tags={p.tags}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ───────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="section-divider mb-14"/>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="badge-sky mb-2 inline-block">New</span>
                <h2 className="font-display font-800 text-3xl sm:text-4xl text-white mt-2">Just Arrived</h2>
              </div>
              <Link href="/products?sort=newest" className="btn-outline-em px-5 py-2 text-[13px] rounded-xl hidden sm:flex items-center gap-2">
                See All <ChevronRight size={13}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {newArrivals.map(p => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} brand={p.brand}
                  price={p.currentPrice} originalPrice={p.basePrice} comparePrice={p.comparePrice}
                  image={p.images[0]} images={p.images} rating={p.rating} reviewCount={p.reviewCount}
                  stock={p.stock} isFeatured={false} tags={p.tags}/>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── WHY CORTEXCART ────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-cx-surface/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge-em mb-3 inline-block">Why CortexCart?</span>
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-white mt-3 mb-4">
              Shopping, <span className="grad-multi">Reimagined</span>
            </h2>
            <p className="text-cx-dim text-[15px] max-w-2xl mx-auto">
              We combined cutting-edge AI with a curated catalog across 17 categories — 
              so you always find exactly what you need, at the best price.
            </p>
          </div>

          {/* Wave-styled advantage showcase */}
          <div className="relative mb-16 rounded-3xl overflow-hidden border border-cx-border">
            <div className="absolute inset-0 bg-gradient-to-br from-cx-emerald/8 via-cx-bg to-cx-violet/10" />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[100px] bg-cx-emerald/15 animate-pulse-soft" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-[100px] bg-cx-violet/15 animate-pulse-soft" style={{animationDelay:'1.5s'}} />

            {/* Animated wave divider (top) */}
            <svg className="absolute top-0 left-0 w-full opacity-30" viewBox="0 0 1200 60" preserveAspectRatio="none" style={{height:60}}>
              <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,0 L0,0 Z" fill="url(#waveGrad)">
                <animate attributeName="d" dur="8s" repeatCount="indefinite"
                  values="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,0 L0,0 Z;
                          M0,20 C150,0 350,60 600,20 C850,0 1050,60 1200,20 L1200,0 L0,0 Z;
                          M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,0 L0,0 Z"/>
              </path>
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10d988"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>

            <div className="relative px-6 sm:px-10 py-14">
              <div className="text-center mb-10">
                <span className="badge-vio mb-3 inline-block">The CortexCart Advantage</span>
                <h3 className="font-display font-800 text-2xl sm:text-3xl text-white mt-3">
                  Built different — <span className="grad-multi">on purpose</span>
                </h3>
                <p className="text-cx-dim text-[14px] max-w-2xl mx-auto mt-3">
                  Every part of CortexCart was designed around one question: how do we get you to the right product, faster — without the noise, fake reviews, or data-selling that plagues big marketplaces.
                </p>
              </div>

              {/* Animated stat counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                {[
                  { val:'17',    label:'Curated Categories', icon:'🏪', color:'text-cx-emerald' },
                  { val:'158+',  label:'Hand-picked Products', icon:'📦', color:'text-cx-violet' },
                  { val:'<1s',   label:'AI Match Speed', icon:'⚡', color:'text-cx-sky' },
                  { val:'0',     label:'Data Sold, Ever', icon:'🔒', color:'text-cx-gold' },
                ].map((s, i) => (
                  <div key={s.label} className="text-center p-5 rounded-2xl glass border border-cx-border/60 hover:-translate-y-1 transition-transform duration-300"
                    style={{animationDelay:`${i*0.1}s`}}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className={`font-display font-900 text-3xl ${s.color}`}>{s.val}</div>
                    <div className="text-[11px] text-cx-muted uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Wave-flow advantage timeline */}
              <div className="relative">
                <div className="hidden sm:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cx-border to-transparent" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  {[
                    { step:'01', title:'Tell the AI what you need', desc:'Natural language search — no filters required', icon:Brain,
                      iconWrap:'bg-cx-violet/10 border-cx-violet/30', iconColor:'text-cx-violet', stepColor:'text-cx-violet' },
                    { step:'02', title:'Instant neural matching', desc:'Our engine scans the live catalog in real time', icon:Sparkles,
                      iconWrap:'bg-cx-emerald/10 border-cx-emerald/30', iconColor:'text-cx-emerald', stepColor:'text-cx-emerald' },
                    { step:'03', title:'Transparent, verified results', desc:'Real stock, real prices, real reviews only', icon:BadgeCheck,
                      iconWrap:'bg-cx-sky/10 border-cx-sky/30', iconColor:'text-cx-sky', stepColor:'text-cx-sky' },
                    { step:'04', title:'Track every step home', desc:'Live order timeline from checkout to doorstep', icon:Truck,
                      iconWrap:'bg-cx-gold/10 border-cx-gold/30', iconColor:'text-cx-gold', stepColor:'text-cx-gold' },
                  ].map(item => (
                    <div key={item.step} className="relative text-center sm:text-left">
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto sm:mx-0 mb-3 relative z-10 bg-cx-bg ${item.iconWrap}`}>
                        <item.icon size={22} className={item.iconColor} />
                      </div>
                      <span className={`text-[11px] font-800 tracking-widest ${item.stepColor}`}>STEP {item.step}</span>
                      <h4 className="text-[14px] font-700 text-white mt-1 mb-1">{item.title}</h4>
                      <p className="text-[12px] text-cx-muted leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Animated wave divider (bottom) */}
            <svg className="absolute bottom-0 left-0 w-full opacity-20 rotate-180" viewBox="0 0 1200 60" preserveAspectRatio="none" style={{height:60}}>
              <path d="M0,30 C150,0 350,60 600,30 C850,0 1050,60 1200,30 L1200,60 L0,60 Z" fill="url(#waveGrad)">
                <animate attributeName="d" dur="10s" repeatCount="indefinite"
                  values="M0,30 C150,0 350,60 600,30 C850,0 1050,60 1200,30 L1200,60 L0,60 Z;
                          M0,20 C150,60 350,0 600,20 C850,60 1050,0 1200,20 L1200,60 L0,60 Z;
                          M0,30 C150,0 350,60 600,30 C850,0 1050,60 1200,30 L1200,60 L0,60 Z"/>
              </path>
            </svg>
          </div>

          {/* Key advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title:'AI-Powered Discovery', icon:'🧠', color:'border-cx-violet/20 bg-cx-violet/4', textColor:'text-cx-violet',
                desc:'Our neural recommendation engine learns from your browsing and instantly surfaces products you\'ll love — not just what\'s trending.' },
              { title:'Batch Search', icon:'📦', color:'border-cx-sky/20 bg-cx-sky/4', textColor:'text-cx-sky',
                desc:'Upload a CSV or TXT with multiple product queries. Our AI processes all of them at once and returns curated matches — perfect for bulk purchasing.' },
              { title:'Live Order Tracking', icon:'🚚', color:'border-cx-emerald/20 bg-cx-emerald/4', textColor:'text-cx-emerald',
                desc:'Track any order with a 5-step visual timeline. From placement to delivery — every status update is pushed in real-time.' },
              { title:'Verified Reviews Only', icon:'✅', color:'border-cx-gold/20 bg-cx-gold/4', textColor:'text-cx-gold',
                desc:'Every review is linked to a verified purchase. No fake reviews, no paid rankings — just genuine feedback from real buyers.' },
              { title:'17 Curated Categories', icon:'🏪', color:'border-cx-rose/20 bg-cx-rose/4', textColor:'text-cx-rose',
                desc:'From Audio to Pets, Computing to Kitchen — 158+ hand-curated products across 17 distinct categories, each with expert-picked recommendations.' },
              { title:'Privacy First', icon:'🔒', color:'border-cx-sky/20 bg-cx-sky/4', textColor:'text-cx-sky',
                desc:'We never sell your data to advertisers. Your shopping history, preferences, and personal info stay completely private and secure.' },
            ].map(adv => (
              <div key={adv.title} className={`p-6 rounded-2xl border ${adv.color} hover:scale-[1.02] transition-all duration-200`}>
                <div className="text-3xl mb-4">{adv.icon}</div>
                <h3 className={`text-[15px] font-800 ${adv.textColor} mb-2`}>{adv.title}</h3>
                <p className="text-[13px] text-cx-muted leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BATCH PREVIEW SECTION ─────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-cx-sky/20 p-8 sm:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-cx-sky/5 via-cx-bg to-cx-violet/8"/>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]" style={{background:'rgba(56,189,248,0.08)'}}/>
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="badge-sky mb-4 inline-block">New Feature</span>
                <h2 className="font-display font-800 text-3xl sm:text-4xl text-white mb-4">
                  Batch Recommendations
                </h2>
                <p className="text-cx-dim text-[15px] leading-relaxed mb-6">
                  Need to find 10 products at once? Upload a CSV or TXT file with your queries, and our AI finds the best 
                  match from our catalog for each one — with links to buy instantly.
                </p>
                <div className="space-y-3 mb-8">
                  {['Upload CSV or TXT with product queries (up to 20)','AI matches each query to real products in our catalog','Export results as CSV — with prices, ratings, and buy links'].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cx-sky/15 border border-cx-sky/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cx-sky text-[10px] font-800">✓</span>
                      </div>
                      <span className="text-[13px] text-cx-dim">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/batch" className="inline-flex items-center gap-2 bg-gradient-to-r from-cx-sky to-cx-violet text-white font-800 text-[14px] px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity">
                  <Sparkles size={15}/> Try Batch Recommendations →
                </Link>
              </div>
              <div className="bg-cx-surface border border-cx-border rounded-2xl p-4 font-mono text-[12px]">
                <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-cx-border">
                  {['bg-cx-rose/60','bg-cx-gold/60','bg-cx-emerald/60'].map((c,i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`}/>)}
                  <span className="text-cx-muted text-[10px] ml-2">batch-queries.txt</span>
                </div>
                <div className="space-y-1 text-cx-dim mb-4">
                  {['gaming mouse wireless','mechanical keyboard rgb','27 inch monitor 144hz','gaming headset anc','desk lamp led'].map(line => (
                    <p key={line} className="text-cx-dim">{line}</p>
                  ))}
                </div>
                <div className="border-t border-cx-border pt-3 space-y-1.5">
                  {[
                    {q:'gaming mouse',n:'VortexShot Gaming Mouse',p:'$69'},
                    {q:'keyboard rgb',n:'LunaKey RGB 75%',p:'$169'},
                    {q:'27" monitor',n:'MonitorX 27" 280Hz',p:'$449'},
                  ].map(r => (
                    <div key={r.q} className="flex items-center gap-2">
                      <span className="text-cx-emerald">✦</span>
                      <span className="text-cx-dim">{r.q} →</span>
                      <span className="text-cx-text font-600">{r.n}</span>
                      <span className="ml-auto text-cx-emerald font-700">{r.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-vio mb-3 inline-block">Community</span>
            <h2 className="font-display font-800 text-4xl text-white mt-3">Loved by Thousands</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-cx-gold text-cx-gold"/>)}
              <span className="text-cx-muted text-[13px] ml-2">4.9 average from 50,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl cx-card-flat hover:border-cx-emerald/20 transition-all">
                <div className="flex mb-4">{[1,2,3,4,5].map(s => <Star key={s} size={13} className="fill-cx-gold text-cx-gold"/>)}</div>
                <p className="text-cx-dim text-[13px] leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-[12px] font-700 text-white`}>{t.avatar}</div>
                  <div><p className="text-[13px] font-700 text-cx-text">{t.name}</p><p className="text-[11px] text-cx-muted">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-cx-emerald/20 p-12 sm:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cx-emerald/6 via-cx-bg to-cx-violet/8"/>
            <div className="absolute top-0 left-0 w-72 h-72 orb-em rounded-full blur-[100px] opacity-60"/>
            <div className="absolute bottom-0 right-0 w-56 h-56 orb-vio rounded-full blur-[80px] opacity-40"/>
            <div className="relative">
              <Award size={44} className="text-cx-gold mx-auto mb-5"/>
              <h2 className="font-display font-900 text-4xl sm:text-5xl text-white mb-4 leading-tight">
                Ready to Shop<br/>the Smart Way?
              </h2>
              <p className="text-cx-dim text-lg max-w-lg mx-auto mb-8">
                Join 50,000+ customers using AI to find exactly what they need, at the right price.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-em px-10 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2.5 group">
                  <Brain size={18}/> Get Started Free
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link href="/products" className="btn-outline-em px-10 py-4 text-[15px] rounded-2xl inline-flex items-center gap-2">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="border-t border-cx-border/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_12px_rgba(16,217,136,0.3)]"><Zap size={14} className="text-cx-bg"/></div>
                <span className="font-display font-800 text-lg text-white">Cortex<span className="grad-emerald">Cart</span></span>
              </div>
              <p className="text-[12px] text-cx-muted leading-relaxed">AI-powered commerce for the modern shopper. Smart, fast, personalized.</p>
            </div>
            {[
              { h:'Shop',    links:[['All Products','/products'],['Audio','/products?category=audio'],['Computing','/products?category=computing'],['Wearables','/products?category=wearables'],['Gaming','/products?category=gaming']] },
              { h:'Company', links:[['About','/about'],['Blog','/blog'],['Careers','/careers'],['Contact','/contact']] },
              { h:'Support', links:[['FAQ','/faq'],['Shipping','/shipping'],['Returns','/returns'],['Track Order','/orders'],['Privacy','/privacy']] },
            ].map(col => (
              <div key={col.h}>
                <h4 className="text-[11px] font-700 text-cx-text uppercase tracking-widest mb-4">{col.h}</h4>
                <ul className="space-y-2.5">{col.links.map(([l,h]) => <li key={l}><Link href={h} className="text-[12px] text-cx-muted hover:text-cx-emerald transition-colors">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="section-divider mb-8"/>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-cx-muted">
            <span>© {new Date().getFullYear()} CortexCart Inc. All rights reserved.</span>
            <span className="flex items-center gap-1">Powered by <span className="grad-emerald font-700 ml-1">Cortex AI Engine v4.0</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
