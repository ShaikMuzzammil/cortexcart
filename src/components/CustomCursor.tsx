'use client'
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef  = useRef<HTMLDivElement>(null)
  const dotRef     = useRef<HTMLDivElement>(null)
  const pos        = useRef({ x: 0, y: 0 })
  const smoothPos  = useRef({ x: 0, y: 0 })
  const raf        = useRef<number>()
  const hovered    = useRef(false)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    const loop = () => {
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.12
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${smoothPos.current.x - 20}px, ${smoothPos.current.y - 20}px)`
      }
      raf.current = requestAnimationFrame(loop)
    }

    const onEnter = () => {
      hovered.current = true
      cursorRef.current?.classList.add('scale-150', 'border-cx-emerald')
    }
    const onLeave = () => {
      hovered.current = false
      cursorRef.current?.classList.remove('scale-150', 'border-cx-emerald')
    }

    window.addEventListener('mousemove', move)
    document.querySelectorAll('a,button,[role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    raf.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', move)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-cx-emerald/40 pointer-events-none z-[9999] transition-[width,height,border-color] duration-200 mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cx-emerald pointer-events-none z-[9999]"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
