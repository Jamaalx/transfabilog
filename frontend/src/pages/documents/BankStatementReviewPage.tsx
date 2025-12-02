import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { bankStatementsApi, uploadedDocumentsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Truck,
  FileText,
  Loader2,
  Check,
  X,
} from 'lucide-react'

type Payment = {
  id: string
  transaction_type: 'credit' | 'debit'
  transaction_date: string
  amount: number
  currency: string
  description: string
  counterparty: string
  ai_suggested_category: string
  expense_category: string
  status: string
  matched_invoice?: {
    id: string
    document_number: string
    amount: number
    supplier_name: string
  }
  truck?: {
    id: string
    registration_number: string
  }
}

const EXPENSE_CATEGORIES = [
  { value: 'combustibil', label: 'Combustibil', color: 'bg-orange-100 text-orange-700' },
  { value: 'taxa_drum', label: 'Taxa Drum', color: 'bg-purple-100 text-purple-700' },
  { value: 'parcare', label: 'Parcare', color: 'bg-blue-100 text-blue-700' },
  { value: 'amenzi', label: 'Amenzi', color: 'bg-red-100 text-red-700' },
  { value: 'reparatii', label: 'Reparații', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'asigurare', label: 'Asigurare', color: 'bg-teal-100 text-teal-700' },
  { value: 'diurna', label: 'Diurnă', color: 'bg-green-100 text-green-700' },
  { value: 'salariu', label: 'Salariu', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'furnizori', label: 'Furnizori', color: 'bg-gray-100 text-gray-700' },
  { value: 'leasing', label: 'Leasing', color: 'bg-pink-100 text-pink-700' },
  { value: 'utilitati', label: 'Utilități', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'chirie', label: 'Chirie', color: 'bg-amber-100 text-amber-700' },
  { value: 'taxe_stat', label: 'Taxe Stat', color: 'bg-rose-100 text-rose-700' },
  { value: 'bancar', label: 'Bancar', color: 'bg-slate-100 text-slate-700' },
  { value: 'incasare_client', label: 'Încasare Client', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'altele', label: 'Altele', color: 'bg-gray-100 text-gray-600' },
]

export default function BankStatementReviewPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'matched'>('all')

  // Get document details
  const { data: docData } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => uploadedDocumentsApi.getOne(documentId!).then((res) => res.data),
    enabled: !!documentId,
  })

  // Get payments
  const {
    data: paymentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bank-statement-payments', documentId],
    queryFn: () => bankStatementsApi.getPayments(documentId!).then((res) => res.data),
    enabled: !!documentId,
  })

  // Get stats
  const { data: statsData } = useQuery({
    queryKey: ['bank-statement-stats', documentId],
    queryFn: () => bankStatementsApi.getStats(documentId!).then((res) => res.data),
    enabled: !!documentId,
  })

  // Process bank statement mutation
  const processMutation = useMutation({
    mutationFn: () => bankStatementsApi.process(documentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-statement-payments', documentId] })
      queryClient.invalidateQueries({ queryKey: ['bank-statement-stats', documentId] })
      toast({ title: 'Succes', description: 'Extras bancar procesat cu succes' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut procesa extrasul',
        variant: 'destructive',
      })
    },
  })

  // Update payment mutation
  const updateMutation = useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: Record<string, unknown> }) =>
      bankStatementsApi.updatePayment(paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-statement-payments', documentId] })
      toast({ title: 'Succes', description: 'Tranzacție actualizată' })
    },
  })

  // Confirm payments mutation
  const confirmMutation = useMutation({
    mutationFn: (paymentIds: string[]) => bankStatementsApi.confirmPayments(paymentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-statement-payments', documentId] })
      setSelectedPayments([])
      toast({ title: 'Succes', description: 'Tranzacții confirmate' })
    },
  })

  const payments: Payment[] = paymentsData?.data || []
  const stats = statsData?.data
  const document = docData?.data

  const filteredPayments = payments.filter((p) => {
    if (filter === 'pending') return p.status === 'pending'
    if (filter === 'matched') return p.status === 'matched'
    return true
  })

  const getCategoryStyle = (category: string) => {
    return (
      EXPENSE_CATEGORIES.find((c) => c.value === category)?.color || 'bg-gray-100 text-gray-600'
    )
  }

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label || category
  }

  const handleCategoryChange = (paymentId: string, newCategory: string) => {
    updateMutation.mutate({
      paymentId,
      data: { expense_category: newCategory, status: 'matched' },
    })
  }

  const handleConfirmSelected = () => {
    if (selectedPayments.length === 0) {
      toast({ title: 'Atenție', description: 'Selectează cel puțin o tranzacție' })
      return
    }
    confirmMutation.mutate(selectedPayments)
  }

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]
    )
  }

  const selectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(filteredPayments.map((p) => p.id))
    }
  }

  // Check if document needs processing
  const needsProcessing = payments.length === 0 && document?.document_type === 'extras_bancar'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Revizuire Extras Bancar</h1>
            <p className="text-muted-foreground">{document?.original_name || document?.file_name}</p>
          </div>
        </div>
        {needsProcessing && (
          <Button onClick={() => processMutation.mutate()} disabled={processMutation.isPending}>
            {processMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesare...
              </>
            ) : (
              'Procesează Extrasul'
            )}
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-sm text-muted-foreground">Total Tranzacții</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                +{stats.totalCredits?.toLocaleString('ro-RO')}
              </div>
              <p className="text-sm text-muted-foreground">Încasări</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                -{stats.totalDebits?.toLocaleString('ro-RO')}
              </div>
              <p className="text-sm text-muted-foreground">Plăți</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.matched}</div>
              <p className="text-sm text-muted-foreground">Potrivite</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">De revizuit</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toate ({payments.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            De revizuit
          </Button>
          <Button
            variant={filter === 'matched' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('matched')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Potrivite
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedPayments.length === filteredPayments.length
              ? 'Deselectează tot'
              : 'Selectează tot'}
          </Button>
          {selectedPayments.length > 0 && (
            <Button size="sm" onClick={handleConfirmSelected} disabled={confirmMutation.isPending}>
              <Check className="h-4 w-4 mr-1" />
              Confirmă {selectedPayments.length} selectate
            </Button>
          )}
        </div>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {needsProcessing
                ? 'Apasă "Procesează Extrasul" pentru a extrage tranzacțiile'
                : 'Nu există tranzacții de afișat'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className={`${
                selectedPayments.includes(payment.id) ? 'ring-2 ring-primary' : ''
              } hover:bg-muted/50 cursor-pointer`}
              onClick={() => togglePaymentSelection(payment.id)}
            >
              <CardContent className="py-3">
                <div className="flex items-center gap-4">
                  {/* Selection checkbox visual */}
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedPayments.includes(payment.id)
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPayments.includes(payment.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Type icon */}
                  <div
                    className={`p-2 rounded-full ${
                      payment.transaction_type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {payment.transaction_type === 'credit' ? (
                      <ArrowDownCircle className="h-5 w-5" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5" />
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{payment.counterparty || 'N/A'}</span>
                      {payment.status === 'matched' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {payment.status === 'pending' && (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">{payment.transaction_date}</p>
                  </div>

                  {/* Matched entities */}
                  <div className="flex items-center gap-2">
                    {payment.truck && (
                      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        <Truck className="h-3 w-3" />
                        {payment.truck.registration_number}
                      </span>
                    )}
                    {payment.matched_invoice && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        <FileText className="h-3 w-3" />
                        {payment.matched_invoice.document_number}
                      </span>
                    )}
                  </div>

                  {/* Category selector */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={payment.expense_category || ''}
                      onChange={(e) => handleCategoryChange(payment.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border ${getCategoryStyle(
                        payment.expense_category
                      )}`}
                    >
                      <option value="">Selectează...</option>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div
                    className={`text-lg font-bold ${
                      payment.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {payment.transaction_type === 'credit' ? '+' : '-'}
                    {payment.amount?.toLocaleString('ro-RO')} {payment.currency}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
