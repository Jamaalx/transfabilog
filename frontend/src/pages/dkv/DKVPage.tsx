import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dkvApi, vehiclesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Fuel,
  Truck,
  FileSpreadsheet,
  Euro,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Link,
  Plus,
  Clock,
  CreditCard,
  MapPin,
  X,
  Ban,
  FileText,
  Globe,
  Receipt,
} from 'lucide-react'

interface DKVTransaction {
  id: string
  transaction_time: string
  transaction_date?: string // Verag uses transaction_date
  transaction_number: string
  station_name: string
  station_city: string
  country: string
  country_code?: string
  cost_group: string
  goods_type: string
  product_type?: string // Eurowag uses product_type
  service_type?: string // Eurowag service type (FUEL, TOLL, etc)
  location?: string // Eurowag location field
  quantity: number
  unit: string
  price_per_unit: number
  net_purchase_value: number
  net_purchase_value_eur?: number
  net_base_value: number
  net_amount?: number // Eurowag net amount (original)
  net_amount_eur?: number // Eurowag net amount EUR
  gross_value?: number
  gross_value_eur?: number
  gross_amount?: number // Eurowag gross amount (original)
  gross_amount_eur?: number // Eurowag gross amount EUR
  payment_value: number
  payment_value_eur?: number
  payment_currency: string
  original_currency?: string
  exchange_rate?: number
  exchange_rate_date?: string
  vehicle_registration: string
  card_number: string
  status: 'pending' | 'matched' | 'unmatched' | 'created_expense' | 'ignored'
  truck_id: string | null
  truck?: { id: string; registration_number: string; brand: string }
  batch?: { id: string; file_name: string; import_date: string }
  provider?: string
  vat_amount?: number
  vat_amount_eur?: number
  vat_amount_original?: number
  vat_rate?: number
  vat_country?: string
  vat_country_rate?: number
  vat_refundable?: boolean
  notes?: string
  route_info?: string // Verag route info
}

interface DKVBatch {
  id: string
  file_name: string
  import_date: string
  total_transactions: number
  matched_transactions: number
  unmatched_transactions: number
  total_amount: number
  total_vat?: number
  currency: string
  period_start: string
  period_end: string
  status: string
  provider?: string
  notes?: string
}

interface DKVSummary {
  total_transactions: number
  pending: number
  matched: number
  unmatched: number
  created_expense: number
  ignored: number
  total_value: number
  pending_value: number
}

interface FuelReportPageProps {
  provider?: 'dkv' | 'eurowag' | 'verag' | 'all'
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'In Asteptare', color: 'bg-blue-100 text-blue-800', icon: Clock },
  matched: { label: 'Asociat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  unmatched: { label: 'Neasociat', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  created_expense: { label: 'Cheltuiala Creata', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  ignored: { label: 'Ignorat', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

const providerConfig: Record<string, { name: string; color: string; bgColor: string; icon: React.ElementType; fileTypes: string }> = {
  dkv: { name: 'DKV', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: Fuel, fileTypes: '.xlsx,.xls,.csv' },
  eurowag: { name: 'EUROWAG', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: CreditCard, fileTypes: '.xlsx,.xls' },
  verag: { name: 'VERAG Maut', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: Receipt, fileTypes: '.pdf' },
}

export default function DKVPage({ provider = 'dkv' }: FuelReportPageProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'batches'>('transactions')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTx, setSelectedTx] = useState<string[]>([])
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null)
  const [summaryFilter, setSummaryFilter] = useState<'latest' | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const config = providerConfig[provider] || providerConfig.dkv

  // Fetch summary
  const { data: summary, error: summaryError, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<DKVSummary>({
    queryKey: ['dkv-summary', provider, summaryFilter],
    queryFn: async () => {
      const res = await dkvApi.getSummary(
        provider !== 'all' ? provider : undefined,
        summaryFilter === 'latest' ? { latest: true } : undefined
      )
      return res.data
    },
    retry: 2,
  })

  // Fetch transactions
  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = useQuery({
    queryKey: ['dkv-transactions', page, statusFilter, provider],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 50 }
      // If a specific status is selected, pass it and disable hide_processed
      if (statusFilter) {
        params.status = statusFilter
        params.hide_processed = false // Show the specific status even if processed
      }
      // If "all" is selected (including processed), disable hide_processed
      if (statusFilter === 'all') {
        delete params.status
        params.hide_processed = false
      }
      if (provider !== 'all') params.provider = provider
      const res = await dkvApi.getTransactions(params)
      return res.data
    },
    enabled: activeTab === 'transactions',
    retry: 2,
  })

  // Fetch batches
  const { data: batchData, isLoading: batchLoading, error: batchError, refetch: refetchBatches } = useQuery({
    queryKey: ['dkv-batches', provider],
    queryFn: async () => {
      const res = await dkvApi.getBatches(provider !== 'all' ? provider : undefined)
      return res.data
    },
    enabled: activeTab === 'batches',
    retry: 2,
  })

  // Fetch trucks for matching (silent error - not critical)
  const { data: trucksData } = useQuery({
    queryKey: ['trucks-for-dkv'],
    queryFn: async () => {
      const res = await vehiclesApi.getTrucks({ limit: 100 })
      return res.data
    },
    retry: 2,
  })

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await dkvApi.import(formData, provider)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-batches'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
      // Auto-switch to show only the latest import after successful import
      setSummaryFilter('latest')
    },
  })

  // Match mutation
  const matchMutation = useMutation({
    mutationFn: async ({ txId, truckId }: { txId: string; truckId: string }) => {
      const res = await dkvApi.matchTransaction(txId, truckId, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
      setMatchingTxId(null)
    },
  })

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (txId: string) => {
      const res = await dkvApi.createExpense(txId, undefined, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
    },
  })

  // Bulk create expenses mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (txIds: string[]) => {
      const res = await dkvApi.bulkCreateExpenses(txIds, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
      setSelectedTx([])
    },
  })

  // Ignore mutation
  const ignoreMutation = useMutation({
    mutationFn: async (txId: string) => {
      const res = await dkvApi.ignoreTransaction(txId, undefined, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
    },
  })

  // Bulk ignore mutation (Reject All)
  const bulkIgnoreMutation = useMutation({
    mutationFn: async (txIds: string[]) => {
      const res = await dkvApi.bulkIgnoreTransactions(txIds, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
      setSelectedTx([])
    },
  })

  // Bulk delete mutation (permanently delete ignored transactions)
  const bulkDeleteMutation = useMutation({
    mutationFn: async (status: 'ignored' | 'all') => {
      const res = await dkvApi.bulkDeleteTransactions(status, provider !== 'all' ? provider : undefined)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-batches'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
      alert(`Sterse ${data?.deleted || 0} tranzactii: ${data?.message || 'OK'}`)
    },
    onError: (error: Error) => {
      console.error('Bulk delete error:', error)
      alert(`Eroare la stergere: ${error.message}`)
    },
  })

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      await dkvApi.deleteBatch(batchId, provider !== 'all' ? provider : undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-batches'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
    },
  })

  const transactions: DKVTransaction[] = txData?.data || []
  const pagination = txData?.pagination || { page: 1, totalPages: 1, total: 0 }
  const batches: DKVBatch[] = batchData?.data || []
  const trucks = trucksData?.data || []

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleSelectTx = (id: string) => {
    setSelectedTx((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleBulkCreateExpenses = () => {
    const matchedIds = selectedTx.filter((id) => {
      const tx = transactions.find((t) => t.id === id)
      return tx && tx.status === 'matched'
    })
    if (matchedIds.length > 0) {
      bulkCreateMutation.mutate(matchedIds)
    }
  }

  const handleRejectAll = () => {
    const toRejectIds = selectedTx.length > 0
      ? selectedTx.filter((id) => {
          const tx = transactions.find((t) => t.id === id)
          return tx && ['pending', 'matched', 'unmatched'].includes(tx.status)
        })
      : transactions
          .filter((tx) => ['pending', 'matched', 'unmatched'].includes(tx.status))
          .map((tx) => tx.id)

    if (toRejectIds.length > 0) {
      if (confirm(`Sigur doriti sa refuzati ${toRejectIds.length} tranzactii? Acestea vor fi marcate ca ignorate.`)) {
        bulkIgnoreMutation.mutate(toRejectIds)
      }
    }
  }

  const getProviderBadge = (prov?: string) => {
    const p = prov || 'dkv'
    const cfg = providerConfig[p]
    if (!cfg) return null
    return (
      <Badge variant="outline" className={`${cfg.bgColor} ${cfg.color} border`}>
        {cfg.name}
      </Badge>
    )
  }

  // Determine if this is a toll page (VERAG) vs fuel page (DKV/EUROWAG)
  const isTollProvider = provider === 'verag'
  const pageTitle = isTollProvider ? 'Rapoarte Taxe Drum (Maut)' : `Rapoarte ${config.name}`
  const pageDesc = isTollProvider
    ? 'Importa si gestioneaza taxele de drum VERAG'
    : `Importa si gestioneaza tranzactiile de carburant ${config.name}`

  return (
    <div className="p-6">
      {/* Header with provider-specific styling */}
      <div className={`rounded-lg border p-4 mb-6 ${config.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${config.color}`}>
              <config.icon className="h-6 w-6" />
              {pageTitle}
            </h1>
            <p className="text-muted-foreground mt-1">{pageDesc}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={config.fileTypes}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="bg-white hover:bg-gray-50 text-gray-900 border"
            >
              {importMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importa Raport {config.name}
            </Button>
          </div>
        </div>
      </div>

      {/* Import Success/Error Message */}
      {importMutation.isSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Import finalizat cu succes!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {importMutation.data.total_transactions} tranzactii importate,{' '}
            {importMutation.data.matched_transactions} asociate automat,{' '}
            {importMutation.data.unmatched_transactions} necesita asociere manuala
            {importMutation.data.total_vat_eur > 0 && (
              <> | TVA total: {importMutation.data.total_vat_eur?.toFixed(2)} EUR</>
            )}
          </p>
        </div>
      )}

      {importMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Eroare la import</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {(importMutation.error as Error)?.message || 'A aparut o eroare'}
          </p>
        </div>
      )}

      {/* Query Errors */}
      {(summaryError || txError) && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Eroare la incarcarea datelor</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchSummary()
                refetchTx()
              }}
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <Loader2 className="mr-1 h-3 w-3" />
              Reincearca
            </Button>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            {(summaryError as Error)?.message || (txError as Error)?.message || 'Verificati conexiunea si incercati din nou'}
          </p>
        </div>
      )}

      {/* Summary Filter & Cards */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-muted-foreground">Statistici pentru:</span>
        <select
          value={summaryFilter}
          onChange={(e) => setSummaryFilter(e.target.value as 'latest' | 'all')}
          className="border rounded-md px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">Toate importurile</option>
          <option value="latest">Ultimul import</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.total_transactions || 0}</div>
            <div className="text-sm text-muted-foreground">Total Tranzactii</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{summary?.matched || 0}</div>
            <div className="text-sm text-muted-foreground">Asociate</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{summary?.unmatched || 0}</div>
            <div className="text-sm text-muted-foreground">Neasociate</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{summary?.created_expense || 0}</div>
            <div className="text-sm text-muted-foreground">Cheltuieli Create</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{summary?.ignored || 0}</div>
            <div className="text-sm text-muted-foreground">Refuzate</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {summary?.total_value?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} EUR
            </div>
            <div className="text-sm text-muted-foreground">Valoare Totala</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {summary?.pending_value?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} EUR
            </div>
            <div className="text-sm text-muted-foreground">De Procesat</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('transactions')}
        >
          {isTollProvider ? <Globe className="mr-2 h-4 w-4" /> : <Fuel className="mr-2 h-4 w-4" />}
          Tranzactii
        </Button>
        <Button
          variant={activeTab === 'batches' ? 'default' : 'outline'}
          onClick={() => setActiveTab('batches')}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Importuri
        </Button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* Filters & Actions */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">De procesat (activi)</option>
                  <option value="pending">In Asteptare</option>
                  <option value="matched">Asociate</option>
                  <option value="unmatched">Neasociate</option>
                  <option value="created_expense">Cheltuieli Create</option>
                  <option value="ignored">Ignorate</option>
                  <option value="all">Toate (inclusiv procesate)</option>
                </select>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Delete Ignored Button - only show when there are ignored transactions */}
                  {(summary?.ignored || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Sigur doriti sa stergeti PERMANENT ${summary?.ignored} tranzactii refuzate? Aceasta actiune nu poate fi anulata!`)) {
                          bulkDeleteMutation.mutate('ignored')
                        }
                      }}
                      disabled={bulkDeleteMutation.isPending}
                      className="text-red-700 hover:text-red-800 hover:bg-red-100 border-red-300"
                    >
                      {bulkDeleteMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Sterge {summary?.ignored} Refuzate
                    </Button>
                  )}

                  {/* Reject All Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    disabled={bulkIgnoreMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {bulkIgnoreMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="mr-2 h-4 w-4" />
                    )}
                    {selectedTx.length > 0 ? `Refuza ${selectedTx.length} selectate` : 'Refuza Toate'}
                  </Button>

                  {selectedTx.length > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {selectedTx.length} selectate
                      </span>
                      <Button
                        size="sm"
                        onClick={handleBulkCreateExpenses}
                        disabled={bulkCreateMutation.isPending}
                      >
                        {bulkCreateMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Creeaza Cheltuieli
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isTollProvider ? <Receipt className="h-5 w-5" /> : <Fuel className="h-5 w-5" />}
                Tranzactii {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <config.icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Nu exista tranzactii {config.name}</p>
                  <p className="text-muted-foreground mb-4">Importa un raport {config.name} pentru a incepe</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedTx.length === transactions.length && transactions.length > 0}
                            onChange={() => {
                              if (selectedTx.length === transactions.length) {
                                setSelectedTx([])
                              } else {
                                setSelectedTx(transactions.map((t) => t.id))
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-3">Data</th>
                        {isTollProvider ? (
                          <>
                            <th className="text-left p-3">Tara</th>
                            <th className="text-left p-3">Tip Taxa</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left p-3">Statie</th>
                            <th className="text-left p-3">Produs</th>
                            <th className="text-left p-3">Cantitate</th>
                          </>
                        )}
                        <th className="text-left p-3">Netto</th>
                        <th className="text-left p-3">TVA</th>
                        <th className="text-left p-3">Brutto</th>
                        <th className="text-left p-3">Vehicul</th>
                        <th className="text-left p-3">Camion Asociat</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const status = statusConfig[tx.status] || statusConfig.pending
                        const StatusIcon = status.icon
                        return (
                          <tr key={tx.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedTx.includes(tx.id)}
                                onChange={() => toggleSelectTx(tx.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                {formatDate(tx.transaction_time || tx.transaction_date || '')}
                              </div>
                            </td>
                            {isTollProvider ? (
                              <>
                                <td className="p-3">
                                  <Badge variant="outline" className="font-mono">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {tx.country}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">{tx.product_type || tx.goods_type || tx.cost_group}</div>
                                  {(tx.route_info || tx.notes) && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{tx.route_info || tx.notes}</div>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-3">
                                  <div className="font-medium">{tx.station_name || tx.location || '-'}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {tx.station_city ? `${tx.station_city}, ` : ''}{tx.country}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">{tx.product_type || tx.goods_type || tx.cost_group}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">
                                    {tx.quantity?.toFixed(2)} {tx.unit}
                                  </div>
                                  {tx.price_per_unit && (
                                    <div className="text-sm text-muted-foreground">
                                      @ {tx.price_per_unit?.toFixed(4)} {tx.payment_currency}
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="p-3">
                              <div className="font-medium">
                                {(tx.net_amount_eur || tx.net_purchase_value_eur || tx.net_base_value || tx.net_amount || tx.net_purchase_value)?.toFixed(2)} EUR
                              </div>
                              {tx.original_currency && tx.original_currency !== 'EUR' && (
                                <div className="text-xs text-muted-foreground">
                                  ({(tx.net_amount || tx.net_purchase_value)?.toFixed(2)} {tx.original_currency})
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                {(tx.vat_amount_eur || tx.vat_amount)?.toFixed(2) || '0.00'} EUR
                                {tx.vat_rate && tx.vat_rate > 0 && (
                                  <span className="ml-1 text-xs text-blue-600 font-medium">
                                    ({tx.vat_rate.toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                              {tx.vat_country && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {tx.vat_country}
                                  {tx.vat_country_rate && (
                                    <span className="text-blue-500">
                                      (std: {tx.vat_country_rate}%)
                                    </span>
                                  )}
                                  {tx.vat_refundable && (
                                    <Badge variant="outline" className="ml-1 text-xs px-1 py-0 bg-green-50 text-green-700 border-green-200">
                                      Recuperabil
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-green-700">
                                {(tx.gross_amount_eur || tx.payment_value_eur || tx.gross_value_eur || tx.gross_amount || tx.payment_value)?.toFixed(2)} EUR
                              </div>
                              {tx.original_currency && tx.original_currency !== 'EUR' && (
                                <div className="text-xs text-muted-foreground">
                                  ({(tx.gross_amount || tx.gross_value || tx.payment_value)?.toFixed(2)} {tx.original_currency})
                                  {tx.exchange_rate && (
                                    <span className="ml-1 text-blue-500">
                                      @{tx.exchange_rate.toFixed(4)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{tx.vehicle_registration}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {matchingTxId === tx.id ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    className="border rounded px-2 py-1 text-sm"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        matchMutation.mutate({ txId: tx.id, truckId: e.target.value })
                                      }
                                    }}
                                  >
                                    <option value="">Selecteaza...</option>
                                    {trucks.map((t: { id: string; registration_number: string; brand: string }) => (
                                      <option key={t.id} value={t.id}>
                                        {t.registration_number} ({t.brand})
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMatchingTxId(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : tx.truck ? (
                                <Badge variant="outline" className="font-mono bg-green-50">
                                  <Truck className="h-3 w-3 mr-1" />
                                  {tx.truck.registration_number}
                                </Badge>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMatchingTxId(tx.id)}
                                  className="text-orange-600 hover:text-orange-700"
                                >
                                  <Link className="h-4 w-4 mr-1" />
                                  Asociaza
                                </Button>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                {tx.status === 'matched' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => createExpenseMutation.mutate(tx.id)}
                                    disabled={createExpenseMutation.isPending}
                                    title="Creeaza Cheltuiala"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                                {['pending', 'matched', 'unmatched'].includes(tx.status) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => ignoreMutation.mutate(tx.id)}
                                    title="Ignora"
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Pagina {pagination.page} din {pagination.totalPages} ({pagination.total} tranzactii)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Istoricul Importurilor {config.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Nu exista importuri</p>
                <p className="text-muted-foreground mb-4">Importa primul raport {config.name}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Fisier</th>
                      <th className="text-left p-3">Provider</th>
                      <th className="text-left p-3">Data Import</th>
                      <th className="text-left p-3">Perioada</th>
                      <th className="text-left p-3">Tranzactii</th>
                      <th className="text-left p-3">Valoare</th>
                      <th className="text-left p-3">TVA</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            <span className="font-medium truncate max-w-[200px]">
                              {batch.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {getProviderBadge(batch.provider)}
                        </td>
                        <td className="p-3">
                          {new Date(batch.import_date).toLocaleDateString('ro-RO')}
                        </td>
                        <td className="p-3">
                          {batch.period_start && batch.period_end ? (
                            <span className="text-sm">
                              {new Date(batch.period_start).toLocaleDateString('ro-RO')} -{' '}
                              {new Date(batch.period_end).toLocaleDateString('ro-RO')}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="font-medium">{batch.total_transactions}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({batch.matched_transactions} asociate, {batch.unmatched_transactions} neasociate)
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">
                            {batch.total_amount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {batch.currency}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">
                            {batch.total_vat?.toLocaleString('ro-RO', { minimumFractionDigits: 2 }) || '0.00'} EUR
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={
                              batch.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : batch.status === 'partial'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {batch.status === 'completed'
                              ? 'Complet'
                              : batch.status === 'partial'
                              ? 'Partial'
                              : 'Importat'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Esti sigur ca vrei sa stergi acest import? Toate tranzactiile asociate vor fi sterse.')) {
                                deleteBatchMutation.mutate(batch.id)
                              }
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
