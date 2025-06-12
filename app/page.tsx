import { Suspense } from "react"
import { ProductGrid } from "@/components/products/product-grid"
import { SearchBar } from "@/components/search/search-bar"
import { CategoryFilter } from "@/components/filters/category-filter"
import { HeroSection } from "@/components/ui/hero-section"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryFilter />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <SearchBar />
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              <ProductGrid />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
