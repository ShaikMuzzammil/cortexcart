'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem { id: string; slug: string; name: string; price: number; image: string }

interface WishlistStore {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        set({ items: exists ? get().items.filter((i) => i.id !== item.id) : [...get().items, item] })
      },
      has: (id) => !!get().items.find((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'cortexcart-wishlist' }
  )
)
