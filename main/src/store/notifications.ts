'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotifType = 'success' | 'warning' | 'error' | 'info' | 'promo' | 'order' | 'price_drop' | 'back_in_stock'

export interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  icon?: string
  link?: string
  image?: string
  orderId?: string
  productId?: string
  read: boolean
  createdAt: number
  expiresAt?: number
}

interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
}

export const useNotifStore = create<NotifStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,

      addNotification: (n) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
        const notif: Notification = { ...n, id, read: false, createdAt: Date.now() }
        const updated = [notif, ...get().notifications].slice(0, 50) // keep 50 max
        set({ notifications: updated, unreadCount: updated.filter(x => !x.read).length })
      },
      markRead: (id) => {
        const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n)
        set({ notifications: updated, unreadCount: updated.filter(x => !x.read).length })
      },
      markAllRead: () => {
        const updated = get().notifications.map(n => ({ ...n, read: true }))
        set({ notifications: updated, unreadCount: 0 })
      },
      deleteNotification: (id) => {
        const updated = get().notifications.filter(n => n.id !== id)
        set({ notifications: updated, unreadCount: updated.filter(x => !x.read).length })
      },
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      togglePanel: () => set({ isOpen: !get().isOpen }),
      setPanelOpen: (open) => set({ isOpen: open }),
    }),
    { name: 'cx-notifications' }
  )
)
