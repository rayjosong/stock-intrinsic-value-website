import StockAnalysisDashboard from '@/components/stock-analysis-dashboard'

export default function Home({ searchParams }: { searchParams: { ticker?: string } }) {
  const ticker = searchParams.ticker || 'AAPL' // Default to AAPL if no ticker provided
  
  return (
    <main className="p-4">
      <StockAnalysisDashboard ticker={ticker} />
    </main>
  )
}

