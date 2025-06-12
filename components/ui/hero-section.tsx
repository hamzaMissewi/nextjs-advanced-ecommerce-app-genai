import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to GenAI Store</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover amazing products with AI-powered search and personalized recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-black border-white hover:bg-white hover:text-blue-600">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
