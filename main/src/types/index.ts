import type { Product, Category, Order, OrderItem, User, Review } from '@prisma/client'

// ─── Re-exports with relations ──────────────
export type ProductWithCategory = Product & { category: Category }

export type ProductWithReviews = Product & {
  category: Category
  reviews: (Review & { user: { name: string | null } })[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: { name: string; images: string[]; slug: string } })[]
}

// ─── Cart ────────────────────────────────────
export interface CartItemType {
  id: string
  slug: string
  name: string
  price: number
  originalPrice: number
  image: string
  quantity: number
  stock: number
  brand?: string
  dynamicPrice?: boolean
  priceReason?: string | null
}

// ─── API responses ───────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
}

export interface ProductsResponse {
  products: ProductWithCategory[]
  total: number
  limit: number
  skip: number
}

export interface SearchResult {
  id: string
  slug: string
  name: string
  brand: string | null
  currentPrice: number
  images: string[]
  rating: number
  category: { name: string }
}

// ─── Contact form ────────────────────────────
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  category: 'support' | 'partnership' | 'press' | 'general'
  priority: 'normal' | 'high' | 'urgent'
}

// ─── Checkout ────────────────────────────────
export interface CheckoutAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface CheckoutPayload {
  items: { productId: string; quantity: number; unitPrice: number }[]
  shippingAddress: CheckoutAddress
  subtotal: number
  tax: number
  shipping: number
  total: number
}

// ─── Admin ────────────────────────────────────
export interface AdminStats {
  revenue: { total: number; month: number; growth: number }
  orders: { total: number; month: number }
  users: { total: number; month: number }
  products: { total: number; lowStock: any[] }
  recentOrders: OrderWithItems[]
}
