"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, Shield, BarChart4 } from "lucide-react"
import MoatAnalysisCard from '@/components/moat-analysis-card'
import IntrinsicValueCard from '@/components/intrinsic-value-card'
import StockHeader from '@/components/stock-header'
import StockPriceChart from '@/components/stock-price-chart'
import StockMetricsGrid from '@/components/stock-metrics-grid'

export default function StockAnalysisDashboard({ ticker }: { ticker: string }) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = (searchTicker: string) => {
    if (!searchTicker) {
      setError('Please enter a valid ticker')
      return
    }
    window.location.href = `/?ticker=${searchTicker}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Stock Analysis Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis with intrinsic value calculation and economic moat assessment
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ticker && (
          <div className="mt-8 space-y-8">
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <StockHeader ticker={ticker} />
                <StockPriceChart ticker={ticker} />
                <StockMetricsGrid ticker={ticker} />

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-auto p-1">
                    <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                      <BarChart4 className="h-4 w-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="intrinsic-value" className="flex items-center gap-2 py-3">
                      <TrendingUp className="h-4 w-4" />
                      <span>Intrinsic Value</span>
                    </TabsTrigger>
                    <TabsTrigger value="moat-analysis" className="flex items-center gap-2 py-3">
                      <Shield className="h-4 w-4" />
                      <span>Moat Analysis</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <IntrinsicValueCard ticker={ticker} compact />
                      <MoatAnalysisCard ticker={ticker} />
                    </div>
                  </TabsContent>

                  <TabsContent value="intrinsic-value" className="mt-6">
                    {/* ... other tab contents ... */}
                  </TabsContent>

                  <TabsContent value="moat-analysis" className="mt-6">
                    {/* ... other tab contents ... */}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-6 w-[180px]" />
      </div>

      <Skeleton className="h-[200px] w-full rounded-xl" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-[200px] mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-[200px] mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NoDataCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-center items-center h-40">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

