'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User, LogOut, Settings, Package, LayoutDashboard, Cpu, Watch, Headphones, Monitor, Camera, Gamepad2, Bell, Home, Store, Tag, Mail } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { ClientOnly }       from '@/components/ClientOnly'
import { NotificationBell } from '@/components/NotificationBell'
import { cn, initials }     from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { label: 'Electronics',  href: '/products?category=electronics', icon: Cpu,        color: 'text-cx-sky' },
  { label: 'Wearables',    href: '/products?category=wearables',   icon: Watch,      color: 'text-cx-emerald' },
  { label: 'Audio',        href: '/products?category=audio',       icon: Headphones, color: 'text-cx-violet' },
  { label: 'Computing',    href: '/products?category=computing',   icon: Monitor,    color: 'text-cx-gold' },
  { label: 'Photography',  href: '/products?category=photography', icon: Camera,     color: 'text-cx-rose' },
  { label: 'Gaming',       href: '/products?category=gaming',      icon: Gamepad2,   color: 'text-cx-emerald' },
]

const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Shop',     href: '/products', hasDrop: true },
  { label: 'Featured', href: '/products?featured=true' },
  { label: 'Deals',    href: '/products?deals=true' },
  { label: 'Contact',  href: '/contact' },
]

const ANNOUNCEMENT_VERSION = 'v3'

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQ,     setSearchQ]     = useState('')
  const [shopDrop,    setShopDrop]    = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [barDismissed,setBarDismissed]= useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const dismissed = localStorage.getItem(`cx-bar-dismissed-${ANNOUNCEMENT_VERSION}`)
    if (dismissed) setBarDismissed(true)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false); setSearchOpen(false); setUserMenu(false); setShopDrop(false)
  }, [pathname])

  // Keyboard shortcut Cmd+K for search
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); setShopDrop(false); setUserMenu(false) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Live search
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}&limit=5`)
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch {}
      setSearchLoading(false)
    }, 280)
  }, [searchQ])

  const totalItems = useCartStore(s => s.totalItems())
  const wishCount  = useWishlistStore(s => s.items.length)
  const toggleCart = useCartStore(s => s.toggleCart)

  const isActive = (href: string, hasDrop?: boolean) => {
    if (href === '/') return pathname === '/'
    if (hasDrop) {
      return pathname.startsWith('/products') && !pathname.includes('/compare')
    }
    if (href.includes('featured=true')) return pathname === '/products' && typeof window !== 'undefined' && window.location.search.includes('featured=true')
    if (href.includes('deals=true')) return pathname === '/products' && typeof window !== 'undefined' && window.location.search.includes('deals=true')
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.trim()) { router.push(`/products?q=${encodeURIComponent(searchQ.trim())}`); setSearchOpen(false); setSearchQ('') }
  }

  const dismissBar = () => {
    setBarDismissed(true)
    localStorage.setItem(`cx-bar-dismissed-${ANNOUNCEMENT_VERSION}`, '1')
  }

  return (
    <>
      {/* Announcement Bar */}
      <AnimatePresence>
        {!barDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden border-b border-cx-emerald/10 z-50"
            style={{ background: 'linear-gradient(90deg, rgba(16,217,136,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(245,183,49,0.06) 100%)' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-[12px] font-600 text-cx-text overflow-hidden">
                <Zap size={12} className="text-cx-emerald flex-shrink-0 animate-pulse" />
                <div className="whitespace-nowrap">
                  🔥 <span className="text-cx-emerald">Free shipping</span> on orders over $99 &nbsp;·&nbsp; Use code{' '}
                  <span className="text-cx-gold font-800 bg-cx-gold/10 px-1.5 py-0.5 rounded border border-cx-gold/20">CORTEX10</span>
                  {' '}for 10% off &nbsp;·&nbsp; <span className="text-cx-violet">FIRST15</span> for 15% off your first order
                </div>
              </div>
              <button onClick={dismissBar} className="flex-shrink-0 p-0.5 hover:bg-cx-surface/60 rounded">
                <X size={12} className="text-cx-dim" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={cn('sticky top-0 z-50 transition-all duration-500', scrolled ? 'glass-dark shadow-[0_4px_40px_rgba(0,0,0,0.5)]' : 'bg-transparent')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group mr-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_16px_rgba(16,217,136,0.3)] group-hover:shadow-[0_0_28px_rgba(16,217,136,0.55)] transition-all">
                <Zap size={15} className="text-cx-bg" />
              </div>
              <span className="font-display font-800 text-[17px] text-white hidden sm:block tracking-tight">
                Cortex<span className="grad-emerald">Cart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {NAV_LINKS.map(link => (
                <div key={link.href} className="relative"
                  onMouseEnter={() => link.hasDrop && setShopDrop(true)}
                  onMouseLeave={() => link.hasDrop && setShopDrop(false)}
                >
                  <Link href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-600 transition-all duration-200 relative',
                      isActive(link.href, link.hasDrop)
                        ? 'text-cx-emerald bg-cx-emerald/10'
                        : 'text-cx-dim hover:text-cx-text hover:bg-cx-surface/60'
                    )}
                  >
                    {link.label}
                    {link.hasDrop && <ChevronDown size={12} className={cn('transition-transform', shopDrop && 'rotate-180')} />}
                    {isActive(link.href, link.hasDrop) && (
                      <motion.span layoutId="nav-indicator"
                        className="absolute bottom-1 left-3 right-3 h-0.5 bg-cx-emerald rounded-full"
                      />
                    )}
                  </Link>

                  {/* Shop Dropdown */}
                  {link.hasDrop && (
                    <AnimatePresence>
                      {shopDrop && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-64 glass-dark border border-cx-border rounded-2xl shadow-2xl p-3 z-50"
                        >
                          <Link href="/products"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-cx-emerald/10 transition-colors group mb-1">
                            <Zap size={14} className="text-cx-emerald" />
                            <div>
                              <p className="text-[13px] font-700 text-white">All Products</p>
                              <p className="text-[11px] text-cx-muted">Browse entire catalog</p>
                            </div>
                          </Link>
                          <div className="border-t border-cx-border my-2" />
                          <p className="text-[10px] font-700 text-cx-muted uppercase tracking-widest px-3 mb-1">Categories</p>
                          <div className="grid grid-cols-2 gap-1">
                            {CATEGORIES.map(cat => {
                              const Icon = cat.icon
                              return (
                                <Link key={cat.href} href={cat.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cx-surface/60 transition-colors group">
                                  <Icon size={13} className={cat.color} />
                                  <span className="text-[12px] font-600 text-cx-dim group-hover:text-cx-text transition-colors">{cat.label}</span>
                                </Link>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button onClick={() => setSearchOpen(!searchOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-surface/60 transition-all text-[12px] font-600 hidden sm:flex">
                  <Search size={15} />
                  <span className="hidden lg:block">Search...</span>
                  <span className="hidden lg:block text-[10px] text-cx-muted bg-cx-surface border border-cx-border rounded px-1.5 py-0.5">⌘K</span>
                </button>
                <button onClick={() => setSearchOpen(!searchOpen)}
                  className="sm:hidden p-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-surface/60 transition-all">
                  <Search size={18} />
                </button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      className="absolute right-0 top-full mt-2 w-80 glass-dark border border-cx-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <form onSubmit={handleSearch} className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted" />
                        <input
                          autoFocus
                          value={searchQ}
                          onChange={e => setSearchQ(e.target.value)}
                          placeholder="Search products..."
                          className="w-full bg-transparent pl-10 pr-4 py-3.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none border-b border-cx-border"
                        />
                      </form>
                      {searchResults.length > 0 && (
                        <div className="py-2 max-h-64 overflow-y-auto">
                          {searchResults.map((p: any) => (
                            <Link key={p.id} href={`/products/${p.slug}`}
                              onClick={() => { setSearchOpen(false); setSearchQ('') }}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-cx-surface/60 transition-colors">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-cx-surface flex-shrink-0">
                                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-600 text-cx-text truncate">{p.name}</p>
                                <p className="text-[11px] text-cx-emerald font-700">${p.currentPrice}</p>
                              </div>
                            </Link>
                          ))}
                          <div className="px-4 py-2 border-t border-cx-border">
                            <button onClick={handleSearch} className="text-[12px] text-cx-emerald font-600">
                              See all results for &quot;{searchQ}&quot; →
                            </button>
                          </div>
                        </div>
                      )}
                      {searchQ && searchResults.length === 0 && !searchLoading && (
                        <div className="px-4 py-4 text-center text-[12px] text-cx-muted">No results for &quot;{searchQ}&quot;</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <ClientOnly>
                <NotificationBell />
              </ClientOnly>

              {/* Wishlist */}
              <ClientOnly>
                <Link href="/wishlist" className="relative p-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-surface/60 transition-all">
                  <Heart size={18} />
                  {wishCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-cx-rose text-white text-[10px] font-800 rounded-full flex items-center justify-center">
                      {wishCount}
                    </span>
                  )}
                </Link>
              </ClientOnly>

              {/* Cart */}
              <ClientOnly>
                <button onClick={toggleCart}
                  className="relative p-2 rounded-xl text-cx-dim hover:text-cx-text hover:bg-cx-surface/60 transition-all">
                  <ShoppingCart size={18} />
                  {totalItems > 0 && (
                    <motion.span key={totalItems}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-cx-emerald text-cx-bg text-[10px] font-800 rounded-full flex items-center justify-center">
                      {totalItems}
                    </motion.span>
                  )}
                </button>
              </ClientOnly>

              {/* User menu */}
              <div className="relative">
                {session ? (
                  <>
                    <button onClick={() => setUserMenu(!userMenu)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-cx-surface/60 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cx-emerald to-cx-violet flex items-center justify-center text-[11px] font-800 text-white">
                        {initials(session.user?.name || session.user?.email || 'U')}
                      </div>
                      <ChevronDown size={12} className={cn('text-cx-dim transition-transform hidden sm:block', userMenu && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {userMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          className="absolute right-0 top-full mt-2 w-52 glass-dark border border-cx-border rounded-2xl shadow-2xl p-2 z-50"
                        >
                          <div className="px-3 py-2 mb-1 border-b border-cx-border">
                            <p className="text-[13px] font-700 text-white truncate">{session.user?.name || 'User'}</p>
                            <p className="text-[11px] text-cx-muted truncate">{session.user?.email}</p>
                          </div>
                          {[
                            { label: 'Account',   href: '/account',   icon: User },
                            { label: 'Orders',    href: '/orders',    icon: Package },
                            { label: 'Track Order', href: '/track',   icon: Package },
                            ...(((session.user as any)?.role === 'ADMIN') ? [{ label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard }] : []),
                          ].map(item => (
                            <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cx-surface/60 transition-colors group">
                              <item.icon size={14} className="text-cx-dim group-hover:text-cx-emerald transition-colors" />
                              <span className="text-[13px] font-600 text-cx-dim group-hover:text-cx-text transition-colors">{item.label}</span>
                            </Link>
                          ))}
                          <div className="border-t border-cx-border mt-1 pt-1">
                            <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cx-rose/10 transition-colors group">
                              <LogOut size={14} className="text-cx-dim group-hover:text-cx-rose transition-colors" />
                              <span className="text-[13px] font-600 text-cx-dim group-hover:text-cx-rose transition-colors">Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href="/auth/login" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cx-emerald/10 hover:bg-cx-emerald/20 border border-cx-emerald/20 text-cx-emerald text-[12px] font-700 transition-all">
                    <User size={14} /> Sign In
                  </Link>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-cx-surface/60 transition-all ml-1">
                {mobileOpen ? <X size={18} className="text-cx-text" /> : <Menu size={18} className="text-cx-dim" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-cx-border overflow-hidden"
              >
                <nav className="py-3 space-y-1">
                  {NAV_LINKS.map(link => (
                    <Link key={link.href} href={link.href}
                      className={cn('flex items-center px-4 py-3 rounded-xl text-[14px] font-600 transition-all mx-1',
                        isActive(link.href, link.hasDrop)
                          ? 'text-cx-emerald bg-cx-emerald/10'
                          : 'text-cx-dim hover:text-cx-text hover:bg-cx-surface/60'
                      )}>
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-cx-border pt-3 mt-2 px-1">
                    <form onSubmit={handleSearch} className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted" />
                      <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products..."
                        className="w-full bg-cx-surface border border-cx-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-cx-text placeholder:text-cx-muted outline-none" />
                    </form>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 glass-dark border-t border-cx-border">
          <div className="flex items-center justify-around py-2 px-2">
            {[
              { href:'/', icon: Home, label:'Home' },
              { href:'/products', icon: Store, label:'Shop' },
              { href:'/wishlist', icon: Heart, label:'Wishlist' },
              { href:'/orders', icon: Package, label:'Orders' },
              { href: session ? '/account' : '/auth/login', icon: User, label: session ? 'Account' : 'Login' },
            ].map(item => {
              const Icon = item.icon
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all',
                    active ? 'text-cx-emerald' : 'text-cx-muted'
                  )}>
                  <Icon size={18} />
                  <span className="text-[9px] font-600">{item.label}</span>
                </Link>
              )
            })}
            <ClientOnly>
              <button onClick={toggleCart}
                className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative',
                  'text-cx-muted'
                )}>
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-1 min-w-[14px] h-[14px] px-0.5 bg-cx-emerald text-cx-bg text-[9px] font-800 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="text-[9px] font-600">Cart</span>
              </button>
            </ClientOnly>
          </div>
        </div>
      </header>
    </>
  )
}
