import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dkvApi, vehiclesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Fuel,
  Truck,
  FileSpreadsheet,
  Calendar,
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
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  MapPin,
  Clock,
  CreditCard,
  Download,
} from 'lucide-react'

interface DKVTransaction {
  id: string
  transaction_time: string
  transaction_number: string
  station_name: string
  station_city: string
  country: string
  cost_group: string
  goods_type: string
  quantity: number
  unit: string
  price_per_unit: number
  net_purchase_value: number
  payment_currency: string
  vehicle_registration: string
  card_number: string
  status: 'pending' | 'matched' | 'unmatched' | 'created_expense' | 'ignored'
  truck_id: string | null
  truck?: { id: string; registration_number: string; brand: string }
  batch?: { id: string; file_name: string; import_date: string }
}

interface DKVBatch {
  id: string
  file_name: string
  import_date: string
  total_transactions: number
  matched_transactions: number
  unmatched_transactions: number
  total_amount: number
  currency: string
  period_start: string
  period_end: string
  status: string
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

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'In Asteptare', color: 'bg-blue-100 text-blue-800', icon: Clock },
  matched: { label: 'Asociat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  unmatched: { label: 'Neasociat', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  created_expense: { label: 'Cheltuiala Creata', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  ignored: { label: 'Ignorat', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

export default function DKVPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'batches'>('transactions')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTx, setSelectedTx] = useState<string[]>([])
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  // Fetch summary
  const { data: summary } = useQuery<DKVSummary>({
    queryKey: ['dkv-summary'],
    queryFn: async () => {
      const res = await dkvApi.getSummary()
      return res.data
    },
  })

  // Fetch transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['dkv-transactions', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 50 }
      if (statusFilter) params.status = statusFilter
      const res = await dkvApi.getTransactions(params)
      return res.data
    },
    enabled: activeTab === 'transactions',
  })

  // Fetch batches
  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ['dkv-batches'],
    queryFn: async () => {
      const res = await dkvApi.getBatches()
      return res.data
    },
    enabled: activeTab === 'batches',
  })

  // Fetch trucks for matching
  const { data: trucksData } = useQuery({
    queryKey: ['trucks-for-dkv'],
    queryFn: async () => {
      const res = await vehiclesApi.getTrucks({ limit: 100 })
      return res.data
    },
  })

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await dkvApi.import(formData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-batches'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
    },
  })

  // Match mutation
  const matchMutation = useMutation({
    mutationFn: async ({ txId, truckId }: { txId: string; truckId: string }) => {
      const res = await dkvApi.matchTransaction(txId, truckId)
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
      const res = await dkvApi.createExpense(txId)
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
      const res = await dkvApi.bulkCreateExpenses(txIds)
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
      const res = await dkvApi.ignoreTransaction(txId)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dkv-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dkv-summary'] })
    },
  })

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      await dkvApi.deleteBatch(batchId)
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
    // Only create expenses for matched transactions
    const matchedIds = selectedTx.filter((id) => {
      const tx = transactions.find((t) => t.id === id)
      return tx && tx.status === 'matched'
    })
    if (matchedIds.length > 0) {
      bulkCreateMutation.mutate(matchedIds)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6" />
            Rapoarte DKV
          </h1>
          <p className="text-muted-foreground">Importa si gestioneaza tranzactiile DKV</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Importa Raport DKV
          </Button>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.total_transactions || 0}</div>
            <div className="text-sm text-muted-foreground">Total Tranzactii</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{summary?.matched || 0}</div>
            <div className="text-sm text-muted-foreground">Asociate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{summary?.unmatched || 0}</div>
            <div className="text-sm text-muted-foreground">Neasociate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{summary?.created_expense || 0}</div>
            <div className="text-sm text-muted-foreground">Cheltuieli Create</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {summary?.total_value?.toLocaleString() || 0} EUR
            </div>
            <div className="text-sm text-muted-foreground">Valoare Totala</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {summary?.pending_value?.toLocaleString() || 0} EUR
            </div>
            <div className="text-sm text-muted-foreground">In Asteptare</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('transactions')}
        >
          <Fuel className="mr-2 h-4 w-4" />
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
          {/* Filters */}
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
                  <option value="">Toate statusurile</option>
                  <option value="pending">In Asteptare</option>
                  <option value="matched">Asociate</option>
                  <option value="unmatched">Neasociate</option>
                  <option value="created_expense">Cheltuieli Create</option>
                  <option value="ignored">Ignorate</option>
                </select>

                {selectedTx.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tranzactii DKV</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Fuel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Nu exista tranzactii DKV</p>
                  <p className="text-muted-foreground mb-4">Importa un raport DKV pentru a incepe</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedTx.length === transactions.length}
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
                        <th className="text-left p-3">Statie</th>
                        <th className="text-left p-3">Produs</th>
                        <th className="text-left p-3">Cantitate</th>
                        <th className="text-left p-3">Valoare</th>
                        <th className="text-left p-3">Vehicul DKV</th>
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
                                {formatDate(tx.transaction_time)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{tx.station_name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tx.station_city}, {tx.country}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{tx.goods_type || tx.cost_group}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">
                                {tx.quantity?.toFixed(2)} {tx.unit}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @ {tx.price_per_unit?.toFixed(4)} {tx.payment_currency}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">
                                {tx.net_purchase_value?.toFixed(2)} EUR
                              </div>
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
                                <Badge variant="outline" className="font-mono">
                                  <Truck className="h-3 w-3 mr-1" />
                                  {tx.truck.registration_number}
                                </Badge>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMatchingTxId(tx.id)}
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
                                {(tx.status === 'pending' || tx.status === 'matched' || tx.status === 'unmatched') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => ignoreMutation.mutate(tx.id)}
                                    title="Ignora"
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
            <CardTitle>Istoricul Importurilor</CardTitle>
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
                <p className="text-muted-foreground mb-4">Importa primul raport DKV</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Fisier</th>
                      <th className="text-left p-3">Data Import</th>
                      <th className="text-left p-3">Perioada</th>
                      <th className="text-left p-3">Tranzactii</th>
                      <th className="text-left p-3">Valoare</th>
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
                            {batch.total_amount?.toLocaleString()} {batch.currency}
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
