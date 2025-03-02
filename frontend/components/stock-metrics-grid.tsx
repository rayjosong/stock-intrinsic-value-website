import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Shield, DollarSign, Scale } from "lucide-react"
import { useState, useEffect } from "react"

interface StockMetricsGridProps {
  ticker: string
}

export default function StockMetricsGrid({ ticker }: StockMetricsGridProps) {
  const [metrics, setMetrics] = useState<any>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/stock/${ticker}/metrics`)
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }
    
    fetchData()
  }, [ticker])

  if (!metrics) return null

  const { intrinsicValue, currentPrice, upside, valuation } = metrics

  const metricsGrid = [
    {
      label: "Current Price",
      value: `$${(currentPrice || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      label: "Intrinsic Value",
      value: `$${(intrinsicValue || 0).toFixed(2)}`,
      icon: Scale,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      label: "Upside Potential",
      value: `${((upside || 0) * 100).toFixed(1)}%`,
      icon: upside > 0 ? TrendingUp : TrendingDown,
      color:
        (upside || 0) > 0
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
    {
      label: "Moat Strength",
      value: `${metrics?.moat_strength || "N/A"} (${metrics?.moat_score || 0}/10)`,
      icon: Shield,
      color:
        metrics?.moat_strength === "Strong"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          : metrics?.moat_strength === "Moderate"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsGrid.map((metric, index) => (
        <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-stretch h-full">
              <div className={`flex items-center justify-center p-4 ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 p-4">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

