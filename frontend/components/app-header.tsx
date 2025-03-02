import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart4, TrendingUp, Shield, Menu } from "lucide-react"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart4 className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">
            StockAnalyzer
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-sm font-medium flex items-center gap-1 hover:text-primary transition-colors">
            <TrendingUp className="h-4 w-4" />
            Intrinsic Value
          </Link>
          <Link href="#" className="text-sm font-medium flex items-center gap-1 hover:text-primary transition-colors">
            <Shield className="h-4 w-4" />
            Moat Analysis
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Watchlist
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Portfolio
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            Sign In
          </Button>
          <Button size="sm" className="hidden md:flex">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

