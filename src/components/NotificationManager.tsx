'use client'
import { useEffect } from 'react'
import { useNotifStore } from '@/store/notifications'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'

export function NotificationManager() {
  const { addNotification, notifications } = useNotifStore()
  const { items, lastActivity } = useCartStore()
  const wishlistItems = useWishlistStore(s => s.items)

  // Welcome notification on first visit
  useEffect(() => {
    const welcomed = localStorage.getItem('cx-welcomed')
    if (!welcomed && notifications.length === 0) {
      setTimeout(() => {
        addNotification({
          type: 'promo',
          title: 'Welcome to CortexCart! 🎉',
          message: 'Use code FIRST15 for 15% off your first order. Free shipping on orders over $99!',
          link: '/products',
        })
        localStorage.setItem('cx-welcomed', '1')
      }, 2500)
    }
  }, [])

  // Cart abandonment nudge (every 30 mins of inactivity)
  useEffect(() => {
    const interval = setInterval(() => {
      const fired = sessionStorage.getItem('cx-abandon-fired')
      if (items.length > 0 && !fired) {
        const inactiveMs = Date.now() - lastActivity
        if (inactiveMs > 30 * 60 * 1000) {
          addNotification({
            type: 'warning',
            title: 'Still thinking? 🛒',
            message: `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart. Complete your purchase before they sell out!`,
            link: '/checkout',
          })
          sessionStorage.setItem('cx-abandon-fired', '1')
        }
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [items, lastActivity])

  // Wishlist price drop simulation (demo only)
  useEffect(() => {
    if (wishlistItems.length === 0) return
    const timeout = setTimeout(() => {
      const item = wishlistItems[Math.floor(Math.random() * wishlistItems.length)]
      if (item) {
        addNotification({
          type: 'price_drop',
          title: 'Price Drop on Wishlist! 📉',
          message: `${item.name} just dropped — grab it before the price goes back up!`,
          link: '/wishlist',
        })
      }
    }, 120000) // 2 min demo trigger
    return () => clearTimeout(timeout)
  }, [wishlistItems])

  return null
}
