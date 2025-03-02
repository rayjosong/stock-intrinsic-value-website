"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface StockPriceChartProps {
  ticker: string
}

export default function StockPriceChart({ ticker }: StockPriceChartProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1M")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/stock/${ticker}/price-history`)
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Error fetching price data:', error)
      }
    }
    
    fetchData()
  }, [ticker])

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
  }

  const getChangeColor = () => {
    if (!data) return "text-muted-foreground"
    if (data.percentChange > 0) return "text-green-500"
    if (data.percentChange < 0) return "text-red-500"
    return "text-yellow-500"
  }

  const getChangeIcon = () => {
    if (!data) return <Minus className="h-4 w-4" />
    if (data.percentChange > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (data.percentChange < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Price Chart</CardTitle>
            <CardDescription>Historical price performance</CardDescription>
          </div>
          {!loading && data && (
            <div className="flex items-center gap-1">
              {getChangeIcon()}
              <span className={`font-bold ${getChangeColor()}`}>{Math.abs(data.percentChange).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <>
            <div className="h-[300px] w-full relative">
              <svg viewBox="0 0 1000 300" className="w-full h-full">
                {/* Chart background grid */}
                <g className="grid">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" y1={i * 75} x2="1000" y2={i * 75} stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                </g>

                {/* Price line */}
                <path
                  d={generateSvgPath(data.prices)}
                  fill="none"
                  stroke={data.percentChange >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Area under the line */}
                <path
                  d={generateAreaPath(data.prices)}
                  fill={data.percentChange >= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                />
              </svg>

              {/* Price labels */}
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-sm font-medium">
                ${data.currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="mt-4">
              <Tabs defaultValue={timeframe} onValueChange={handleTimeframeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="1D">1D</TabsTrigger>
                  <TabsTrigger value="1W">1W</TabsTrigger>
                  <TabsTrigger value="1M">1M</TabsTrigger>
                  <TabsTrigger value="3M">3M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to generate SVG path for the line chart
function generateSvgPath(prices: number[]) {
  if (!prices || prices.length === 0) return ""

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min

  // Add a small buffer to prevent the line from touching the edges
  const yScale = (val: number) => 290 - ((val - min) / (range || 1)) * 280

  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * 1000
    const y = yScale(price)
    return `${x},${y}`
  })

  return `M${points.join(" L")}`
}

// Helper function to generate SVG path for the area under the line
function generateAreaPath(prices: number[]) {
  if (!prices || prices.length === 0) return ""

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min

  // Add a small buffer to prevent the line from touching the edges
  const yScale = (val: number) => 290 - ((val - min) / (range || 1)) * 280

  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * 1000
    const y = yScale(price)
    return `${x},${y}`
  })

  // Create a path that goes from the first point, through all points, then down to the bottom and back to the start
  return `M${points[0]} L${points.join(" L")} L${1000},300 L0,300 Z`
}

