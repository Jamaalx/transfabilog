import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  MessageSquare,
  Send,
  RefreshCw,
  Truck,
  Users,
  Route,
  Euro,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Bot,
  User,
  BarChart3,
  ShieldAlert,
  Rocket,
  FileText,
} from 'lucide-react'

// Section configuration for insights parsing
interface InsightSection {
  id: string
  title: string
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  iconBgColor: string
  content: string[]
}

// Parse insights markdown text into structured sections
function parseInsights(insightsText: string): InsightSection[] {
  if (!insightsText) return []

  const sections: InsightSection[] = []
  const sectionConfig: Record<string, { icon: React.ReactNode; bgColor: string; borderColor: string; iconBgColor: string }> = {
    'ANALIZĂ GENERALĂ': {
      icon: <BarChart3 className="h-5 w-5" />,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    },
    'INSIGHTS': {
      icon: <Lightbulb className="h-5 w-5" />,
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconBgColor: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
    },
    'RISCURI ȘI ATENȚIONĂRI': {
      icon: <ShieldAlert className="h-5 w-5" />,
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      iconBgColor: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    },
    'RECOMANDĂRI CONCRETE': {
      icon: <Target className="h-5 w-5" />,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBgColor: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    },
    'OPORTUNITĂȚI DE OPTIMIZARE': {
      icon: <Rocket className="h-5 w-5" />,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBgColor: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    },
  }

  // Split by ### headers
  const parts = insightsText.split(/###\s*/)

  parts.forEach((part) => {
    if (!part.trim()) return

    // Extract section title (first line, remove emoji)
    const lines = part.split('\n')
    const titleLine = lines[0]?.replace(/[📊💡⚠️🎯📈🔍✨]/g, '').trim()

    if (!titleLine) return

    // Find matching config
    const configKey = Object.keys(sectionConfig).find(key =>
      titleLine.toUpperCase().includes(key)
    )

    if (!configKey) return

    const config = sectionConfig[configKey]

    // Parse content lines (bullet points)
    const content: string[] = []
    lines.slice(1).forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Remove bullet markers and clean up
      const cleanLine = trimmedLine
        .replace(/^[-•*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .trim()

      if (cleanLine) {
        content.push(cleanLine)
      }
    })

    if (content.length > 0) {
      sections.push({
        id: configKey.toLowerCase().replace(/\s+/g, '-'),
        title: configKey.charAt(0) + configKey.slice(1).toLowerCase(),
        icon: config.icon,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        iconBgColor: config.iconBgColor,
        content,
      })
    }
  })

  return sections
}

// Single insight section card component (used inside Accordion)
function InsightSectionContent({ section }: { section: InsightSection }) {
  return (
    <ul className="space-y-3 px-4 pb-4">
      {section.content.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <div className="mt-1.5 h-2 w-2 rounded-full bg-current opacity-40 flex-shrink-0" />
          <span className="text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Recommendation {
  category: string
  priority: string
  title: string
  description: string
  potentialSavings: number
}

export default function AIAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('insights')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch AI insights
  const {
    data: insightsData,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch data summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['ai-data-summary'],
    queryFn: () => aiApi.getDataSummary(),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch predictions
  const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: () => aiApi.getPredictions(),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiApi.getRecommendations(),
    staleTime: 5 * 60 * 1000,
  })

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      aiApi.chat(
        message,
        chatMessages.map((m) => ({ role: m.role, content: m.content }))
      ),
    onSuccess: (response) => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp,
        },
      ])
    },
  })

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, userMessage])
    chatMutation.mutate(inputMessage)
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const summary = summaryData?.data
  const insights = insightsData?.data
  const predictions = predictionsData?.data
  const recommendations = recommendationsData?.data

  // Parse insights into structured sections
  const parsedInsights = useMemo(() => {
    if (!insights?.insights) return []
    return parseInsights(insights.insights)
  }, [insights?.insights])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgentă':
        return 'bg-red-500'
      case 'ridicată':
        return 'bg-orange-500'
      case 'medie':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Analytics
          </h1>
          <p className="text-muted-foreground">
            Analiză inteligentă și recomandări pentru afacerea ta
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchInsights()}
          disabled={insightsLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${insightsLoading ? 'animate-spin' : ''}`} />
          Actualizează
        </Button>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flotă</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.fleet?.totalTrucks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.fleet?.activeTrucks || 0} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Șoferi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.fleet?.totalDrivers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.fleet?.activeDrivers || 0} activi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Curse (90 zile)</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.trips?.completed || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.trips?.totalKm?.toLocaleString() || 0} km totali
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.financial?.profit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Marja: {(summary.financial?.profitMargin || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predicții
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recomandări
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat AI
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Analiză AI</CardTitle>
                    <CardDescription className="mt-1">
                      Insights generate automat pe baza datelor din ultimele 90 de zile
                    </CardDescription>
                  </div>
                </div>
                {insights?.generatedAt && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Ultima actualizare
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(insights.generatedAt).toLocaleString('ro-RO')}
                    </p>
                    {insights.isLocalAnalysis && (
                      <Badge variant="secondary" className="mt-1">analiză locală</Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Loading State */}
          {insightsLoading && (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="relative p-4 rounded-full bg-primary/10">
                    <Brain className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground font-medium">Se generează analiza AI...</p>
                <p className="text-sm text-muted-foreground">Aceasta poate dura câteva secunde</p>
              </CardContent>
            </Card>
          )}

          {/* Parsed Insights Sections with Smooth Accordion */}
          {!insightsLoading && parsedInsights.length > 0 && (
            <Accordion
              type="multiple"
              defaultValue={parsedInsights.slice(0, 2).map(s => s.id)}
              className="space-y-3"
            >
              {parsedInsights.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className={`${section.bgColor} ${section.borderColor} border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md`}
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${section.iconBgColor}`}>
                        {section.icon}
                      </div>
                      <span className="text-lg font-semibold">{section.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {section.content.length} {section.content.length === 1 ? 'punct' : 'puncte'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <InsightSectionContent section={section} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Empty State */}
          {!insightsLoading && parsedInsights.length === 0 && !insights?.insights && (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="p-4 rounded-full bg-muted inline-block mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">Nu sunt disponibile insights</p>
                <p className="text-muted-foreground mt-1">
                  Adaugă date despre flotă, curse și tranzacții pentru a genera analize
                </p>
              </CardContent>
            </Card>
          )}

          {/* Fallback for unparseable insights */}
          {!insightsLoading && insights?.insights && parsedInsights.length === 0 && (
            <Card>
              <CardContent className="py-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap">{insights.insights}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Luna Viitoare
                </CardTitle>
                <CardDescription>Estimări pentru următoarele 30 de zile</CardDescription>
              </CardHeader>
              <CardContent>
                {predictionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : predictions?.predictions?.nextMonth ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Venit estimat</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(predictions.predictions.nextMonth.estimatedRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cheltuieli estimate</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(predictions.predictions.nextMonth.estimatedExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Profit estimat</span>
                      <span className="font-semibold">
                        {formatCurrency(predictions.predictions.nextMonth.estimatedProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Curse estimate</span>
                      <span className="font-semibold">
                        {predictions.predictions.nextMonth.estimatedTrips}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nu sunt disponibile predicții.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trimestrul Viitor
                </CardTitle>
                <CardDescription>Estimări pentru următoarele 90 de zile</CardDescription>
              </CardHeader>
              <CardContent>
                {predictionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : predictions?.predictions?.nextQuarter ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Venit estimat</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(predictions.predictions.nextQuarter.estimatedRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cheltuieli estimate</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(predictions.predictions.nextQuarter.estimatedExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Profit estimat</span>
                      <span className="font-semibold">
                        {formatCurrency(predictions.predictions.nextQuarter.estimatedProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Curse estimate</span>
                      <span className="font-semibold">
                        {predictions.predictions.nextQuarter.estimatedTrips}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nu sunt disponibile predicții.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trends */}
          {predictions?.predictions?.trends && (
            <Card>
              <CardHeader>
                <CardTitle>Tendințe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        predictions.predictions.trends.revenueGrowth === 'pozitiv'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Creștere Venituri</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {predictions.predictions.trends.revenueGrowth}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        predictions.predictions.trends.expensesTrend === 'stabil'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      <Euro className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cheltuieli</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {predictions.predictions.trends.expensesTrend}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        predictions.predictions.trends.profitabilityTrend === 'bun'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Profitabilitate</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {predictions.predictions.trends.profitabilityTrend}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prediction Recommendations */}
          {predictions?.predictions?.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Atenționări
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictions.predictions.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Se încarcă recomandările...</span>
            </div>
          ) : recommendations?.recommendations?.length > 0 ? (
            <>
              {/* Total Savings Card */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Economii potențiale totale</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(recommendations.totalPotentialSavings || 0)}
                      </p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations List */}
              <div className="grid gap-4">
                {recommendations.recommendations.map((rec: Recommendation, idx: number) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        {rec.potentialSavings > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            +{formatCurrency(rec.potentialSavings)} potențial
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{rec.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Totul este în regulă!</p>
                <p className="text-muted-foreground">
                  Nu au fost identificate probleme majore sau oportunități de optimizare.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Asistent AI
              </CardTitle>
              <CardDescription>
                Întreabă-mă orice despre datele companiei tale
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Salut! Sunt asistentul AI al companiei tale.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Poți să mă întrebi despre:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputMessage('Care este profitul luna aceasta?')
                          handleSendMessage()
                        }}
                      >
                        Profitul luna aceasta
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputMessage('Cine este cel mai bun șofer?')
                          handleSendMessage()
                        }}
                      >
                        Cel mai bun șofer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputMessage('Cum pot reduce cheltuielile?')
                          handleSendMessage()
                        }}
                      >
                        Reducere cheltuieli
                      </Button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${
                        msg.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2 pt-4 border-t mt-4">
                <Input
                  placeholder="Scrie un mesaj..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
