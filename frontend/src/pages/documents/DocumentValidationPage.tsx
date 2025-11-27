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
} from 'lucide-react'

interface ExtractedData {
  document_number?: string
  document_date?: string
  amount?: number
  total_amount?: number
  currency?: string
  supplier_name?: string
  supplier_cui?: string
  client_name?: string
  client_cui?: string
  truck_registration?: string
  driver_name?: string
  items?: string[]
  description?: string
  transactions?: Array<{
    date?: string
    truck_registration?: string
    location?: string
    fuel_liters?: number
    amount?: number
    type?: string
  }>
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
  { value: 'mentenanta', label: 'Mentenanta' },
  { value: 'asigurare', label: 'Asigurare' },
  { value: 'bancar', label: 'Bancar' },
  { value: 'diverse', label: 'Diverse' },
  { value: 'altele', label: 'Altele' },
]

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
      setFormData({
        document_number: document.document_number || structured.document_number,
        document_date: document.document_date || structured.document_date,
        amount: document.amount || structured.amount || structured.total_amount,
        currency: document.currency || structured.currency || 'EUR',
        supplier_name: document.supplier_name || structured.supplier_name,
        supplier_cui: document.supplier_cui || structured.supplier_cui,
        truck_registration: structured.truck_registration,
        driver_name: structured.driver_name,
      })
      setExpenseCategory(getDefaultExpenseCategory(document.document_type))
      if (document.trip_id) {
        setSelectedTripId(document.trip_id)
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

  const handleConfirm = () => {
    confirmMutation.mutate({
      document_number: formData.document_number,
      document_date: formData.document_date,
      amount: formData.amount ? parseFloat(String(formData.amount)) : null,
      currency: formData.currency,
      supplier_name: formData.supplier_name,
      supplier_cui: formData.supplier_cui,
      expense_category: expenseCategory,
      trip_id: selectedTripId || null,
      create_expense: createExpense,
    })
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

            {/* Supplier */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" /> Furnizor
              </label>
              {editMode ? (
                <Input
                  value={formData.supplier_name || ''}
                  onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                  placeholder="Nume furnizor"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted/50 rounded">{formData.supplier_name || '-'}</p>
              )}
            </div>

            {/* Supplier CUI */}
            <div>
              <label className="text-sm font-medium">CUI Furnizor</label>
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

            {/* Truck Association */}
            {(extractedData.truck_registration || document.truck) && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Camion Asociat
                </label>
                <div className="mt-1 p-2 bg-blue-50 rounded flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>
                    {document.truck?.registration_number || extractedData.truck_registration}
                  </span>
                  {document.truck && (
                    <Badge variant="outline" className="ml-auto">
                      Asociat automat
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Driver Association */}
            {(extractedData.driver_name || document.driver) && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Sofer Asociat
                </label>
                <div className="mt-1 p-2 bg-green-50 rounded flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span>
                    {document.driver ? `${document.driver.first_name} ${document.driver.last_name}` : extractedData.driver_name}
                  </span>
                  {document.driver && (
                    <Badge variant="outline" className="ml-auto">
                      Asociat automat
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Settings Card */}
      {!isProcessed && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Setari Cheltuiala
            </CardTitle>
            <CardDescription>
              Configureaza cum va fi inregistrata cheltuiala din acest document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Expense Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Creeaza cheltuiala automat</p>
                <p className="text-sm text-muted-foreground">
                  La confirmare, va fi creata o inregistrare in {selectedTripId ? 'cheltuielile trip-ului' : 'tranzactii'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={createExpense}
                  onChange={(e) => setCreateExpense(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expense Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categorie Cheltuiala
                </Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteaza categoria" />
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

              {/* Trip Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Asociaza cu Trip (optional)
                </Label>
                <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fara trip - tranzactie generala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Fara trip - tranzactie generala</SelectItem>
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
                    Cheltuiala va fi adaugata la cheltuielile trip-ului selectat
                  </p>
                )}
              </div>
            </div>

            {/* Info for fuel documents */}
            {isFuel && hasExtractedTransactions && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Document cu tranzactii multiple</p>
                    <p className="text-sm text-orange-600">
                      Acest raport contine {extractedData.transactions?.length} tranzactii individuale.
                      {selectedTripId
                        ? ' Toate vor fi adaugate ca cheltuieli separate la trip-ul selectat.'
                        : ' Selecteaza un trip pentru a le adauga ca cheltuieli individuale.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Extracted Transactions for Fuel Documents */}
      {hasExtractedTransactions && (
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
              disabled={confirmMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {batchIds.length > 1 && currentIndex < batchIds.length - 1
                ? 'Confirma si Urmatorul'
                : createExpense
                  ? 'Confirma si Creeaza Cheltuiala'
                  : 'Confirma si Salveaza'}
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
