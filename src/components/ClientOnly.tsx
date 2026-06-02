'use client'
import { useEffect, useState } from 'react'
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m ? <>{children}</> : null
}
