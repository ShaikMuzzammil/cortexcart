'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User, LogOut, Package, Bell, Home, Cpu, Gamepad2, Watch, Monitor, Camera, Headphones, Sparkles, LayoutGrid, Truck, Tag } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { ClientOnly }       from '@/components/ClientOnly'
import { NotificationBell } from '@/components/NotificationBell'
import { cn, initials }     from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { label:'Tech',    href:'/products?category=tech',    icon:Cpu,        color:'text-cx-sky'     },
  { label:'Gaming',  href:'/products?category=gaming',  icon:Gamepad2,   color:'text-cx-violet'  },
  { label:'Home',    href:'/products?category=home',    icon:Monitor,    color:'text-cx-emerald' },
  { label:'Fashion', href:'/products?category=fashion', icon:Watch,      color:'text-cx-gold'    },
  { label:'Sports',  href:'/products?category=sports',  icon:Camera,     color:'text-cx-rose'    },
  { label:'Music',   href:'/products?category=music',   icon:Headphones, color:'text-cx-sky'     },
  { label:'Office',  href:'/products?category=office',  icon:Cpu,        color:'text-cx-dim'     },
  { label:'Travel',  href:'/products?category=travel',  icon:Camera,     color:'text-cx-emerald' },
  { label:'Kitchen', href:'/products?category=kitchen', icon:Monitor,    color:'text-cx-gold'    },
  { label:'Books',   href:'/products?category=books',   icon:Package,    color:'text-cx-violet'  },
]

const NAV_LINKS = [
  { label:'Home',     href:'/' },
  { label:'Shop',     href:'/products', hasDrop:true },
  { label:'Featured', href:'/products?featured=true' },
  { label:'Deals',    href:'/products?deals=true' },
  { label:'AI Picks', href:'/recommendations' },
  { label:'Batch',    href:'/batch' },
  { label:'Contact',  href:'/contact' },
]

const ANNOUNCEMENT_VERSION = 'v5'

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()
  const [scrolled,     setScrolled]    = useState(false)
  const [mobileOpen,   setMobileOpen]  = useState(false)
  const [searchOpen,   setSearchOpen]  = useState(false)
  const [searchQ,      setSearchQ]     = useState('')
  const [shopDrop,     setShopDrop]    = useState(false)
  const [userMenu,     setUserMenu]    = useState(false)
  const [barDismissed, setBarDismissed]= useState(false)
  const [searchResults,setSearchResults]=useState<any[]>([])
  const [searchLoading,setSearchLoading]=useState(false)
  const searchRef  = useRef<HTMLDivElement>(null)
  const debounceRef= useRef<NodeJS.Timeout>()

  useEffect(() => {
    const dismissed = localStorage.getItem(`cx-bar-dismissed-${ANNOUNCEMENT_VERSION}`)
    if (dismissed) setBarDismissed(true)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false); setSearchOpen(false); setUserMenu(false); setShopDrop(false)
  }, [pathname])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); setShopDrop(false); setUserMenu(false) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const liveSearch = (q: string) => {
    setSearchQ(q)
    if (!q.trim()) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`)
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch {}
      setSearchLoading(false)
    }, 280)
  }

  const cartCount    = useCartStore(s => s.items.reduce((a,i) => a+i.quantity, 0))
  const wishlistCount= useWishlistStore(s => s.items.length)
  const isActive     = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0] as string)

  const grabCoupon = (code: string) => {
    const cart = useCartStore.getState()
    if (cart.items.length > 0) {
      const result = cart.applyCoupon(code)
      if (result.success) {
        toast.success(`🎉 ${code} applied — ${result.message}`)
        cart.setCartOpen(true)
      } else {
        toast.error(result.message)
      }
    } else {
      navigator.clipboard?.writeText(code).catch(() => {})
      toast.success(`📋 Code "${code}" copied! Add items to your cart, then paste it at checkout.`)
    }
  }

  return (
    <>
      {/* Announcement bar — live coupon promo */}
      {!barDismissed && (
        <div className="relative z-50 bg-gradient-to-r from-cx-emerald/90 via-cx-violet/80 to-cx-sky/90 text-cx-bg text-[11px] font-700 py-2 px-10 sm:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Truck size={12}/> Free shipping on orders over $99
            </span>
            <span className="opacity-50 hidden sm:inline">·</span>
            <span className="hidden sm:inline opacity-80">Use code</span>
            <button onClick={() => grabCoupon('CORTEX10')} title="Click to apply or copy"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cx-bg/15 hover:bg-cx-bg/25 font-800 tracking-wide transition-colors cursor-pointer">
              <Tag size={10}/> CORTEX10 <span className="opacity-80 font-600">— 10% off</span>
            </button>
            <span className="opacity-50">·</span>
            <button onClick={() => grabCoupon('FIRST15')} title="Click to apply or copy"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cx-bg/15 hover:bg-cx-bg/25 font-800 tracking-wide transition-colors cursor-pointer">
              <Tag size={10}/> FIRST15 <span className="opacity-80 font-600 hidden sm:inline">— 15% off your first order</span><span className="opacity-80 font-600 sm:hidden">— 15% off</span>
            </button>
          </div>
          <button onClick={() => { localStorage.setItem(`cx-bar-dismissed-${ANNOUNCEMENT_VERSION}`,'1'); setBarDismissed(true) }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"><X size={13}/></button>
        </div>
      )}

      <header className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled ? 'bg-cx-bg/95 backdrop-blur-xl border-b border-cx-border/50 shadow-[0_4px_24px_rgba(0,0,0,0.3)]' : 'bg-cx-bg/80 backdrop-blur-md',
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_14px_rgba(16,217,136,0.35)]">
                <Zap size={14} className="text-cx-bg"/>
              </div>
              <span className="font-display font-800 text-lg text-white hidden sm:block">
                Cortex<span className="grad-emerald">Cart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_LINKS.map(link => (
                <div key={link.label} className="relative"
                  onMouseEnter={() => link.hasDrop && setShopDrop(true)}
                  onMouseLeave={() => link.hasDrop && setShopDrop(false)}>
                  <Link href={link.href}
                    className={cn('flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-600 transition-all duration-200',
                      isActive(link.href) ? 'text-cx-emerald bg-cx-emerald/8' : 'text-cx-dim hover:text-cx-text hover:bg-cx-card',
                      link.label === 'AI Picks' && 'text-cx-violet border border-cx-violet/20 bg-cx-violet/5 hover:bg-cx-violet/10',
                      link.label === 'Batch' && 'text-cx-sky border border-cx-sky/20 bg-cx-sky/5 hover:bg-cx-sky/10',
                    )}>
                    {link.label === 'AI Picks' && <Sparkles size={11}/>}
                    {link.label === 'Batch' && <LayoutGrid size={11}/>}
                    {link.label}
                    {link.hasDrop && <ChevronDown size={11} className={cn('transition-transform', shopDrop && 'rotate-180')}/>}
                  </Link>

                  {/* Shop dropdown */}
                  {link.hasDrop && (
                    <AnimatePresence>
                      {shopDrop && (
                        <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                          className="absolute top-full left-0 pt-2 w-72" style={{ zIndex:60 }}>
                          <div className="bg-cx-surface border border-cx-border rounded-2xl p-3 shadow-2xl">
                            <div className="grid grid-cols-2 gap-1.5">
                              {CATEGORIES.map(cat => (
                                <Link key={cat.label} href={cat.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cx-card transition-all group">
                                  <cat.icon size={13} className={cat.color}/>
                                  <span className="text-[12px] font-600 text-cx-dim group-hover:text-cx-text">{cat.label}</span>
                                </Link>
                              ))}
                              <Link href="/products" className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cx-emerald/8 border border-cx-emerald/15 hover:bg-cx-emerald/12 transition-all">
                                <span className="text-[12px] font-700 text-cx-emerald">View All Products →</span>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button onClick={() => setSearchOpen(!searchOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-card transition-all text-[13px]">
                  <Search size={16}/>
                  <span className="hidden md:block text-[12px]">Search</span>
                  <kbd className="hidden md:block text-[10px] px-1.5 py-0.5 rounded bg-cx-border font-mono">⌘K</kbd>
                </button>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6, scale:0.97 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-cx-surface border border-cx-border rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex:60 }}>
                      <div className="p-3 border-b border-cx-border">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted"/>
                          <input autoFocus value={searchQ} onChange={e => liveSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && searchQ.trim()) { router.push(`/products?q=${encodeURIComponent(searchQ)}`); setSearchOpen(false) }}}
                            placeholder="Search products…" className="cx-input w-full pl-9 pr-4 py-2.5 text-[13px]"/>
                        </div>
                      </div>
                      {searchLoading && <div className="p-3 text-center text-cx-muted text-[12px]"><Loader2/></div>}
                      {searchResults.length > 0 && (
                        <div className="p-2">
                          {searchResults.map((p: any) => (
                            <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-cx-card transition-all">
                              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover"/>}
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-700 text-cx-text truncate">{p.name}</p>
                                <p className="text-[11px] text-cx-emerald font-700">${p.currentPrice}</p>
                              </div>
                            </Link>
                          ))}
                          <Link href={`/products?q=${encodeURIComponent(searchQ)}`} onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-center gap-1.5 py-2 text-[12px] text-cx-violet hover:text-cx-violet/80">
                            See all results →
                          </Link>
                        </div>
                      )}
                      {searchQ && !searchLoading && searchResults.length === 0 && (
                        <div className="p-4 text-center text-cx-muted text-[12px]">No results for "{searchQ}"</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ClientOnly>
                <NotificationBell/>
                <Link href="/wishlist" className="relative p-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-card transition-all">
                  <Heart size={18}/>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-cx-rose text-white text-[9px] font-800 flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                <button onClick={() => useCartStore.getState().setCartOpen(true)}
                  className="relative p-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-card transition-all">
                  <ShoppingCart size={18}/>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-cx-emerald text-cx-bg text-[9px] font-800 flex items-center justify-center">{cartCount}</span>
                  )}
                </button>
              </ClientOnly>

              {/* User menu */}
              <div className="relative">
                {session?.user ? (
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-cx-card transition-all">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center text-[11px] font-800 text-cx-bg">
                      {initials(session.user.name || session.user.email || 'U')}
                    </div>
                    <ChevronDown size={11} className={cn('text-cx-muted transition-transform', userMenu && 'rotate-180')}/>
                  </button>
                ) : (
                  <Link href="/auth/login" className="btn-em px-4 py-2 text-[13px] rounded-xl flex items-center gap-2">
                    <User size={14}/> Sign In
                  </Link>
                )}
                <AnimatePresence>
                  {userMenu && session?.user && (
                    <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6, scale:0.97 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-cx-surface border border-cx-border rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex:60 }}>
                      <div className="p-3 border-b border-cx-border">
                        <p className="text-[13px] font-700 text-cx-text truncate">{session.user.name || 'User'}</p>
                        <p className="text-[11px] text-cx-muted truncate">{session.user.email}</p>
                      </div>
                      <div className="p-2">
                        {[
                          { href:'/account', icon:User, label:'My Account' },
                          { href:'/orders', icon:Package, label:'My Orders' },
                          { href:'/wishlist', icon:Heart, label:'Wishlist' },
                        ].map(item => (
                          <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cx-card transition-all">
                            <item.icon size={14} className="text-cx-muted"/>
                            <span className="text-[13px] text-cx-dim">{item.label}</span>
                          </Link>
                        ))}
                        <button onClick={() => signOut({ callbackUrl:'/' })}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cx-rose/10 transition-all mt-1">
                          <LogOut size={14} className="text-cx-rose"/>
                          <span className="text-[13px] text-cx-rose">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu toggle */}
              <button className="lg:hidden p-2 rounded-xl text-cx-dim hover:bg-cx-card" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              className="lg:hidden border-t border-cx-border/50 bg-cx-surface overflow-hidden">
              <div className="p-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.label} href={link.href}
                    className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-600 transition-all',
                      isActive(link.href) ? 'bg-cx-emerald/10 text-cx-emerald' : 'text-cx-dim hover:bg-cx-card hover:text-cx-text')}>
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-cx-border mt-3">
                  {session?.user ? (
                    <div>
                      <p className="px-4 py-2 text-[12px] text-cx-muted">{session.user.email}</p>
                      <button onClick={() => signOut({ callbackUrl:'/' })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cx-rose hover:bg-cx-rose/10 text-[14px] font-600">
                        <LogOut size={15}/> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link href="/auth/login" className="btn-em w-full py-3 text-[14px] rounded-xl flex items-center justify-center gap-2">
                      <User size={15}/> Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function Loader2({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
