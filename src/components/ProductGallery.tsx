'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { images: string[]; name: string; discount?: number }

function SafeImg({ src, alt, className, style }: { src:string; alt:string; className?:string; style?:React.CSSProperties }) {
  const [err, setErr] = useState(false)
  if (err || !src) return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cx-surface to-cx-card">
      <ImageOff size={36} className="text-cx-muted opacity-30 mb-2"/>
      <span className="text-[11px] text-cx-muted opacity-50">{alt}</span>
    </div>
  )
  return (
    <img src={src} alt={alt} className={cn('w-full h-full object-cover', className)} style={style}
      onError={() => setErr(true)} loading="lazy"/>
  )
}

export function ProductGallery({ images, name, discount }: Props) {
  const [idx,    setIdx]    = useState(0)
  const [zoom,   setZoom]   = useState(false)
  const all = images && images.length > 0 ? images : []

  const prev = () => setIdx(i => (i - 1 + all.length) % all.length)
  const next = () => setIdx(i => (i + 1) % all.length)

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-cx-surface to-cx-card border border-cx-border group">
          {all.length > 0 ? (
            <SafeImg src={all[idx]} alt={`${name} - image ${idx + 1}`}
              className="transition-all duration-500 group-hover:scale-105"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff size={48} className="text-cx-muted opacity-20"/>
            </div>
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="absolute top-4 left-4 badge-rose text-[12px] font-700 shadow-lg">
              -{discount}% OFF
            </div>
          )}

          {/* Zoom button */}
          {all.length > 0 && (
            <button onClick={() => setZoom(true)}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl glass border border-cx-border flex items-center justify-center text-cx-muted hover:text-cx-emerald hover:border-cx-emerald/30 opacity-0 group-hover:opacity-100 transition-all">
              <ZoomIn size={15}/>
            </button>
          )}

          {/* Nav arrows */}
          {all.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl glass border border-cx-border flex items-center justify-center text-white hover:border-cx-emerald/30 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronLeft size={16}/>
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl glass border border-cx-border flex items-center justify-center text-white hover:border-cx-emerald/30 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronRight size={16}/>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {all.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {all.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={cn('rounded-full transition-all duration-300',
                    i === idx ? 'w-5 h-1.5 bg-cx-emerald' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70')}/>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {all.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {all.slice(0, 5).map((img, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={cn('relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105',
                  i === idx ? 'border-cx-emerald shadow-[0_0_12px_rgba(16,217,136,0.3)]' : 'border-cx-border hover:border-cx-emerald/40')}
                style={{ background: '#0f1524' }}>
                <SafeImg src={img} alt={`${name} thumbnail ${i + 1}`} className="transition-transform duration-300 hover:scale-110"/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom lightbox */}
      {zoom && all.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoom(false)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-xl glass border border-cx-border flex items-center justify-center text-cx-muted hover:text-white transition-colors z-10">
            <X size={18}/>
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={all[idx]} alt={name} className="max-w-full max-h-full object-contain rounded-2xl"/>
            {all.length > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 rounded-xl glass border border-cx-border flex items-center justify-center text-white hover:border-cx-emerald/30 transition-all">
                  <ChevronLeft size={18}/>
                </button>
                <button onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 rounded-xl glass border border-cx-border flex items-center justify-center text-white hover:border-cx-emerald/30 transition-all">
                  <ChevronRight size={18}/>
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {all.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={cn('rounded-full transition-all duration-300',
                    i === idx ? 'w-5 h-1.5 bg-cx-emerald' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70')}/>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
