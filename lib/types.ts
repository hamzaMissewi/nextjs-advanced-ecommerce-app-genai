export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
  tags?: string[]
  popularity?: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface User {
  id: string
  email: string
  name: string
  preferences?: {
    categories: string[]
    priceRange: [number, number]
  }
}

export interface SearchResult {
  products: Product[]
  total: number
  recommendations?: Product[]
  aggregations?: any
}
