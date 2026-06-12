'use client'
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dot  = dotRef.current
    const ring = ringRef.current
    const glow = glowRef.current
    if (!dot || !ring || !glow) return

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let visible = false
    let hovering = false
    let raf: number

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      rx = lerp(rx, mx, 0.18)
      ry = lerp(ry, my, 0.18)

      dot.style.transform  = `translate3d(${mx - 3}px,${my - 3}px,0)`
      ring.style.transform = `translate3d(${rx - (hovering ? 22 : 16)}px,${ry - (hovering ? 22 : 16)}px,0)`
      glow.style.transform = `translate3d(${rx - 40}px,${ry - 40}px,0)`

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const show = () => {
      if (!visible) {
        visible = true
        dot.style.opacity  = '1'
        ring.style.opacity = '1'
        glow.style.opacity = '1'
      }
    }
    const hide = () => {
      visible = false
      dot.style.opacity  = '0'
      ring.style.opacity = '0'
      glow.style.opacity = '0'
    }

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; show() }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const isClickable = !!t.closest('a,button,input,textarea,select,[role=button],[data-cursor]')
      hovering = isClickable
      ring.style.width  = isClickable ? '44px' : '32px'
      ring.style.height = isClickable ? '44px' : '32px'
      ring.style.borderColor = isClickable ? 'rgba(16,217,136,0.8)' : 'rgba(16,217,136,0.4)'
      ring.style.background  = isClickable ? 'rgba(16,217,136,0.06)' : 'transparent'
    }
    const onDown = () => {
      dot.style.transform = dot.style.transform + ' scale(1.8)'
      ring.style.transform = ring.style.transform + ' scale(0.8)'
      ring.style.background = 'rgba(16,217,136,0.15)'
    }
    const onUp = () => {
      ring.style.background = hovering ? 'rgba(16,217,136,0.06)' : 'transparent'
    }

    window.addEventListener('mousemove',   onMove,  { passive: true })
    window.addEventListener('mouseover',   onOver,  { passive: true })
    window.addEventListener('mousedown',   onDown)
    window.addEventListener('mouseup',     onUp)
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove',   onMove)
      window.removeEventListener('mouseover',   onOver)
      window.removeEventListener('mousedown',   onDown)
      window.removeEventListener('mouseup',     onUp)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
    }
  }, [])

  return (
    <>
      {/* Zero-lag dot */}
      <div ref={dotRef} style={{
        position:'fixed', top:0, left:0, width:6, height:6, borderRadius:'50%',
        background:'#10d988', pointerEvents:'none', zIndex:99999,
        opacity:0, willChange:'transform',
        boxShadow:'0 0 6px rgba(16,217,136,0.8)',
      }}/>
      {/* Lagged ring */}
      <div ref={ringRef} style={{
        position:'fixed', top:0, left:0, width:32, height:32, borderRadius:'50%',
        border:'1.5px solid rgba(16,217,136,0.4)', pointerEvents:'none', zIndex:99998,
        opacity:0, willChange:'transform',
        transition:'width 0.15s ease, height 0.15s ease, border-color 0.15s ease, background 0.15s ease',
      }}/>
      {/* Soft glow */}
      <div ref={glowRef} style={{
        position:'fixed', top:0, left:0, width:80, height:80, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(16,217,136,0.05) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:99997, opacity:0, willChange:'transform',
      }}/>
    </>
  )
}
