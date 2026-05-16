'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, Heart, User, LogOut, Settings, Package, LayoutDashboard } from 'lucide-react'
import { useCartStore }     from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { ClientOnly }       from '@/components/ClientOnly'
import { cn, initials }     from '@/lib/utils'
import { LiveTicker }       from '@/components/LiveTicker'

const SHOP_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Electronics',  href: '/products?category=electronics' },
  { label: 'Wearables',    href: '/products?category=wearables' },
  { label: 'Audio',        href: '/products?category=audio' },
  { label: 'Computing',    href: '/products?category=computing' },
  { label: 'Photography',  href: '/products?category=photography' },
  { label: 'Gaming',       href: '/products?category=gaming' },
]

const NAV = [
  { label: 'Home',     href: '/' },
  { label: 'Shop',     href: '/products', sub: SHOP_LINKS },
  { label: 'Featured', href: '/products?featured=true' },
  { label: 'Deals',    href: '/products?deals=true' },
  { label: 'Contact',  href: '/contact' },
]

export function Navbar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const { data: session } = useSession()
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [searchQ,        setSearchQ]        = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string|null>(null)
  const [userMenu,       setUserMenu]       = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setUserMenu(false) }, [pathname])

  const totalItems = useCartStore(s => s.totalItems())
  const wishCount  = useWishlistStore(s => s.items.length)
  const toggleCart = useCartStore(s => s.toggleCart)

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.trim()) { router.push(`/products?q=${encodeURIComponent(searchQ.trim())}`); setSearchOpen(false); setSearchQ('') }
  }

  return (
    <>
      <LiveTicker />
      <header className={cn('sticky top-0 z-50 transition-all duration-400', scrolled ? 'glass-dark shadow-[0_4px_32px_rgba(0,0,0,0.5)]' : 'bg-transparent')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group mr-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cx-emerald to-cx-sky flex items-center justify-center shadow-[0_0_16px_rgba(16,217,136,0.3)] group-hover:shadow-[0_0_24px_rgba(16,217,136,0.5)] transition-all">
                <Zap size={15} className="text-cx-bg" />
              </div>
              <span className="font-display font-900 text-lg text-white hidden sm:block tracking-tight">
                Cortex<span className="grad-emerald">Cart</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV.map(link => (
                <div key={link.label} className="relative"
                  onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <Link href={link.href}
                    className={cn('flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 relative',
                      isActive(link.href) ? 'text-cx-emerald nav-active' : 'text-cx-dim hover:text-cx-text hover:bg-white/4')}>
                    {link.label}
                    {link.sub && <ChevronDown size={13} className={cn('transition-transform duration-200', activeDropdown === link.label && 'rotate-180')} />}
                  </Link>

                  {link.sub && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 glass-dark rounded-2xl border border-cx-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-down z-50">
                      {link.sub.map(sub => (
                        <Link key={sub.label} href={sub.href}
                          className="block px-4 py-2.5 text-[13px] text-cx-dim hover:text-cx-emerald hover:bg-cx-emerald/5 transition-colors border-b border-cx-border/30 last:border-0">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-xl text-cx-muted hover:text-cx-text hover:bg-white/5 transition-all">
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* Wishlist */}
              <ClientOnly>
                <Link href="/wishlist" className="relative p-2 rounded-xl text-cx-muted hover:text-cx-rose hover:bg-cx-rose/10 transition-all">
                  <Heart size={18} />
                  {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cx-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center notif-dot">{wishCount > 9 ? '9+' : wishCount}</span>}
                </Link>
              </ClientOnly>

              {/* Cart */}
              <ClientOnly>
                <button onClick={toggleCart} className="relative p-2 rounded-xl text-cx-muted hover:text-cx-emerald hover:bg-cx-emerald/10 transition-all">
                  <ShoppingCart size={18} />
                  {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-cx-emerald to-cx-sky text-cx-bg text-[9px] font-bold rounded-full flex items-center justify-center animate-glow-pulse">{totalItems > 9 ? '9+' : totalItems}</span>}
                </button>
              </ClientOnly>

              {/* User menu */}
              <div className="relative hidden sm:block">
                {session ? (
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cx-violet to-cx-rose flex items-center justify-center text-[11px] font-bold text-white">
                      {initials(session.user?.name || session.user?.email || 'U')}
                    </div>
                    <span className="text-[13px] font-semibold text-cx-dim hidden md:block max-w-[80px] truncate">
                      {session.user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown size={13} className={cn('text-cx-muted transition-transform', userMenu && 'rotate-180')} />
                  </button>
                ) : (
                  <Link href="/auth/login" className="flex items-center gap-1.5 px-4 py-2 btn-outline-em text-[13px] rounded-xl">
                    <User size={14} /> Sign In
                  </Link>
                )}

                {session && userMenu && (
                  <div className="absolute top-full right-0 mt-2 w-52 glass-dark rounded-2xl border border-cx-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3 border-b border-cx-border">
                      <p className="font-semibold text-sm text-cx-text">{session.user?.name}</p>
                      <p className="text-[11px] text-cx-muted truncate">{session.user?.email}</p>
                    </div>
                    {[
                      { icon: User, label: 'My Account', href: '/account' },
                      { icon: Package, label: 'My Orders', href: '/orders' },
                      { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                      { icon: Settings, label: 'Settings', href: '/account?tab=settings' },
                      ...((session.user as any)?.role === 'ADMIN' ? [{ icon: LayoutDashboard, label: 'Admin', href: '/admin' }] : []),
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
              </div>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl text-cx-muted hover:text-cx-text transition-colors ml-1">
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
                  className="cx-input w-full pl-10 pr-4 py-3 text-sm" />
                {searchQ && <button type="button" onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted hover:text-cx-text"><X size={14} /></button>}
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-cx-border/40 pt-3 animate-slide-down">
              {NAV.map(link => (
                <div key={link.label}>
                  <Link href={link.href} className={cn('block px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors', isActive(link.href) ? 'text-cx-emerald bg-cx-emerald/5' : 'text-cx-dim hover:text-cx-text')}>
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className="ml-4 space-y-0.5 mb-1">
                      {link.sub.map(sub => (
                        <Link key={sub.label} href={sub.href} className="block px-3 py-1.5 rounded-lg text-xs text-cx-muted hover:text-cx-emerald hover:bg-cx-emerald/5 transition-colors">{sub.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {session ? (
                <div className="mt-3 pt-3 border-t border-cx-border/40 space-y-1">
                  <Link href="/account" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-dim hover:text-cx-text"><User size={14} /> My Account</Link>
                  <Link href="/orders"  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-dim hover:text-cx-text"><Package size={14} /> My Orders</Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-cx-rose hover:bg-cx-rose/5 transition-colors"><LogOut size={14} /> Sign Out</button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-cx-border/40 flex gap-2">
                  <Link href="/auth/login"    className="flex-1 py-2.5 text-center text-[13px] btn-outline-em rounded-xl">Sign In</Link>
                  <Link href="/auth/register" className="flex-1 py-2.5 text-center text-[13px] btn-em rounded-xl">Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
