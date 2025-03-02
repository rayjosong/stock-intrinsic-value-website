import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState, useEffect } from "react"

interface StockHeaderProps {
  ticker: string
}

export default function StockHeader({ ticker }: StockHeaderProps) {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/stock/${ticker}`)
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Error fetching stock data:', error)
      }
    }
    
    fetchData()
  }, [ticker])

  const { ticker: stockTicker, name, currentPrice, currency, sector, industry, dailyChange, volume } = data || {}

  const getChangeIcon = () => {
    if (dailyChange > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (dailyChange < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  const getChangeColor = () => {
    if (dailyChange > 0) return "text-green-500"
    if (dailyChange < 0) return "text-red-500"
    return "text-yellow-500"
  }

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-lg">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full p-2">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="text-3xl font-bold">
                  {name} <span className="text-primary">{stockTicker}</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="px-2 py-1">
                  {sector}
                </Badge>
                <Badge variant="outline" className="px-2 py-1">
                  {industry}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {currentPrice?.toLocaleString("en-US", {
                  style: "currency",
                  currency: currency || "USD",
                })}
              </div>
              <div className="flex items-center justify-end gap-1 mt-1">
                {getChangeIcon()}
                <span className={`font-medium ${getChangeColor()}`}>
                  {Math.abs(dailyChange || 0).toFixed(2)}% Today
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Volume: {(volume || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

