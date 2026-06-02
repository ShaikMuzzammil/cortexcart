import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatPrice(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date))
}
export function calcDiscount(original: number, current: number) {
  return Math.round(((original - current) / original) * 100)
}
export function getStockStatus(stock: number) {
  if (stock === 0)  return { label: 'Out of Stock', color: 'text-cx-rose',  bg: 'bg-cx-rose/10' }
  if (stock <= 5)   return { label: `Only ${stock} left!`, color: 'text-cx-rose', bg: 'bg-cx-rose/10' }
  if (stock <= 15)  return { label: 'Low Stock',    color: 'text-cx-gold',  bg: 'bg-cx-gold/10' }
  return { label: 'In Stock', color: 'text-cx-emerald', bg: 'bg-cx-emerald/10' }
}
export function generateOrderNumber() {
  const ts   = Date.now().toString(36).toUpperCase().slice(-5)
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CX-${ts}-${rand}`
}
export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str
}
export function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
export function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
