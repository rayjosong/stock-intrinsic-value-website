import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Award,
  Network,
  DollarSign,
  BlocksIcon as BarrierBlock,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"

interface PillarScore {
  explanation: string;
  score: number;
}

interface MoatAnalysisResponse {
  company: string;
  moat_strength: string;
  moat_score: number;
  confidence_score: number;
  moat_analysis: {
    brand_power: PillarScore;
    network_effects: PillarScore;
    cost_advantages: PillarScore;
    efficient_scale: PillarScore;
    intangible_assets: PillarScore;
  };
  data_sources: {
    company_name: string;
    financial_data: string;
    moat_analysis: string;
  };
}

interface MoatAnalysisCardProps {
  ticker: string
}

const fetchMoatAnalysis = async (ticker: string) => {
  if (!ticker) {
    console.error('Ticker is undefined')
    return null
  }

  try {
    const response = await fetch(`http://localhost:8000/api/v1/moat-analysis/${ticker}`)
    if (!response.ok) {
      throw new Error('Failed to fetch moat analysis')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default function MoatAnalysisCard({ ticker }: MoatAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<MoatAnalysisResponse | null>(null);

  useEffect(() => {
    if (!ticker) {
      console.error('Ticker is undefined')
      return
    }
    
    const getAnalysis = async () => {
      const data = await fetchMoatAnalysis(ticker)
      if (data) {
        setAnalysis(data)
      }
    }
    getAnalysis()
  }, [ticker])

  if (!analysis) return <div>Loading...</div>;

  const { company, moat_strength, moat_score, confidence_score, moat_analysis, data_sources } = analysis;

  const getMoatColor = () => {
    if (moat_strength === "Strong") return "bg-green-500"
    if (moat_strength === "Moderate") return "bg-yellow-500"
    return "bg-red-500"
  }

  const getMoatBgColor = () => {
    if (moat_strength === "Strong") return "bg-green-100 dark:bg-green-900"
    if (moat_strength === "Moderate") return "bg-yellow-100 dark:bg-yellow-900"
    return "bg-red-100 dark:bg-red-900"
  }

  const getMoatTextColor = () => {
    if (moat_strength === "Strong") return "text-green-700 dark:text-green-300"
    if (moat_strength === "Moderate") return "text-yellow-700 dark:text-yellow-300"
    return "text-red-700 dark:text-red-300"
  }

  const getMoatBadgeVariant = () => {
    if (moat_strength === "Strong") return "default"
    if (moat_strength === "Moderate") return "secondary"
    return "destructive"
  }

  const getMoatIcon = () => {
    if (moat_strength === "Strong") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (moat_strength === "Moderate") return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  // Generate pillar scores - in a real app, these would come from the API
  const pillarScores = {
    brand_power: moat_analysis.brand_power,
    network_effects: moat_analysis.network_effects,
    cost_advantages: moat_analysis.cost_advantages,
    efficient_scale: moat_analysis.efficient_scale,
    intangible_assets: moat_analysis.intangible_assets,
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Economic Moat Analysis
        </CardTitle>
        <CardDescription>Competitive advantage assessment</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{company} Moat Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Overall Moat Strength</h3>
              <p className="text-lg">{moat_strength}</p>
              <p>Score: {moat_score}/10</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Confidence Score</h3>
              <p className="text-lg">{confidence_score}/10</p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(moat_analysis).map(([pillar, details]) => (
              <div key={pillar} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium capitalize">{pillar.replace('_', ' ')}</h3>
                <p className="text-sm text-gray-600">{details.explanation}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Score:</span>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${details.score * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="data-sources" className="border-b border-t-0 border-x-0">
            <AccordionTrigger className="py-4 hover:no-underline hover:bg-muted/50 px-2 rounded-md">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="font-medium">Data Sources</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              <div className="space-y-4 pt-2 bg-card p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Company Name</p>
                    <p className="text-sm">{data_sources.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Financial Data</p>
                    <p className="text-sm">{data_sources.financial_data}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Moat Analysis</p>
                    <p className="text-sm">{data_sources.moat_analysis}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

function MoatPillarCard({
  title,
  score,
  explanation,
  icon: Icon,
  className = "",
}: {
  title: string
  score: number
  explanation: string
  icon: React.ElementType
  className?: string
}) {
  const getScoreColor = () => {
    if (score >= 7) return "text-green-500"
    if (score >= 4) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBgColor = () => {
    if (score >= 7) return "bg-green-100 dark:bg-green-900"
    if (score >= 4) return "bg-yellow-100 dark:bg-yellow-900"
    return "bg-red-100 dark:bg-red-900"
  }

  return (
    <div className={`bg-card p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium">{title}</h4>
        </div>
        <div className={`font-bold text-lg ${getScoreColor()}`}>{score}/10</div>
      </div>
      <Progress value={score * 10} className="h-2 mb-3" />
      <p className="text-sm text-muted-foreground">{explanation}</p>
    </div>
  )
}

// Helper function to generate random scores for the moat pillars based on moat strength
// In a real implementation, these would come from the API
function getRandomScore(moatStrength: string) {
  if (moatStrength === "Strong") {
    return Math.floor(Math.random() * 3) + 7 // 7-10
  } else if (moatStrength === "Moderate") {
    return Math.floor(Math.random() * 3) + 4 // 4-7
  } else {
    return Math.floor(Math.random() * 3) + 1 // 1-4
  }
}

