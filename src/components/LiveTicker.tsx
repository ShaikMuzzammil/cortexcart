'use client'

const TICKS = [
  { icon: '🔥', text: 'Flash Sale: 30% off Aurora SmartWatch', color: 'text-cx-rose' },
  { icon: '⚡', text: 'Free shipping on orders over $99',       color: 'text-cx-gold' },
  { icon: '🆕', text: 'Nexus Ultra Pro — Back in stock',        color: 'text-cx-emerald' },
  { icon: '🧠', text: 'AI recommendations now live',            color: 'text-cx-violet' },
  { icon: '💎', text: 'Loyalty members earn 2× points today',  color: 'text-cx-gold' },
  { icon: '🚀', text: 'New: Stellar X4 Pro Drone',              color: 'text-cx-emerald' },
  { icon: '🔒', text: 'Secure checkout — Stripe 256-bit SSL',  color: 'text-cx-sky' },
  { icon: '🌍', text: 'Ships to 45+ countries worldwide',       color: 'text-cx-dim' },
  { icon: '⭐', text: 'Over 50,000 five-star reviews',          color: 'text-cx-gold' },
  { icon: '📦', text: 'Same-day dispatch on orders before 2pm', color: 'text-cx-emerald' },
]

export function LiveTicker() {
  const doubled = [...TICKS, ...TICKS]
  return (
    <div className="bg-cx-surface border-b border-cx-border/60 py-1.5 overflow-hidden ticker-wrap">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold text-cx-muted whitespace-nowrap">
            <span className={t.color}>{t.icon}</span>
            <span className="text-cx-dim">{t.text}</span>
            <span className="text-cx-border mx-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
