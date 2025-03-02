"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp } from "lucide-react"

interface SearchBarProps {
  onSearch: (ticker: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [ticker, setTicker] = useState("")
  const [recentSearches] = useState(["AAPL", "MSFT", "GOOGL", "AMZN"])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase())
    }
  }

  const handleQuickSearch = (quickTicker: string) => {
    setTicker(quickTicker)
    onSearch(quickTicker)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-2 focus-visible:ring-primary"
          />
        </div>
        <Button type="submit" disabled={!ticker.trim()} size="lg" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Analyze
        </Button>
      </form>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Try:</span>
        {recentSearches.map((search) => (
          <Button
            key={search}
            variant="outline"
            size="sm"
            onClick={() => handleQuickSearch(search)}
            className="rounded-full"
          >
            {search}
          </Button>
        ))}
      </div>
    </div>
  )
}

