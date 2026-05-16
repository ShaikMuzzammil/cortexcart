'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── useDebounce ─────────────────────────────
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── useProducts ─────────────────────────────
export function useProducts(params: Record<string, string> = {}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`/api/products?${qs}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProducts(data.products)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch_() }, [fetch_])
  return { products, loading, error, total, refetch: fetch_ }
}

// ─── useSearch ───────────────────────────────
export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) { setResults([]); return }
    let cancelled = false
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setResults(d.results || []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  return { query, setQuery, results, loading, clear: () => { setQuery(''); setResults([]) } }
}

// ─── useRecommendations ──────────────────────
export function useRecommendations(options: { exclude?: string; category?: string; cluster?: string } = {}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (options.exclude)  params.set('exclude', options.exclude)
    if (options.category) params.set('category', options.category)
    if (options.cluster)  params.set('cluster', options.cluster)

    fetch(`/api/recommendations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [options.exclude, options.category, options.cluster])

  return { products, loading }
}

// ─── useLocalStorage ─────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

  const setValue = (value: T) => {
    try {
      setStored(value)
      if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }

  return [stored, setValue] as const
}

// ─── useIntersectionObserver ─────────────────
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
