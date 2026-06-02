'use client'
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef  = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = -100, my = -100, fx = -100, fy = -100
    let hovering = false
    let clicking = false
    let animId: number

    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
    }
    const down  = () => { clicking = true;  update() }
    const up    = () => { clicking = false; update() }
    const enter = () => { hovering = true;  update() }
    const leave = () => { hovering = false; update() }

    const update = () => {
      const c = cursorRef.current
      const f = followerRef.current
      if (!c || !f) return
      c.style.transform  = `translate(${mx - 4}px, ${my - 4}px) scale(${clicking ? 0.7 : 1})`
      f.style.transform  = `translate(${fx - 14}px, ${fy - 14}px) scale(${hovering ? 1.6 : clicking ? 0.8 : 1})`
      f.style.opacity    = hovering ? '0.4' : '0.15'
      f.style.borderColor = hovering ? '#10d988' : '#8b5cf6'
    }

    const loop = () => {
      fx += (mx - fx) * 0.12
      fy += (my - fy) * 0.12
      update()
      animId = requestAnimationFrame(loop)
    }

    const INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,[data-hover]'
    const els = document.querySelectorAll(INTERACTIVE)
    els.forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave) })

    document.addEventListener('mousemove', move)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup',   up)
    animId = requestAnimationFrame(loop)

    const obs = new MutationObserver(() => {
      document.querySelectorAll(INTERACTIVE).forEach(el => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
      })
    })
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup',   up)
      cancelAnimationFrame(animId)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cx-emerald z-[9999] pointer-events-none transition-transform duration-75"
        style={{ willChange:'transform', mixBlendMode:'normal', boxShadow:'0 0 8px rgba(16,217,136,0.8)' }}/>
      {/* Ring */}
      <div ref={followerRef} className="fixed top-0 left-0 w-7 h-7 rounded-full border-2 z-[9998] pointer-events-none transition-all duration-150"
        style={{ willChange:'transform', borderColor:'#8b5cf6' }}/>
    </>
  )
}
