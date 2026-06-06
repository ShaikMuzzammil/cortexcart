'use client'
import { useScroll, useTransform, motion } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%', background: 'linear-gradient(90deg, #10d988, #8b5cf6, #f5b731)' }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[100]"
    />
  )
}
