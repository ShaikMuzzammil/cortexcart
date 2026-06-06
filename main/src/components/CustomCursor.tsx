'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const cursorRef  = useRef<HTMLDivElement>(null)
  const dotRef     = useRef<HTMLDivElement>(null)
  const [visible,  setVisible]  = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [text,     setText]     = useState('')

  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  // Ring follows with spring lag
  const rx = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.5 })
  const ry = useSpring(my, { stiffness: 200, damping: 22, mass: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX); my.set(e.clientY)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px,${e.clientY - 3}px,0)`
      }
      setVisible(true)
    }

    const onDown = () => setClicking(true)
    const onUp   = () => setClicking(false)
    const onLeave= () => setVisible(false)
    const onEnter= () => setVisible(true)

    const onHoverEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const isLink    = t.closest('a,button,[data-cursor]')
      const cursorTxt = (isLink as HTMLElement)?.dataset?.cursor || ''
      setHovering(!!isLink)
      setText(cursorTxt)
    }
    const onHoverLeave = () => { setHovering(false); setText('') }

    window.addEventListener('mousemove',   onMove)
    window.addEventListener('mousedown',   onDown)
    window.addEventListener('mouseup',     onUp)
    document.addEventListener('mouseleave',onLeave)
    document.addEventListener('mouseenter',onEnter)
    document.addEventListener('mouseover', onHoverEnter)
    document.addEventListener('mouseout',  onHoverLeave)

    return () => {
      window.removeEventListener('mousemove',   onMove)
      window.removeEventListener('mousedown',   onDown)
      window.removeEventListener('mouseup',     onUp)
      document.removeEventListener('mouseleave',onLeave)
      document.removeEventListener('mouseenter',onEnter)
      document.removeEventListener('mouseover', onHoverEnter)
      document.removeEventListener('mouseout',  onHoverLeave)
    }
  }, [])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Dot — follows cursor exactly (raw CSS for zero lag) */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] transition-opacity duration-200"
        style={{
          width:6, height:6, borderRadius:'50%',
          background:'#10d988',
          willChange:'transform',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Ring — spring-lagged follower */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99998] flex items-center justify-center"
        style={{
          x: rx, y: ry,
          translateX: '-50%', translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width:  clicking ? 20 : hovering ? 48 : 32,
          height: clicking ? 20 : hovering ? 48 : 32,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            border: `1.5px solid ${hovering ? 'rgba(16,217,136,0.7)' : 'rgba(16,217,136,0.35)'}`,
            background: clicking ? 'rgba(16,217,136,0.15)' : hovering ? 'rgba(16,217,136,0.08)' : 'transparent',
            backdropFilter: hovering ? 'blur(4px)' : 'none',
          }}
          animate={{ scale: clicking ? 0.85 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {text && (
            <span style={{ fontSize: 8, fontWeight: 800, color: '#10d988', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
              {text}
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* Trail glow — subtle glow that fades */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99997] rounded-full"
        style={{
          x: rx, y: ry,
          translateX: '-50%', translateY: '-50%',
          width: 80, height: 80,
          background: 'radial-gradient(circle, rgba(16,217,136,0.06) 0%, transparent 70%)',
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  )
}
