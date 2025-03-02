import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, DollarSign, Percent, Calculator, Clock } from "lucide-react"
import { useState, useEffect } from "react"

interface IntrinsicValueCardProps {
  ticker: string
  compact?: boolean
}

export default function IntrinsicValueCard({ ticker, compact = false }: IntrinsicValueCardProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/stock/${ticker}/intrinsic-value`)
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Error fetching intrinsic value:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [ticker])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data available</div>

  const { intrinsicValue, currentPrice, upside, valuation, assumptions, assumptionDetails, calculation } = data

  const upsidePercentage = upside * 100
  const isUndervalued = upsidePercentage > 0
  const isFairValued = Math.abs(upsidePercentage) < 5

  const getValuationIcon = () => {
    if (isFairValued) return <MinusIcon className="h-4 w-4" />
    return isUndervalued ? (
      <ArrowUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    )
  }

  const getValuationColor = () => {
    if (isFairValued) return "text-yellow-500"
    return isUndervalued ? "text-green-500" : "text-red-500"
  }

  const getValuationBgColor = () => {
    if (isFairValued) return "bg-yellow-100 dark:bg-yellow-900"
    return isUndervalued ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
  }

  if (compact) {
    return (
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Intrinsic Value Analysis
          </CardTitle>
          <CardDescription>Based on Discounted Cash Flow model</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Current Price</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-xl font-bold">${currentPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Intrinsic Value</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xl font-bold">${intrinsicValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`${getValuationBgColor()} ${getValuationColor()} border-none px-2 py-1`}>
                {valuation}
              </Badge>
              <div className="flex items-center gap-1">
                {getValuationIcon()}
                <span className={`text-sm font-medium ${getValuationColor()}`}>
                  {Math.abs(upsidePercentage).toFixed(1)}% {isUndervalued ? "Upside" : "Downside"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isUndervalued ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(Math.abs(upsidePercentage) * 3, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Intrinsic Value Analysis
        </CardTitle>
        <CardDescription>Based on Discounted Cash Flow model</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-1 bg-card p-4 rounded-lg border shadow-sm">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
              <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1 bg-primary/10 p-4 rounded-lg border shadow-sm">
            <p className="text-sm text-muted-foreground">Intrinsic Value</p>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-1" />
              <p className="text-3xl font-bold">${intrinsicValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge className={`${getValuationBgColor()} ${getValuationColor()} border-none px-3 py-1 text-lg`}>
                {valuation}
              </Badge>
              <div className="flex items-center gap-1">
                {getValuationIcon()}
                <span className={`text-lg font-medium ${getValuationColor()}`}>
                  {Math.abs(upsidePercentage).toFixed(1)}% {isUndervalued ? "Upside" : "Downside"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>-30%</span>
              <span>Fair Value</span>
              <span>+30%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${isUndervalued ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(Math.abs(upsidePercentage) * 1.5 + 50, 100)}%` }}
              />
            </div>
            <div className="absolute top-8 w-0.5 h-3 bg-gray-400" style={{ left: "50%" }} />
            <div
              className="absolute top-8 w-4 h-4 rounded-full border-2 border-primary bg-white transform -translate-x-1/2"
              style={{ left: `${Math.min(Math.abs(upsidePercentage) * 1.5 + 50, 100)}%` }}
            />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="assumptions" className="border-b border-t-0 border-x-0">
            <AccordionTrigger className="py-4 hover:no-underline hover:bg-muted/50 px-2 rounded-md">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="font-medium">Key Assumptions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Growth Rate</p>
                    <p className="text-2xl font-bold">{(assumptions.growthRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-2">{assumptionDetails.growthRate.explanation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assumptionDetails.growthRate.dataPoints.map((point: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/5">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Discount Rate (WACC)</p>
                    <p className="text-2xl font-bold">{(assumptions.discountRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-2">{assumptionDetails.discountRate.explanation}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk-Free Rate:</span>
                        <span className="font-medium">
                          {(assumptionDetails.discountRate.components.riskFreeRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Premium:</span>
                        <span className="font-medium">
                          {(assumptionDetails.discountRate.components.marketRiskPremium * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Beta:</span>
                        <span className="font-medium">{assumptionDetails.discountRate.components.beta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost of Debt:</span>
                        <span className="font-medium">
                          {(assumptionDetails.discountRate.components.costOfDebt * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Terminal Growth Rate</p>
                    <p className="text-2xl font-bold">{(assumptions.terminalRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-2">{assumptionDetails.terminalRate.explanation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assumptionDetails.terminalRate.dataPoints.map((point: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/5">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Projection Period</p>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-2xl font-bold">{assumptions.projectionYears} years</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {assumptionDetails.projectionYears.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calculation" className="border-b border-t-0 border-x-0">
            <AccordionTrigger className="py-4 hover:no-underline hover:bg-muted/50 px-2 rounded-md">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Calculation Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              <div className="space-y-6 pt-2">
                <div>
                  <p className="text-sm font-medium text-primary mb-3">Projected Cash Flows</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 bg-muted/50 rounded-tl-md">Year</th>
                          <th className="text-right py-2 px-2 bg-muted/50">FCF (millions)</th>
                          <th className="text-right py-2 px-2 bg-muted/50 rounded-tr-md">Present Value (millions)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.projectedCashFlows.map((flow: any, index: number) => (
                          <tr key={flow.year} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                            <td className="py-2 px-2">{flow.year}</td>
                            <td className="text-right py-2 px-2">${(flow.fcf / 1000000).toFixed(0)}</td>
                            <td className="text-right py-2 px-2">${(flow.presentValue / 1000000).toFixed(0)}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-primary/5">
                          <td className="py-2 px-2 font-medium">Sum of Present Values</td>
                          <td className="text-right py-2 px-2"></td>
                          <td className="text-right py-2 px-2 font-bold">
                            ${(calculation.sumOfPresentValues / 1000000).toFixed(0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Terminal Value (millions)</p>
                    <p className="text-2xl font-bold">
                      ${(calculation.terminalValue.presentValue / 1000000).toFixed(0)}
                    </p>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-muted-foreground">Future Value:</span>
                      <span className="font-medium">${(calculation.terminalValue.value / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Enterprise Value (millions)</p>
                    <p className="text-2xl font-bold">${(calculation.enterpriseValue / 1000000).toFixed(0)}</p>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-muted-foreground">PV + Terminal Value</span>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-1">Equity Value (millions)</p>
                    <p className="text-2xl font-bold">${(calculation.equityValue / 1000000).toFixed(0)}</p>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-muted-foreground">Enterprise Value - Debt + Cash</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">Intrinsic Value Per Share</p>
                    <p className="text-2xl font-bold">${calculation.intrinsicValuePerShare.toFixed(2)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Equity Value ÷ Shares Outstanding</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

