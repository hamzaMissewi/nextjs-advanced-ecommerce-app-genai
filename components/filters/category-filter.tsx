"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Beauty", "Toys", "Automotive"]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === selectedCategory) {
      params.delete("category")
      setSelectedCategory("")
    } else {
      params.set("category", category)
      setSelectedCategory(category)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleCategoryChange(category)}
          >
            {category}
            {selectedCategory === category && (
              <Badge variant="secondary" className="ml-auto">
                ✓
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {selectedCategory && (
        <Button variant="outline" className="w-full" onClick={() => handleCategoryChange("")}>
          Clear Filter
        </Button>
      )}
    </div>
  )
}
