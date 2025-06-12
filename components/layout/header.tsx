"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Menu } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export function Header() {
  const { items } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            GenAI Store
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-gray-900">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Account</span>
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="hidden sm:inline ml-2">Cart</span>
            </Button>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-gray-900 py-2">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-gray-900 py-2">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-gray-900 py-2">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 py-2">
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
