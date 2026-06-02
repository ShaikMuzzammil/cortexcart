'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string; slug: string; name: string; price: number
  originalPrice?: number; image: string; quantity: number; stock: number
  brand?: string; priceReason?: string; dynamicPrice?: boolean; userId?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        set(state => {
          const existing = state.items.find(i => i.id === item.id)
          if (existing) {
            return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i) }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },
      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
      updateQty:  (id, qty) => set(state => ({
        items: qty <= 0 ? state.items.filter(i => i.id !== id) : state.items.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i),
      })),
      clearCart:   () => set({ items: [] }),
      subtotal:    () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      totalItems:  () => get().items.reduce((s, i) => s + i.quantity, 0),
      toggleCart:  () => set(s => ({ isOpen: !s.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
    }),
    { name: 'cortexcart-cart' }
  )
)
