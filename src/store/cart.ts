'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  originalPrice: number
  image: string
  quantity: number
  stock: number
  brand?: string
  dynamicPrice?: boolean
  priceReason?: string | null
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  totalItems: () => number
  subtotal: () => number
  totalSavings: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set({ items: get().items.map((i) => i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i) })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return }
        set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i) })
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (open) => set({ isOpen: open }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      totalSavings: () => get().items.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0),
    }),
    { name: 'cortexcart-cart' }
  )
)
