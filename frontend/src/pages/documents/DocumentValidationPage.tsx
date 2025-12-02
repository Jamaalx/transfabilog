import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadedDocumentsApi, tripsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Building,
  Truck,
  User,
  Hash,
  Edit2,
  Check,
  X,
  Tag,
  MapPin,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Briefcase,
  Fuel,
  ExternalLink,
} from 'lucide-react'

interface BankTransaction {
  date?: string
  type: 'credit' | 'debit'
  amount: number
  description?: string
  reference?: string
  counterparty?: string
  counterparty_iban?: string
  // AI-suggested category
  ai_category?: string
  ai_category_confidence?: number
  // User-selected category (can override AI)
  category?: string
  // For matching with invoices
  matched_invoice_id?: string
  matched_invoice_number?: string
}

interface ExtractedData {
  document_number?: string
  document_date?: string
  amount?: number
  total_amount?: number
  amount_with_vat?: number
  currency?: string
  supplier_name?: string
  supplier_cui?: string
  client_name?: string
  client_cui?: string
  client_address?: string
  truck_registration?: string
  vehicle_number?: string
  driver_name?: string
  route?: string
  cmr_numbers?: string[]
  transport_date?: string
  items?: string[]
  description?: string
  // Fuel transactions
  transactions?: Array<{
    date?: string
    truck_registration?: string
    location?: string
    fuel_liters?: number
    amount?: number
    type?: string
  }>
  // Bank statement specific
  bank_statement_type?: 'per_camion' | 'administrativ'
  bank_name?: string
  account_number?: string
  opening_balance?: number
  closing_balance?: number
  total_income?: number
  total_expenses?: number
  // Bank transactions (credit/debit)
  bank_transactions?: BankTransaction[]
  [key: string]: unknown
}

interface DocumentData {
  id: string
  original_name: string
  file_name: string
  mime_type: string
  status: string
  document_type: string
  document_category: string
  document_date?: string
  document_number?: string
  amount?: number
  currency?: string
  supplier_name?: string
  supplier_cui?: string
  ai_confidence?: number
  extracted_data?: {
    raw_text?: string
    structured?: ExtractedData
    classification?: {
      document_type: string
      document_category: string
      confidence: number
      reasoning: string
    }
    bank_statement_type?: 'per_camion' | 'administrativ'
  }
  truck_id?: string
  driver_id?: string
  trip_id?: string
  truck?: { id: string; registration_number: string; brand: string }
  driver?: { id: string; first_name: string; last_name: string }
}

interface Trip {
  id: string
  origin_city: string
  destination_city: string
  departure_date: string
  status: string
  driver?: { first_name: string; last_name: string }
  truck?: { registration_number: string }
}

const typeLabels: Record<string, string> = {
  factura_intrare: 'Factura Intrare',
  factura_iesire: 'Factura Iesire',
  extras_bancar: 'Extras Bancar',
  bon_fiscal: 'Bon Fiscal',
  raport_dkv: 'Raport DKV',
  raport_eurowag: 'Raport Eurowag',
  raport_verag: 'Raport Verag',
  raport_shell: 'Raport Shell',
  raport_omv: 'Raport OMV',
  cmr: 'CMR',
  asigurare: 'Asigurare',
  itp: 'ITP',
  rovinieta: 'Rovinieta',
  altele: 'Altele',
}

const categoryLabels: Record<string, string> = {
  financial: 'Financiare',
  fuel: 'Combustibil',
  transport: 'Transport',
  fleet: 'Flota',
  hr: 'Resurse Umane',
  other: 'Altele',
}

// Expense categories for transactions
const expenseCategories = [
  { value: 'combustibil', label: 'Combustibil' },
  { value: 'furnizori', label: 'Furnizori' },
  { value: 'transport', label: 'Transport' },
  { value: 'taxa_drum', label: 'Taxe Drum' },
  { value: 'parcare', label: 'Parcare' },
  { value: 'mentenanta', label: 'Mentenanță' },
  { value: 'asigurare', label: 'Asigurare' },
  { value: 'bancar', label: 'Bancar' },
  { value: 'diverse', label: 'Diverse' },
  { value: 'altele', label: 'Altele' },
]

// Income categories for outgoing invoices (factura_iesire)
const incomeCategories = [
  { value: 'transport', label: 'Servicii Transport' },
  { value: 'transport_international', label: 'Transport Internațional' },
  { value: 'transport_intern', label: 'Transport Intern' },
  { value: 'altele', label: 'Altele' },
]

// Bank statement transaction categories - more detailed for transport
const bankDebitCategories = [
  { value: 'combustibil', label: '⛽ Combustibil', icon: '⛽' },
  { value: 'taxa_drum', label: '🛣️ Taxe Drum', icon: '🛣️' },
  { value: 'parcare', label: '🅿️ Parcare', icon: '🅿️' },
  { value: 'amenzi', label: '⚠️ Amenzi', icon: '⚠️' },
  { value: 'reparatii', label: '🔧 Reparații', icon: '🔧' },
  { value: 'asigurare', label: '🛡️ Asigurare', icon: '🛡️' },
  { value: 'diurna', label: '💰 Diurnă', icon: '💰' },
  { value: 'salariu', label: '👤 Salariu', icon: '👤' },
  { value: 'furnizori', label: '📦 Furnizori', icon: '📦' },
  { value: 'leasing', label: '🚛 Leasing', icon: '🚛' },
  { value: 'utilitati', label: '💡 Utilități', icon: '💡' },
  { value: 'chirie', label: '🏢 Chirie', icon: '🏢' },
  { value: 'taxe_stat', label: '🏛️ Taxe Stat', icon: '🏛️' },
  { value: 'bancar', label: '🏦 Bancar', icon: '🏦' },
  { value: 'altele', label: '📋 Altele', icon: '📋' },
]

const bankCreditCategories = [
  { value: 'incasare_client', label: '💵 Încasare Client', icon: '💵' },
  { value: 'rambursare', label: '↩️ Rambursare', icon: '↩️' },
  { value: 'dobanda', label: '📈 Dobândă', icon: '📈' },
  { value: 'altele', label: '📋 Altele', icon: '📋' },
]

// Get category label by value
function getCategoryLabel(category: string, type: 'credit' | 'debit'): string {
  const categories = type === 'credit' ? bankCreditCategories : bankDebitCategories
  const found = categories.find(c => c.value === category)
  return found?.label || category
}

// Get default expense category based on document type
function getDefaultExpenseCategory(documentType: string): string {
  const categoryMap: Record<string, string> = {
    factura_intrare: 'furnizori',
    factura_iesire: 'transport',
    raport_dkv: 'combustibil',
    raport_eurowag: 'combustibil',
    raport_verag: 'combustibil',
    raport_shell: 'combustibil',
    raport_omv: 'combustibil',
    extras_bancar: 'bancar',
    bon_fiscal: 'diverse',
    asigurare: 'asigurare',
    itp: 'mentenanta',
    rovinieta: 'taxa_drum',
  }
  return categoryMap[documentType] || 'altele'
}

// Check if document is a fuel report
function isFuelDocument(documentType: string): boolean {
  return ['raport_dkv', 'raport_eurowag', 'raport_verag', 'raport_shell', 'raport_omv'].includes(documentType)
}

export default function DocumentValidationPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get batch IDs if processing multiple documents
  const batchIds = searchParams.get('batch')?.split(',') || []
  const currentIndex = batchIds.length > 0 ? batchIds.indexOf(id || '') : -1

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<ExtractedData>>({})
  const [expenseCategory, setExpenseCategory] = useState<string>('')
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [createExpense, setCreateExpense] = useState(true)
  // State for bank transaction categories (user can override AI suggestions)
  const [transactionCategories, setTransactionCategories] = useState<Record<number, string>>({})

  // Fetch document details
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await uploadedDocumentsApi.getOne(id!)
      return response.data as DocumentData
    },
    enabled: !!id,
  })

  // Fetch trips for selection
  const { data: tripsData } = useQuery({
    queryKey: ['trips-for-select'],
    queryFn: async () => {
      const response = await tripsApi.getAll({ limit: 100 })
      return response.data
    },
  })

  const trips = (tripsData?.data || []) as Trip[]

  // Initialize form data when document loads
  useEffect(() => {
    if (document) {
      const structured = document.extracted_data?.structured || {}
      const isOutgoingInvoice = document.document_type === 'factura_iesire'

      setFormData({
        document_number: document.document_number || structured.document_number,
        document_date: document.document_date || structured.document_date,
        amount: document.amount || structured.amount || structured.total_amount,
        currency: document.currency || structured.currency || 'EUR',
        // For outgoing invoices, use client_name/client_cui; for incoming, use supplier
        supplier_name: isOutgoingInvoice
          ? (structured.client_name || document.supplier_name)
          : (document.supplier_name || structured.supplier_name),
        supplier_cui: isOutgoingInvoice
          ? (structured.client_cui || document.supplier_cui)
          : (document.supplier_cui || structured.supplier_cui),
        // Vehicle from either vehicle_number (factura_iesire) or truck_registration
        truck_registration: structured.vehicle_number || structured.truck_registration,
        driver_name: structured.driver_name,
        route: structured.route,
      })
      setExpenseCategory(getDefaultExpenseCategory(document.document_type))
      if (document.trip_id) {
        setSelectedTripId(document.trip_id)
      }

      // Initialize transaction categories from AI suggestions
      if (document.document_type === 'extras_bancar' && structured.transactions) {
        const initialCategories: Record<number, string> = {}
        structured.transactions.forEach((tx: Record<string, unknown>, index: number) => {
          // Use AI category if available, otherwise default to 'altele'
          initialCategories[index] = (tx.ai_category as string) || (tx.category as string) || 'altele'
        })
        setTransactionCategories(initialCategories)
      }
    }
  }, [document])

  // Confirm mutation - uses new endpoint
  const confirmMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await uploadedDocumentsApi.confirm(id!, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })

      // Show success message
      const message = data.expense
        ? `Document confirmat! ${data.expense.type === 'trip_expense' ? 'Cheltuiala trip' : 'Tranzactie'} creata cu succes.`
        : 'Document confirmat!'
      console.log(message)

      // If there are more documents in the batch, go to the next one
      if (batchIds.length > 0 && currentIndex < batchIds.length - 1) {
        const nextId = batchIds[currentIndex + 1]
        navigate(`/documents/${nextId}/validate?batch=${batchIds.join(',')}`)
      } else {
        // All done, go back to documents list
        navigate('/documents')
      }
    },
  })

  // Bank statement confirm mutation - processes all transactions
  const confirmBankStatementMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await uploadedDocumentsApi.confirmBankStatement(id!, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })

      // Show detailed success message
      const results = data.results
      console.log(
        `Extras bancar procesat: ${results?.credits?.processed || 0} intrări ` +
        `(${results?.credits?.matched_invoices?.length || 0} facturi marcate ca plătite), ` +
        `${results?.debits?.processed || 0} plăți procesate`
      )

      // If there are more documents in the batch, go to the next one
      if (batchIds.length > 0 && currentIndex < batchIds.length - 1) {
        const nextId = batchIds[currentIndex + 1]
        navigate(`/documents/${nextId}/validate?batch=${batchIds.join(',')}`)
      } else {
        // All done, go back to documents list
        navigate('/documents')
      }
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await uploadedDocumentsApi.update(id!, {
        status: 'needs_review',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      navigate('/documents')
    },
  })

  // Handler for changing transaction category
  const handleTransactionCategoryChange = (index: number, category: string) => {
    setTransactionCategories(prev => ({
      ...prev,
      [index]: category
    }))
  }

  const handleConfirm = () => {
    // Check if this is a bank statement - use special endpoint
    if (document?.document_type === 'extras_bancar') {
      const bankStatementData: Record<string, unknown> = {
        transaction_categories: transactionCategories, // Send user-modified categories
      }
      if (selectedTripId) bankStatementData.trip_id = selectedTripId
      confirmBankStatementMutation.mutate(bankStatementData)
      return
    }

    // Build request data, only including fields with actual values
    // Don't send null values as they fail validation (trip_id must be UUID if present)
    const requestData: Record<string, unknown> = {
      create_expense: createExpense,
    }

    if (formData.document_number) requestData.document_number = formData.document_number
    if (formData.document_date) requestData.document_date = formData.document_date
    if (formData.amount) requestData.amount = parseFloat(String(formData.amount))
    if (formData.currency) requestData.currency = formData.currency
    if (formData.supplier_name) requestData.supplier_name = formData.supplier_name
    if (formData.supplier_cui) requestData.supplier_cui = formData.supplier_cui
    if (expenseCategory) requestData.expense_category = expenseCategory
    if (selectedTripId) requestData.trip_id = selectedTripId
    // Send truck registration for vehicle linking (especially for factura_iesire)
    if (formData.truck_registration) requestData.truck_registration = formData.truck_registration

    confirmMutation.mutate(requestData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <p>Nu s-a putut incarca documentul</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/documents')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Inapoi la documente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const extractedData = document.extracted_data?.structured || {}
  const classification = document.extracted_data?.classification
  const isProcessed = document.status === 'processed'
  const isFailed = document.status === 'failed'
  const needsReview = document.status === 'needs_review'
  const isFuel = isFuelDocument(document.document_type)
  const hasExtractedTransactions = (extractedData.transactions?.length || 0) > 0

  // Bank statement specific
  const isBankStatement = document.document_type === 'extras_bancar'
  const bankStatementType = document.extracted_data?.bank_statement_type || extractedData.bank_statement_type || 'administrativ'

  // Process bank transactions - the AI extracts them as 'transactions' array
  const bankTransactions = isBankStatement
    ? (extractedData.transactions || []).map((tx: Record<string, unknown>) => ({
        ...tx,
        type: tx.type as 'credit' | 'debit',
        amount: Number(tx.amount) || 0,
      })) as BankTransaction[]
    : []

  // Separate into credits (intrări) and debits (plăți)
  const creditTransactions = bankTransactions.filter((tx) => tx.type === 'credit')
  const debitTransactions = bankTransactions.filter((tx) => tx.type === 'debit')
  const hasBankTransactions = bankTransactions.length > 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Validare Document</h1>
            <p className="text-muted-foreground">
              Verifica si confirma datele extrase automat
            </p>
          </div>
        </div>

        {batchIds.length > 1 && (
          <Badge variant="outline" className="text-sm">
            Document {currentIndex + 1} din {batchIds.length}
          </Badge>
        )}
      </div>

      {/* Status Banner */}
      {isFailed && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Eroare la procesare</p>
                <p className="text-sm text-red-600">
                  Documentul nu a putut fi procesat automat. Poti completa datele manual.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {needsReview && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-800">Necesita validare</p>
                <p className="text-sm text-blue-600">
                  Verifica datele extrase automat si apasa "Confirma si Salveaza" pentru a valida documentul si a crea cheltuiala.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessed && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Document validat</p>
                <p className="text-sm text-green-600">
                  Acest document a fost deja validat si salvat in baza de date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informatii Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nume fisier</label>
              <p className="font-medium">{document.original_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tip document</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {typeLabels[document.document_type] || document.document_type}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categorie</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {categoryLabels[document.document_category] || document.document_category}
                  </Badge>
                </div>
              </div>
            </div>

            {classification && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">Clasificare AI</label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Incredere:</span>
                    <Badge className={classification.confidence > 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {(classification.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{classification.reasoning}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Data Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Date Extrase
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Anuleaza
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-1" /> Editeaza
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Verifica si corecteaza datele inainte de a confirma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Number */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" /> Numar Document
              </label>
              {editMode ? (
                <Input
                  value={formData.document_number || ''}
                  onChange={(e) => handleInputChange('document_number', e.target.value)}
                  placeholder="Ex: FV-001234"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted/50 rounded">{formData.document_number || '-'}</p>
              )}
            </div>

            {/* Document Date */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data Document
              </label>
              {editMode ? (
                <Input
                  type="date"
                  value={formData.document_date || ''}
                  onChange={(e) => handleInputChange('document_date', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted/50 rounded">
                  {formData.document_date ? new Date(formData.document_date).toLocaleDateString('ro-RO') : '-'}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Suma
                </label>
                {editMode ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted/50 rounded">
                    {formData.amount ? formData.amount.toLocaleString() : '-'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Moneda</label>
                {editMode ? (
                  <select
                    value={formData.currency || 'EUR'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                  >
                    <option value="EUR">EUR</option>
                    <option value="RON">RON</option>
                    <option value="USD">USD</option>
                  </select>
                ) : (
                  <p className="mt-1 p-2 bg-muted/50 rounded">{formData.currency || 'EUR'}</p>
                )}
              </div>
            </div>

            {/* Supplier/Client - dynamic based on document type */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                {document.document_type === 'factura_iesire' ? 'Client' : 'Furnizor'}
              </label>
              {editMode ? (
                <Input
                  value={formData.supplier_name || ''}
                  onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                  placeholder={document.document_type === 'factura_iesire' ? 'Nume client' : 'Nume furnizor'}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted/50 rounded">{formData.supplier_name || '-'}</p>
              )}
            </div>

            {/* CUI - dynamic label */}
            <div>
              <label className="text-sm font-medium">
                {document.document_type === 'factura_iesire' ? 'CUI Client' : 'CUI Furnizor'}
              </label>
              {editMode ? (
                <Input
                  value={formData.supplier_cui || ''}
                  onChange={(e) => handleInputChange('supplier_cui', e.target.value)}
                  placeholder="RO12345678"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted/50 rounded">{formData.supplier_cui || '-'}</p>
              )}
            </div>

            {/* Vehicle/Truck - show for factura_iesire even if no auto-match */}
            {(formData.truck_registration || extractedData.vehicle_number || extractedData.truck_registration || document.truck) && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {document.document_type === 'factura_iesire' ? 'Vehicul Facturat' : 'Camion Asociat'}
                </label>
                {editMode ? (
                  <Input
                    value={formData.truck_registration || ''}
                    onChange={(e) => handleInputChange('truck_registration', e.target.value)}
                    placeholder="Nr. înmatriculare (ex: MS 10 TFL)"
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-blue-50 rounded flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>
                      {document.truck?.registration_number || formData.truck_registration || extractedData.vehicle_number || extractedData.truck_registration || '-'}
                    </span>
                    {document.truck && (
                      <Badge variant="outline" className="ml-auto">
                        Asociat automat
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Route - for outgoing invoices */}
            {(document.document_type === 'factura_iesire' && (formData.route || extractedData.route)) && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Rută Transport
                </label>
                {editMode ? (
                  <Input
                    value={(formData.route as string) || ''}
                    onChange={(e) => handleInputChange('route', e.target.value)}
                    placeholder="Ex: București - Berlin"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted/50 rounded">{(formData.route as string) || extractedData.route || '-'}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fuel Report - Dedicated UI - show INSTEAD of expense settings */}
      {!isProcessed && isFuel && (
        <Card className="mt-6 border-amber-200 bg-amber-50/30">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Fuel className="h-5 w-5" />
              Raport Combustibil - {typeLabels[document.document_type]}
            </CardTitle>
            <CardDescription className="text-amber-700">
              Acest document conține {extractedData.transactions?.length || 0} tranzacții de combustibil.
              Pentru gestionare avansată (asociere vehicule, creare cheltuieli individuale), folosește pagina DKV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fuel className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Gestionare Avansată Combustibil</p>
                    <p className="text-sm text-blue-600">
                      Importă acest raport în pagina DKV pentru a asocia tranzacțiile la vehicule și a crea cheltuieli individuale.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/dkv')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Mergi la DKV
                </Button>
              </div>
            </div>

            {/* Quick summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold">{extractedData.transactions?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tranzacții</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-amber-600">
                  {extractedData.transactions?.reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount || 0), 0).toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total EUR</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {extractedData.transactions?.reduce((sum: number, tx: { fuel_liters?: number }) => sum + (tx.fuel_liters || 0), 0).toFixed(0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Litri Total</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {[...new Set(extractedData.transactions?.map((tx: { truck_registration?: string }) => tx.truck_registration).filter(Boolean))].length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Vehicule</div>
              </div>
            </div>

            {/* Trip Selection for bulk expense creation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categorie Cheltuială
                </Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Asociază cu Trip (opțional)
                </Label>
                <Select
                  value={selectedTripId || '__none__'}
                  onValueChange={(val) => setSelectedTripId(val === '__none__' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fara trip - tranzactie generala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Fara trip - tranzactie generala</SelectItem>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.origin_city} → {trip.destination_city} ({new Date(trip.departure_date).toLocaleDateString('ro-RO')})
                        {trip.truck && ` - ${trip.truck.registration_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Creează cheltuială sumară</p>
                <p className="text-sm text-muted-foreground">
                  La confirmare, va fi creată o singură cheltuială cu suma totală din raport
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={createExpense}
                  onChange={(e) => setCreateExpense(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense/Income Settings Card - for NON-fuel documents only */}
      {!isProcessed && !isFuel && (
        <Card className={`mt-6 ${document.document_type === 'factura_iesire' ? 'border-green-200' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {document.document_type === 'factura_iesire' ? 'Setări Încasare' : 'Setări Cheltuială'}
            </CardTitle>
            <CardDescription>
              {document.document_type === 'factura_iesire'
                ? 'Configurează cum va fi înregistrată încasarea din această factură'
                : 'Configurează cum va fi înregistrată cheltuiala din acest document'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Expense/Income Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">
                  {document.document_type === 'factura_iesire' ? 'Creează încasare automat' : 'Creează cheltuială automat'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {document.document_type === 'factura_iesire'
                    ? 'La confirmare, va fi creată o încasare în tranzacții'
                    : `La confirmare, va fi creată o înregistrare în ${selectedTripId ? 'cheltuielile trip-ului' : 'tranzacții'}`}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={createExpense}
                  onChange={(e) => setCreateExpense(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 ${document.document_type === 'factura_iesire' ? 'peer-focus:ring-green-300 peer-checked:bg-green-600' : 'peer-focus:ring-blue-300 peer-checked:bg-blue-600'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category - different for income vs expense */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {document.document_type === 'factura_iesire' ? 'Categorie Venit' : 'Categorie Cheltuială'}
                </Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(document.document_type === 'factura_iesire' ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trip Selection - only for expenses, not for income */}
              {document.document_type !== 'factura_iesire' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Asociază cu Trip (opțional)
                </Label>
                <Select
                  value={selectedTripId || '__none__'}
                  onValueChange={(val) => setSelectedTripId(val === '__none__' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fara trip - tranzactie generala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Fara trip - tranzactie generala</SelectItem>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.origin_city} → {trip.destination_city} ({new Date(trip.departure_date).toLocaleDateString('ro-RO')})
                        {trip.truck && ` - ${trip.truck.registration_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTripId && (
                  <p className="text-xs text-muted-foreground">
                    Cheltuiala va fi adăugată la cheltuielile trip-ului selectat
                  </p>
                )}
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Transactions for Fuel Documents (NOT bank statements) */}
      {hasExtractedTransactions && !isBankStatement && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tranzactii Extrase ({extractedData.transactions?.length})</CardTitle>
            <CardDescription>Tranzactiile individuale din raportul de combustibil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Camion</th>
                    <th className="text-left p-2">Locatie</th>
                    <th className="text-left p-2">Tip</th>
                    <th className="text-right p-2">Litri</th>
                    <th className="text-right p-2">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.transactions?.map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{tx.date || '-'}</td>
                      <td className="p-2">{tx.truck_registration || '-'}</td>
                      <td className="p-2">{tx.location || '-'}</td>
                      <td className="p-2">
                        <Badge variant="outline">{tx.type || 'diesel'}</Badge>
                      </td>
                      <td className="p-2 text-right">{tx.fuel_liters?.toFixed(2) || '-'}</td>
                      <td className="p-2 text-right font-medium">{tx.amount?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Statement Transactions */}
      {isBankStatement && hasBankTransactions && (
        <div className="mt-6 space-y-6">
          {/* Bank Statement Info Header */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Extras Bancar - {bankStatementType === 'per_camion' ? 'Per Camion' : 'Administrativ'}
                    </p>
                    <p className="text-sm text-blue-600">
                      {extractedData.bank_name && `${extractedData.bank_name} • `}
                      {extractedData.account_number && `IBAN: ${extractedData.account_number}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-blue-600">
                      Sold inițial: {extractedData.opening_balance?.toLocaleString()} {formData.currency}
                    </p>
                    <p className="text-sm text-blue-600">
                      Sold final: {extractedData.closing_balance?.toLocaleString()} {formData.currency}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => navigate(`/documents/${id}/bank-review`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Distribuie Inteligent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Transactions (Intrări/Încasări) */}
          {creditTransactions.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <ArrowDownCircle className="h-5 w-5" />
                  Intrări / Încasări ({creditTransactions.length})
                </CardTitle>
                <CardDescription className="text-green-600">
                  Bani primiți în cont - se pot potrivi cu facturi de ieșire pentru a le marca ca plătite
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-green-50">
                      <tr className="border-b">
                        <th className="text-left p-3">Data</th>
                        <th className="text-left p-3">De la (Plătitor)</th>
                        <th className="text-left p-3">Descriere</th>
                        <th className="text-left p-3">Tip Încasare</th>
                        <th className="text-right p-3">Suma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditTransactions.map((tx, index) => {
                        // Find the original index in all transactions
                        const originalIndex = bankTransactions.findIndex(t => t === tx)
                        const currentCategory = transactionCategories[originalIndex] || tx.ai_category || 'incasare_client'
                        const aiConfidence = tx.ai_category_confidence

                        return (
                          <tr key={index} className="border-b hover:bg-green-50/50">
                            <td className="p-3">{tx.date || '-'}</td>
                            <td className="p-3 font-medium">{tx.counterparty || '-'}</td>
                            <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={tx.description}>
                              {tx.description || '-'}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <select
                                  value={currentCategory}
                                  onChange={(e) => handleTransactionCategoryChange(originalIndex, e.target.value)}
                                  className="text-sm p-1.5 border rounded-md bg-white min-w-[140px]"
                                >
                                  {bankCreditCategories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                                {tx.ai_category && aiConfidence !== undefined && (
                                  <span className={`text-xs ${aiConfidence > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    AI: {Math.round(aiConfidence * 100)}% sigur
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-green-600">
                              +{tx.amount?.toLocaleString()} {formData.currency}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-green-100">
                      <tr>
                        <td colSpan={4} className="p-3 font-medium text-right">Total Intrări:</td>
                        <td className="p-3 text-right font-bold text-green-700">
                          +{creditTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} {formData.currency}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debit Transactions (Plăți/Ieșiri) */}
          {debitTransactions.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <ArrowUpCircle className="h-5 w-5" />
                  Plăți / Ieșiri ({debitTransactions.length})
                </CardTitle>
                <CardDescription className="text-red-600">
                  Bani plătiți din cont - cheltuieli: parcări, taxe drum, amenzi, furnizori, etc.
                  <br />
                  <span className="font-medium">AI a sugerat categorii pentru fiecare tranzacție. Poți modifica dacă e necesar.</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50">
                      <tr className="border-b">
                        <th className="text-left p-3">Data</th>
                        <th className="text-left p-3">Către (Beneficiar)</th>
                        <th className="text-left p-3">Descriere</th>
                        <th className="text-left p-3">Categorie</th>
                        <th className="text-right p-3">Suma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debitTransactions.map((tx, index) => {
                        // Find the original index in all transactions
                        const originalIndex = bankTransactions.findIndex(t => t === tx)
                        const currentCategory = transactionCategories[originalIndex] || tx.ai_category || 'altele'
                        const aiConfidence = tx.ai_category_confidence

                        return (
                          <tr key={index} className="border-b hover:bg-red-50/50">
                            <td className="p-3">{tx.date || '-'}</td>
                            <td className="p-3 font-medium">{tx.counterparty || '-'}</td>
                            <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={tx.description}>
                              {tx.description || '-'}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <select
                                  value={currentCategory}
                                  onChange={(e) => handleTransactionCategoryChange(originalIndex, e.target.value)}
                                  className="text-sm p-1.5 border rounded-md bg-white min-w-[140px]"
                                >
                                  {bankDebitCategories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                                {tx.ai_category && aiConfidence !== undefined && (
                                  <span className={`text-xs ${aiConfidence > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    AI: {Math.round(aiConfidence * 100)}% sigur
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-red-600">
                              -{tx.amount?.toLocaleString()} {formData.currency}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-red-100">
                      <tr>
                        <td colSpan={4} className="p-3 font-medium text-right">Total Plăți:</td>
                        <td className="p-3 text-right font-bold text-red-700">
                          -{debitTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} {formData.currency}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Raw Extracted Text */}
      {document.extracted_data?.raw_text && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Text Extras</CardTitle>
            <CardDescription>Textul brut extras din document</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={document.extracted_data.raw_text}
              readOnly
              className="font-mono text-sm h-48"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!isProcessed && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => rejectMutation.mutate()}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Necesita Verificare Manuala
          </Button>

          <div className="flex gap-3">
            {batchIds.length > 1 && currentIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  const prevId = batchIds[currentIndex - 1]
                  navigate(`/documents/${prevId}/validate?batch=${batchIds.join(',')}`)
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
            )}

            <Button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || confirmBankStatementMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {(confirmMutation.isPending || confirmBankStatementMutation.isPending) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isBankStatement
                ? (batchIds.length > 1 && currentIndex < batchIds.length - 1
                    ? 'Procesează Extras și Următorul'
                    : 'Procesează Extras Bancar')
                : (batchIds.length > 1 && currentIndex < batchIds.length - 1
                    ? 'Confirmă și Următorul'
                    : createExpense
                      ? (document.document_type === 'factura_iesire' ? 'Confirmă și Creează Încasare' : 'Confirmă și Creează Cheltuială')
                      : 'Confirmă și Salvează')}
            </Button>
          </div>
        </div>
      )}

      {isProcessed && (
        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Inapoi la Documente
          </Button>
        </div>
      )}
    </div>
  )
}
