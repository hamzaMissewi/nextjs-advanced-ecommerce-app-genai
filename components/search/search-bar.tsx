"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 2) {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&suggest=true`)
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          setShowSuggestions(true)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSearch = (searchQuery: string = query) => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    router.push(`/?${params.toString()}`)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => handleSearch()}>Search</Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                setQuery(suggestion)
                handleSearch(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
