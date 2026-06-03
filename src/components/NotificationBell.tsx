'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, Check, CheckCheck, Trash2, X, Package, DollarSign, Info, AlertTriangle, Sparkles, ShoppingBag, TrendingDown, RefreshCw, ShoppingCart } from 'lucide-react'
import { useNotifStore, Notification, NotifType } from '@/store/notifications'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

const typeConfig: Record<NotifType, { icon: any; color: string; bg: string; border: string }> = {
  success:       { icon: Check,        color: 'text-cx-emerald', bg: 'bg-cx-emerald/10',    border: 'border-cx-emerald/30' },
  warning:       { icon: AlertTriangle, color: 'text-cx-gold',    bg: 'bg-cx-gold/10',       border: 'border-cx-gold/30' },
  error:         { icon: X,            color: 'text-cx-rose',     bg: 'bg-cx-rose/10',       border: 'border-cx-rose/30' },
  info:          { icon: Info,         color: 'text-cx-sky',      bg: 'bg-cx-sky/10',        border: 'border-cx-sky/30' },
  promo:         { icon: Sparkles,     color: 'text-cx-violet',   bg: 'bg-cx-violet/10',     border: 'border-cx-violet/30' },
  order:         { icon: Package,      color: 'text-cx-violet',   bg: 'bg-cx-violet/10',     border: 'border-cx-violet/30' },
  price_drop:    { icon: TrendingDown, color: 'text-cx-gold',     bg: 'bg-cx-gold/10',       border: 'border-cx-gold/30' },
  back_in_stock: { icon: RefreshCw,    color: 'text-cx-sky',      bg: 'bg-cx-sky/10',        border: 'border-cx-sky/30' },
}

type Tab = 'all' | 'unread' | 'orders' | 'deals'

export function NotificationBell() {
  const { notifications, unreadCount, isOpen, togglePanel, setPanelOpen, markRead, markAllRead, deleteNotification, clearAll } = useNotifStore()
  const [tab, setTab] = useState<Tab>('all')
  const [prevCount, setPrevCount] = useState(unreadCount)
  const [shake, setShake] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (unreadCount > prevCount) { setShake(true); setTimeout(() => setShake(false), 600) }
    setPrevCount(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false) }
    if (isOpen) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [isOpen])

  const filtered = notifications.filter(n => {
    if (tab === 'unread') return !n.read
    if (tab === 'orders') return n.type === 'order' || n.type === 'success'
    if (tab === 'deals')  return n.type === 'promo' || n.type === 'price_drop'
    return true
  })

  const grouped: Record<string, Notification[]> = {}
  filtered.forEach(n => {
    const d = new Date(n.createdAt); const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const key = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : 'Earlier'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(n)
  })

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={togglePanel}
        className={cn('relative p-2 rounded-xl hover:bg-cx-surface/60 transition-all', isOpen && 'bg-cx-surface/60')}
        title="Notifications"
      >
        <motion.div animate={shake ? { rotate: [-15,15,-10,10,-5,5,0] } : {}}>
          {unreadCount > 0 ? <BellRing size={18} className="text-cx-text" /> : <Bell size={18} className="text-cx-dim" />}
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-cx-rose text-white text-[10px] font-800 rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[560px] glass-dark border border-cx-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cx-border">
              <span className="font-700 text-[15px] text-white">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-cx-emerald hover:text-cx-emerald/80 font-600 flex items-center gap-1">
                    <CheckCheck size={12}/> Mark all read
                  </button>
                )}
                <button onClick={() => setPanelOpen(false)} className="p-1 hover:bg-cx-surface/60 rounded-lg">
                  <X size={14} className="text-cx-dim" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-cx-border px-4 gap-1">
              {(['all','unread','orders','deals'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn('py-2.5 px-3 text-[12px] font-600 capitalize transition-colors border-b-2 -mb-px',
                    tab === t ? 'border-cx-emerald text-cx-emerald' : 'border-transparent text-cx-dim hover:text-cx-text'
                  )}>
                  {t}{t === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Bell size={36} className="text-cx-muted mb-3" />
                  <p className="font-600 text-cx-dim">You&apos;re all caught up!</p>
                  <p className="text-[12px] text-cx-muted mt-1">No new notifications</p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                    <div className="px-4 py-2 text-[11px] font-700 text-cx-muted uppercase tracking-wide bg-cx-surface/30">{date}</div>
                    {items.map(n => {
                      const cfg = typeConfig[n.type]
                      const Icon = cfg.icon
                      return (
                        <motion.div key={n.id} layout
                          className={cn('relative px-4 py-3 flex gap-3 hover:bg-cx-surface/40 transition-colors cursor-pointer group',
                            !n.read && 'border-l-2 border-cx-emerald bg-cx-emerald/3'
                          )}
                          onClick={() => { markRead(n.id) }}
                        >
                          <div className={cn('w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center', cfg.bg, 'border', cfg.border)}>
                            <Icon size={14} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('text-[13px] font-700 leading-tight', !n.read ? 'text-white' : 'text-cx-text')}>{n.title}</p>
                              <span className="text-[10px] text-cx-muted whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                            </div>
                            <p className="text-[12px] text-cx-dim mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            {n.link && (
                              <Link href={n.link} onClick={e => { e.stopPropagation(); markRead(n.id); setPanelOpen(false) }}
                                className="text-[11px] text-cx-emerald font-600 mt-1 inline-block hover:underline">
                                View details →
                              </Link>
                            )}
                          </div>
                          <button onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-cx-rose/20 rounded transition-all flex-shrink-0 self-start mt-0.5">
                            <X size={12} className="text-cx-dim" />
                          </button>
                          {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cx-emerald" />}
                        </motion.div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-cx-border px-4 py-3">
                <button onClick={clearAll} className="w-full text-[12px] text-cx-muted hover:text-cx-rose transition-colors font-600 flex items-center justify-center gap-1.5">
                  <Trash2 size={12} /> Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
