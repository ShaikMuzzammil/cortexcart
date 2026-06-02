'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User, LogOut, Settings, Package, LayoutDashboard, Cpu, Watch, Headphones, Monitor, Camera, Gamepad2 } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { ClientOnly }       from '@/components/ClientOnly'
import { cn, initials }     from '@/lib/utils'

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

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const [shopDrop,   setShopDrop]   = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    setMobileOpen(false); setSearchOpen(false); setUserMenu(false); setShopDrop(false)
  }, [pathname])

  const totalItems = useCartStore(s => s.totalItems())
  const wishCount  = useWishlistStore(s => s.items.length)
  const toggleCart = useCartStore(s => s.toggleCart)

  // Exact active matching — only ONE link active at a time
  const isActive = (href: string, hasDrop?: boolean) => {
    if (href === '/') return pathname === '/'
    // For Shop: only active when exactly on /products with no special params
    if (hasDrop) return pathname === '/products' && !window?.location?.search?.includes('featured') && !window?.location?.search?.includes('deals')
    // Featured / Deals — only active for that exact param
    if (href.includes('featured=true')) return pathname === '/products' && typeof window !== 'undefined' && window.location.search.includes('featured=true')
    if (href.includes('deals=true'))    return pathname === '/products' && typeof window !== 'undefined' && window.location.search.includes('deals=true')
    return pathname === href
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.trim()) { router.push(`/products?q=${encodeURIComponent(searchQ.trim())}`); setSearchOpen(false); setSearchQ('') }
  }

  return (
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <div key={link.label} className="relative"
                onMouseEnter={() => link.hasDrop && setShopDrop(true)}
                onMouseLeave={() => setShopDrop(false)}>
                <Link href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-600 transition-all duration-200 relative whitespace-nowrap',
                    pathname === link.href && !link.hasDrop && link.href !== '/'
                      ? 'text-cx-emerald bg-cx-emerald/8'
                      : link.href === '/' && pathname === '/'
                      ? 'text-cx-emerald bg-cx-emerald/8'
                      : 'text-cx-dim hover:text-cx-text hover:bg-white/4'
                  )}>
                  {link.label}
                  {link.hasDrop && (
                    <ChevronDown size={12} className={cn('transition-transform duration-200 ml-0.5', shopDrop && 'rotate-180')} />
                  )}
                  {/* Active underline dot */}
                  {((pathname === link.href && link.href !== '/products') || (link.href === '/' && pathname === '/')) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cx-emerald" />
                  )}
                </Link>

                {/* Shop dropdown */}
                {link.hasDrop && shopDrop && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-68 glass-dark rounded-2xl border border-cx-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-down z-50">
                    <div className="p-3">
                      <Link href="/products"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-700 text-cx-emerald hover:bg-cx-emerald/8 transition-colors mb-2">
                        <Zap size={13} /> All Products
                      </Link>
                      <div className="section-divider mb-2" />
                      <p className="px-3 text-[10px] font-700 text-cx-muted uppercase tracking-widest mb-2">Categories</p>
                      <div className="grid grid-cols-2 gap-1">
                        {CATEGORIES.map(cat => (
                          <Link key={cat.label} href={cat.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-600 text-cx-dim hover:text-cx-text hover:bg-white/5 transition-colors">
                            <cat.icon size={13} className={cat.color} /> {cat.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl text-cx-muted hover:text-cx-text hover:bg-white/5 transition-all">
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <ClientOnly>
              <Link href="/wishlist" className="relative p-2 rounded-xl text-cx-muted hover:text-cx-rose hover:bg-cx-rose/10 transition-all">
                <Heart size={18} />
                {wishCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cx-rose text-white text-[9px] font-700 rounded-full flex items-center justify-center notif-dot">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>

              <button onClick={toggleCart} className="relative p-2 rounded-xl text-cx-muted hover:text-cx-emerald hover:bg-cx-emerald/10 transition-all">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-cx-emerald to-cx-sky text-cx-bg text-[9px] font-700 rounded-full flex items-center justify-center animate-glow-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </ClientOnly>

            {/* User menu */}
            <div className="relative hidden sm:block">
              {session ? (
                <>
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center text-[11px] font-700 text-white">
                      {initials(session.user?.name || session.user?.email || 'U')}
                    </div>
                    <span className="text-[13px] font-600 text-cx-dim hidden md:block max-w-[80px] truncate">
                      {session.user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown size={12} className={cn('text-cx-muted transition-transform', userMenu && 'rotate-180')} />
                  </button>

                  {userMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 glass-dark rounded-2xl border border-cx-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-scale-in z-50">
                      <div className="px-4 py-3 border-b border-cx-border">
                        <p className="font-600 text-[13px] text-cx-text">{session.user?.name || 'User'}</p>
                        <p className="text-[11px] text-cx-muted truncate">{session.user?.email}</p>
                      </div>
                      {[
                        { icon: User,          label: 'My Account', href: '/account' },
                        { icon: Package,       label: 'My Orders',  href: '/account?tab=orders' },
                        { icon: Heart,         label: 'Wishlist',   href: '/wishlist' },
                        { icon: Settings,      label: 'Settings',   href: '/account?tab=settings' },
                        ...((session.user as any)?.role === 'ADMIN' ? [{ icon: LayoutDashboard, label: 'Admin Dashboard', href: '/admin' }] : []),
                      ].map(item => (
                        <Link key={item.label} href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-cx-dim hover:text-cx-emerald hover:bg-cx-emerald/5 transition-colors">
                          <item.icon size={14} /> {item.label}
                        </Link>
                      ))}
                      <button onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-cx-rose hover:bg-cx-rose/5 transition-colors border-t border-cx-border">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-1.5 px-4 py-2 btn-outline-em text-[13px] rounded-xl">
                  <User size={14} /> Sign In
                </Link>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl text-cx-muted hover:text-cx-text transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-slide-up">
            <form onSubmit={handleSearch} className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cx-muted pointer-events-none" />
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="cx-input w-full pl-10 pr-4 py-3 text-[13px]" />
              {searchQ && (
                <button type="button" onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text">
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-cx-border/40 pt-3 animate-slide-down space-y-0.5">
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href}
                className={cn('block px-3 py-2.5 rounded-xl text-[13px] font-600 transition-colors',
                  pathname === link.href ? 'text-cx-emerald bg-cx-emerald/5' : 'text-cx-dim hover:text-cx-text hover:bg-white/3')}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-cx-border/40">
              <p className="px-3 py-1 text-[10px] font-700 text-cx-muted uppercase tracking-widest">Categories</p>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {CATEGORIES.map(cat => (
                  <Link key={cat.label} href={cat.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-cx-dim hover:text-cx-text hover:bg-white/3 transition-colors">
                    <cat.icon size={12} className={cat.color} /> {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            {session ? (
              <div className="pt-2 border-t border-cx-border/40 space-y-0.5">
                <Link href="/account"              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-dim hover:text-cx-text"><User size={14} /> My Account</Link>
                <Link href="/account?tab=orders"   className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-dim hover:text-cx-text"><Package size={14} /> My Orders</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-rose hover:bg-cx-rose/5 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-cx-border/40">
                <Link href="/auth/login"    className="flex-1 py-2.5 text-center text-[13px] btn-outline-em rounded-xl">Sign In</Link>
                <Link href="/auth/register" className="flex-1 py-2.5 text-center text-[13px] btn-em rounded-xl">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
