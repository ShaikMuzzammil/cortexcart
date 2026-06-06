'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string; slug: string; name: string; price: number; originalPrice: number
  image: string; quantity: number; stock: number; brand?: string
  dynamicPrice?: boolean; priceReason?: string | null
}

export type CouponType = 'percent' | 'fixed' | 'freeship'

export const VALID_COUPONS: Record<string, { discount: number; type: CouponType; label: string }> = {
  CORTEX10: { discount: 10, type: 'percent', label: '10% off your order' },
  SAVE20:   { discount: 20, type: 'fixed',   label: '$20 off your order' },
  FREESHIP: { discount: 0,  type: 'freeship',label: 'Free shipping' },
  FIRST15:  { discount: 15, type: 'percent', label: '15% off for first order' },
  FLASH25:  { discount: 25, type: 'percent', label: '25% flash deal' },
}

interface CartStore {
  items: CartItem[]
  savedForLater: CartItem[]
  isOpen: boolean
  userId: string | null
  couponCode: string | null
  couponDiscount: number
  couponType: CouponType | null
  lastActivity: number
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  setUserId: (id: string | null) => void
  saveForLater: (id: string) => void
  moveToCart: (id: string) => void
  applyCoupon: (code: string) => { success: boolean; message: string }
  removeCoupon: () => void
  updateActivity: () => void
  // Computed
  totalItems: () => number
  subtotal: () => number
  totalSavings: () => number
  discountedSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      isOpen: false,
      userId: null,
      couponCode: null,
      couponDiscount: 0,
      couponType: null,
      lastActivity: Date.now(),

      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set({ items: get().items.map(i => i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i), lastActivity: Date.now() })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }], lastActivity: Date.now() })
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id), lastActivity: Date.now() }),
      updateQuantity: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i), lastActivity: Date.now() })
      },
      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0, couponType: null }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (open) => set({ isOpen: open }),
      setUserId: (id) => set({ userId: id }),
      updateActivity: () => set({ lastActivity: Date.now() }),

      saveForLater: (id) => {
        const item = get().items.find(i => i.id === id)
        if (!item) return
        set({ items: get().items.filter(i => i.id !== id), savedForLater: [...get().savedForLater.filter(i => i.id !== id), item] })
      },
      moveToCart: (id) => {
        const item = get().savedForLater.find(i => i.id === id)
        if (!item) return
        const existing = get().items.find(i => i.id === id)
        if (existing) {
          set({ savedForLater: get().savedForLater.filter(i => i.id !== id), items: get().items.map(i => i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i) })
        } else {
          set({ savedForLater: get().savedForLater.filter(i => i.id !== id), items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      applyCoupon: (code) => {
        const upper = code.toUpperCase().trim()
        const coupon = VALID_COUPONS[upper]
        if (!coupon) return { success: false, message: 'Invalid coupon code' }
        set({ couponCode: upper, couponDiscount: coupon.discount, couponType: coupon.type })
        return { success: true, message: coupon.label }
      },
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0, couponType: null }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      totalSavings: () => get().items.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0),
      discountedSubtotal: () => {
        const sub = get().subtotal()
        const { couponDiscount, couponType } = get()
        if (!couponType || couponType === 'freeship') return sub
        if (couponType === 'percent') return sub * (1 - couponDiscount / 100)
        if (couponType === 'fixed') return Math.max(0, sub - couponDiscount)
        return sub
      },
    }),
    { name: 'cortexcart-cart' }
  )
)
