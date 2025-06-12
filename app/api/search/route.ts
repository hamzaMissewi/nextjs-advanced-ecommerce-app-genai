import { type NextRequest, NextResponse } from "next/server"
import { searchProducts, getSuggestions } from "@/lib/elasticsearch"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const suggest = searchParams.get("suggest") === "true"

    if (suggest) {
      const suggestions = await getSuggestions(query)
      return NextResponse.json({ suggestions })
    }

    const results = await searchProducts({ query })
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
