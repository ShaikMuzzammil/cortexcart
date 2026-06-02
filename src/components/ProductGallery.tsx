'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { images: string[]; name: string; discount: number }

export function ProductGallery({ images, name, discount }: Props) {
  const [active,  setActive]  = useState(0)
  const [zoomed,  setZoomed]  = useState(false)
  const allImgs = images.length > 0 ? images : ['https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800']

  const prev = () => setActive(i => (i - 1 + allImgs.length) % allImgs.length)
  const next = () => setActive(i => (i + 1) % allImgs.length)

  return (
    <>
      <div className="space-y-4">
        {/* Main image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden cx-card-flat group">
          <Image src={allImgs[active]} alt={`${name} — view ${active+1}`} fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:1024px)100vw,50vw" priority/>

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 badge-rose text-[13px] px-3 py-1 rounded-xl font-700">{discount}% OFF</div>
          )}

          {/* Zoom button */}
          <button onClick={() => setZoomed(true)}
            className="absolute top-4 right-4 w-10 h-10 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
            <ZoomIn size={16} className="text-white"/>
          </button>

          {/* Arrow navigation */}
          {allImgs.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronLeft size={18} className="text-white"/>
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronRight size={18} className="text-white"/>
              </button>
            </>
          )}

          {/* Counter */}
          {allImgs.length > 1 && (
            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg glass text-[11px] font-600 text-white">
              {active+1} / {allImgs.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImgs.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {allImgs.map((img, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={cn('gallery-thumb relative aspect-square', i === active && 'active')}>
                <Image src={img} alt={`${name} view ${i+1}`} fill className="object-cover" sizes="100px"/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomed(false)}>
          <div className="relative w-full max-w-3xl aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={allImgs[active]} alt={name} fill className="object-contain" sizes="900px"/>
            {allImgs.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  <ChevronLeft size={22}/>
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  <ChevronRight size={22}/>
                </button>
              </>
            )}
            <button onClick={() => setZoomed(false)} className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white text-lg hover:bg-black/80">✕</button>
          </div>
        </div>
      )}
    </>
  )
}
