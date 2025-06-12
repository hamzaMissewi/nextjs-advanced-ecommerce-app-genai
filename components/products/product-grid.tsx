"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useSearchParams } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const query = searchParams.get("q") || ""
        const category = searchParams.get("category") || ""

        const response = await fetch(
          `/api/products?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>
  if (products.length === 0) return <div className="text-center">No products found</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
