'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag, Trash2, Clock, Truck, Shield, RotateCcw, Bookmark, MoveRight, Gift, Zap, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { cn, formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

function addBusinessDays(date: Date, days: number): Date {
  let count = 0, d = new Date(date)
  while (count < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) count++
  }
  return d
}
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
}

export function CartDrawer() {
  const {
    items, savedForLater, isOpen, setCartOpen,
    removeItem, updateQuantity, clearCart,
    saveForLater, moveToCart,
    couponCode, couponDiscount, couponType,
    applyCoupon, removeCoupon,
    subtotal, totalSavings, discountedSubtotal, totalItems,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const sub = subtotal()
  const savings = totalSavings()
  const couponSaving = couponType === 'percent' ? sub * (couponDiscount / 100)
    : couponType === 'fixed' ? Math.min(sub, couponDiscount) : 0
  const discountedSub = discountedSubtotal()
  const shippingFree = discountedSub >= 99 || couponType === 'freeship'
  const shippingCost = shippingFree ? 0 : 9.99
  const tax = discountedSub * 0.08
  const total = discountedSub + shippingCost + tax
  const freeShipRemaining = Math.max(0, 99 - discountedSub)
  const deliveryDate = fmtDate(addBusinessDays(new Date(), 5))

  const handleCoupon = () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setTimeout(() => {
      const result = applyCoupon(couponInput)
      if (result.success) {
        toast.success(`🎉 Coupon applied: ${result.message}`)
        setCouponInput('')
      } else {
        toast.error(result.message)
      }
      setCouponLoading(false)
    }, 500)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] glass-dark border-l border-cx-border z-[70] flex flex-col shadow-2xl overflow-hidden pb-16 sm:pb-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cx-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cx-emerald/10 flex items-center justify-center">
                  <ShoppingBag size={15} className="text-cx-emerald" />
                </div>
                <div>
                  <h2 className="font-display font-800 text-[16px] text-white">Your Cart</h2>
                  <p className="text-[11px] text-cx-muted">{totalItems()} item{totalItems() !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={() => { clearCart(); toast.success('Cart cleared') }}
                    className="text-[11px] text-cx-muted hover:text-cx-rose transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-cx-rose/10">
                    <Trash2 size={11} /> Clear
                  </button>
                )}
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-cx-surface/60 rounded-xl transition-all">
                  <X size={16} className="text-cx-dim" />
                </button>
              </div>
            </div>

            {/* Free shipping bar */}
            {items.length > 0 && (
              <div className="px-5 py-3 border-b border-cx-border flex-shrink-0">
                {freeShipRemaining > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span className="text-cx-muted flex items-center gap-1"><Truck size={11}/> Spend <span className="text-cx-gold font-700 mx-1">{formatPrice(freeShipRemaining)}</span> more for free shipping</span>
                    </div>
                    <div className="h-1.5 bg-cx-surface rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #10d988, #8b5cf6)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (discountedSub / 99) * 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-cx-emerald text-[12px] font-600">
                    <Truck size={13} /> 🎉 You&apos;ve unlocked <strong>free shipping!</strong>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                  <div className="w-20 h-20 rounded-3xl bg-cx-surface/60 flex items-center justify-center mb-5">
                    <ShoppingBag size={32} className="text-cx-muted" />
                  </div>
                  <h3 className="font-700 text-[18px] text-white mb-2">Your cart is empty</h3>
                  <p className="text-cx-muted text-[13px] leading-relaxed mb-6">Add some amazing products to get started</p>
                  <Link href="/products" onClick={() => setCartOpen(false)}
                    className="btn-em px-6 py-3 text-[13px] rounded-xl inline-flex items-center gap-2">
                    <Zap size={14} /> Browse Products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-cx-border/50">
                  {items.map((item) => (
                    <motion.div key={item.id} layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 px-5 py-4 group hover:bg-cx-surface/20 transition-colors"
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cx-surface flex-shrink-0 border border-cx-border/50">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-cx-muted" />
                          </div>
                        )}
                        {item.dynamicPrice && (
                          <div className="absolute top-1 left-1 bg-cx-gold text-cx-bg text-[8px] font-800 px-1 rounded">AI</div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} onClick={() => setCartOpen(false)}
                          className="text-[13px] font-700 text-cx-text hover:text-cx-emerald transition-colors line-clamp-2 leading-tight">
                          {item.name}
                        </Link>
                        {item.brand && <p className="text-[10px] text-cx-muted mt-0.5">{item.brand}</p>}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-800 text-cx-emerald">{formatPrice(item.price)}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-[11px] text-cx-muted line-through">{formatPrice(item.originalPrice)}</span>
                            )}
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1.5 bg-cx-surface border border-cx-border rounded-xl px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="text-cx-muted hover:text-cx-text transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="text-[13px] font-700 text-cx-text min-w-[16px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="text-cx-muted hover:text-cx-emerald transition-colors disabled:opacity-30">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => saveForLater(item.id)}
                            className="text-[10px] text-cx-muted hover:text-cx-sky transition-colors flex items-center gap-1">
                            <Bookmark size={10} /> Save for later
                          </button>
                          <span className="text-cx-border">·</span>
                          <button onClick={() => { removeItem(item.id); toast.success('Removed from cart') }}
                            className="text-[10px] text-cx-muted hover:text-cx-rose transition-colors flex items-center gap-1">
                            <Trash2 size={10} /> Remove
                          </button>
                          {item.stock <= 5 && item.stock > 0 && (
                            <span className="text-[9px] text-cx-rose font-700 ml-auto">Only {item.stock} left!</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Saved for later */}
              {savedForLater.length > 0 && (
                <div className="border-t border-cx-border px-5 py-4">
                  <h3 className="text-[11px] font-700 text-cx-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Bookmark size={11} /> Saved for later ({savedForLater.length})
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {savedForLater.map(item => (
                      <div key={item.id} className="flex-shrink-0 w-[130px] bg-cx-surface border border-cx-border rounded-xl p-2.5">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-cx-card mb-2">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-[10px] font-600 text-cx-text line-clamp-2 leading-tight mb-1">{item.name}</p>
                        <p className="text-[11px] font-800 text-cx-emerald mb-2">{formatPrice(item.price)}</p>
                        <button onClick={() => moveToCart(item.id)}
                          className="w-full text-[10px] font-700 text-cx-bg bg-cx-emerald hover:bg-cx-emerald/90 rounded-lg py-1.5 transition-all flex items-center justify-center gap-1">
                          <MoveRight size={10} /> Move to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Totals */}
            {items.length > 0 && (
              <div className="border-t border-cx-border px-5 py-4 flex-shrink-0 space-y-3">
                {/* Coupon */}
                <div>
                  {couponCode ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-cx-emerald" />
                        <span className="text-[12px] font-700 text-cx-emerald">{couponCode}</span>
                        <span className="text-[11px] text-cx-dim">— {couponType === 'percent' ? `${couponDiscount}% off` : couponType === 'fixed' ? `$${couponDiscount} off` : 'Free shipping'}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-cx-muted hover:text-cx-rose transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cx-muted" />
                        <input
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                          placeholder="Coupon code"
                          className="w-full bg-cx-surface border border-cx-border rounded-xl pl-9 pr-3 py-2.5 text-[12px] text-cx-text placeholder:text-cx-muted outline-none focus:border-cx-emerald/40 transition-colors font-700 tracking-wide"
                        />
                      </div>
                      <button onClick={handleCoupon} disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-cx-emerald/10 border border-cx-emerald/20 text-cx-emerald text-[12px] font-700 hover:bg-cx-emerald/20 transition-all disabled:opacity-40 flex-shrink-0">
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-cx-muted mt-1.5">Try: <span className="text-cx-emerald font-600 cursor-pointer" onClick={() => setCouponInput('CORTEX10')}>CORTEX10</span>, <span className="text-cx-gold font-600 cursor-pointer" onClick={() => setCouponInput('FIRST15')}>FIRST15</span>, <span className="text-cx-sky font-600 cursor-pointer" onClick={() => setCouponInput('FREESHIP')}>FREESHIP</span></p>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between text-cx-dim">
                    <span>Subtotal</span><span className="font-600 text-cx-text">{formatPrice(sub)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-cx-emerald text-[12px]">
                      <span>Product savings</span><span className="font-600">−{formatPrice(savings)}</span>
                    </div>
                  )}
                  {couponSaving > 0 && (
                    <div className="flex justify-between text-cx-emerald text-[12px]">
                      <span>Coupon ({couponCode})</span><span className="font-600">−{formatPrice(couponSaving)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-cx-dim">
                    <span>Shipping</span>
                    <span className={shippingFree ? 'text-cx-emerald font-600' : 'font-600 text-cx-text'}>
                      {shippingFree ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-cx-dim">
                    <span>Tax (8%)</span><span className="font-600 text-cx-text">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-800 text-white pt-2 border-t border-cx-border">
                    <span>Total</span><span className="text-cx-emerald">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Estimated delivery */}
                <div className="flex items-center gap-2 px-3 py-2 bg-cx-surface/40 rounded-xl border border-cx-border/50">
                  <Clock size={12} className="text-cx-muted flex-shrink-0" />
                  <p className="text-[11px] text-cx-dim">Estimated delivery: <span className="text-cx-text font-600">{deliveryDate}</span></p>
                </div>

                {/* CTA */}
                <Link href="/checkout" onClick={() => setCartOpen(false)}
                  className="btn-em w-full py-4 text-[14px] rounded-2xl flex items-center justify-center gap-2.5 font-800">
                  <Shield size={15} /> Secure Checkout — {formatPrice(total)}
                  <ArrowRight size={14} />
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {[{ icon: Shield, label: 'SSL Secure' }, { icon: RotateCcw, label: '30-Day Returns' }, { icon: Truck, label: 'Free on $99+' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1 text-[10px] text-cx-muted">
                      <Icon size={10} /> {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
