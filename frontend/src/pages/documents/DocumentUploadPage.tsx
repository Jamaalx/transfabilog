import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadedDocumentsApi, vehiclesApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Eye,
  Brain,
  Building,
  Receipt,
  Truck,
  Shield,
  Clock,
  Users,
  CreditCard,
  Award,
  File,
  X,
  Briefcase,
} from 'lucide-react'

interface DocumentType {
  value: string
  label: string
  category: string
  icon: string
}

interface UploadedFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
  progress: number
  error?: string
  documentId?: string
}

const iconMap: Record<string, React.ElementType> = {
  FileInput: FileText,
  FileOutput: FileText,
  Building: Building,
  Receipt: Receipt,
  FileText: FileText,
  Shield: Shield,
  ClipboardCheck: FileText,
  Road: FileText,
  Clock: Clock,
  Users: Users,
  CreditCard: CreditCard,
  Award: Award,
  File: File,
}

const categoryColors: Record<string, string> = {
  financial: 'bg-green-100 text-green-800 border-green-300',
  fleet: 'bg-purple-100 text-purple-800 border-purple-300',
  hr: 'bg-pink-100 text-pink-800 border-pink-300',
}

const categoryLabels: Record<string, string> = {
  financial: 'Financiare',
  fleet: 'Flotă',
  hr: 'Resurse Umane',
}

interface TruckData {
  id: string
  registration_number: string
  brand?: string
  model?: string
}

export default function DocumentUploadPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Bank statement specific state
  const [bankStatementType, setBankStatementType] = useState<'per_camion' | 'administrativ'>('administrativ')
  const [selectedTruckId, setSelectedTruckId] = useState<string>('')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch document types
  const { data: typesData } = useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const response = await uploadedDocumentsApi.getTypes()
      return response.data
    },
  })

  // Fetch trucks for bank statement selection
  const { data: trucksData } = useQuery({
    queryKey: ['trucks-for-select'],
    queryFn: async () => {
      const response = await vehiclesApi.getTrucks({ limit: 100 })
      return response.data
    },
  })

  const trucks = (trucksData?.data || []) as TruckData[]
  const documentTypes = typesData?.types || []
  const categories = typesData?.categories || []

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedType || files.length === 0) return

      const formData = new FormData()
      formData.append('document_type', selectedType.value)
      formData.append('document_category', selectedType.category)
      if (periodStart) formData.append('period_start', periodStart)
      if (periodEnd) formData.append('period_end', periodEnd)
      if (notes) formData.append('notes', notes)

      // Bank statement specific fields
      if (selectedType.value === 'extras_bancar') {
        formData.append('bank_statement_type', bankStatementType)
        if (bankStatementType === 'per_camion' && selectedTruckId) {
          formData.append('truck_id', selectedTruckId)
        }
      }

      files.forEach((f) => {
        formData.append('files', f.file)
      })

      const response = await uploadedDocumentsApi.upload(formData)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      // Update files with document IDs
      if (data?.uploaded) {
        setFiles((prev) =>
          prev.map((f, i) => ({
            ...f,
            status: 'uploaded' as const,
            documentId: data.uploaded[i]?.id,
          }))
        )
      }
      setStep(3)
    },
    onError: (error: Error) => {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'error' as const,
          error: error.message,
        }))
      )
    },
  })

  // Process mutation
  const processMutation = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const response = await uploadedDocumentsApi.processBatch(documentIds)
      return { ...response.data, documentIds }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      setIsProcessing(false)
      // Navigate to validation page with the batch of document IDs
      if (data.documentIds && data.documentIds.length > 0) {
        const firstId = data.documentIds[0]
        const batchParam = data.documentIds.join(',')
        navigate(`/documents/${firstId}/validate?batch=${batchParam}`)
      }
    },
    onError: () => {
      setIsProcessing(false)
    },
  })

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.type === 'text/csv')
      return FileSpreadsheet
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleUpload = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })))
    uploadMutation.mutate()
  }

  const handleProcess = () => {
    const documentIds = files.filter((f) => f.documentId).map((f) => f.documentId!)
    if (documentIds.length > 0) {
      setIsProcessing(true)
      processMutation.mutate(documentIds)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedType(null)
    setFiles([])
    setPeriodStart('')
    setPeriodEnd('')
    setNotes('')
    setBankStatementType('administrativ')
    setSelectedTruckId('')
  }

  // Check if this is a bank statement upload
  const isBankStatement = selectedType?.value === 'extras_bancar'

  // Group types by category
  const typesByCategory = documentTypes.reduce((acc: Record<string, DocumentType[]>, type: DocumentType) => {
    if (!acc[type.category]) acc[type.category] = []
    acc[type.category].push(type)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Încărcare Documente</h1>
        <p className="text-muted-foreground">
          Încarcă documente pentru procesare automată cu AI
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
              1
            </div>
            <span className="font-medium">Selectează Tipul</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
              2
            </div>
            <span className="font-medium">Încarcă Fișiere</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
              3
            </div>
            <span className="font-medium">Procesare</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Document Type */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ce tip de documente vrei să încarci?</CardTitle>
              <CardDescription>
                Selectează tipul de document pentru procesare precisă. Toate fișierele din acest batch vor fi tratate ca același tip.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(typesByCategory).map(([category, types]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge className={categoryColors[category]}>{categoryLabels[category]}</Badge>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {types.map((type: DocumentType) => {
                      const Icon = iconMap[type.icon] || File
                      const isSelected = selectedType?.value === type.value
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedType(type)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="font-medium">{type.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedType} size="lg">
              Continuă <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Files */}
      {step === 2 && selectedType && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Încarcă {selectedType.label}</CardTitle>
                  <CardDescription>
                    Trage fișierele aici sau click pentru a selecta. Acceptă: PDF, Excel, CSV, Word, Imagini
                  </CardDescription>
                </div>
                <Badge className={categoryColors[selectedType.category]}>{selectedType.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bank Statement Type Selection */}
              {isBankStatement && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Tip Extras Bancar
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setBankStatementType('per_camion')
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        bankStatementType === 'per_camion'
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Truck className="h-6 w-6 mb-2 text-blue-600" />
                      <div className="font-medium">Per Camion</div>
                      <p className="text-sm text-muted-foreground">
                        Extras bancar asociat unui camion specific
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBankStatementType('administrativ')
                        setSelectedTruckId('')
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        bankStatementType === 'administrativ'
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Briefcase className="h-6 w-6 mb-2 text-purple-600" />
                      <div className="font-medium">Administrativ</div>
                      <p className="text-sm text-muted-foreground">
                        Cheltuieli generale de firmă
                      </p>
                    </button>
                  </div>

                  {/* Truck Selection for per_camion */}
                  {bankStatementType === 'per_camion' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Selectează Camionul
                      </Label>
                      <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează camionul pentru acest extras" />
                        </SelectTrigger>
                        <SelectContent>
                          {trucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id}>
                              {truck.registration_number} {truck.brand && `- ${truck.brand}`} {truck.model && truck.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!selectedTruckId && (
                        <p className="text-sm text-orange-600">
                          Selectează un camion pentru a asocia plățile/încasările automat
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Period Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Perioada de la (opțional)</label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Până la (opțional)</label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2">Trage fișierele aici</p>
                <p className="text-muted-foreground mb-4">sau</p>
                <label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.doc,.docx"
                  />
                  <Button variant="outline" asChild>
                    <span>Selectează Fișiere</span>
                  </Button>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{files.length} fișiere selectate</span>
                    <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                      <Trash2 className="h-4 w-4 mr-1" /> Șterge tot
                    </Button>
                  </div>
                  {files.map((f) => {
                    const FileIcon = getFileIcon(f.file)
                    return (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{f.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(f.file.size)}
                          </p>
                        </div>
                        {f.status === 'pending' && (
                          <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {f.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                        {f.status === 'uploaded' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {f.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Notes */}
              <div className="mt-6">
                <label className="text-sm font-medium mb-1 block">Note (opțional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adaugă note pentru aceste documente..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
              size="lg"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se încarcă...
                </>
              ) : (
                <>
                  Încarcă {files.length} fișiere <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Fișiere încărcate cu succes!
              </CardTitle>
              <CardDescription>
                {files.filter((f) => f.status === 'uploaded').length} fișiere au fost încărcate.
                Acum poți procesa documentele cu AI pentru extragerea automată a datelor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Brain className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Procesare AI</h3>
                    <p className="text-muted-foreground mb-4">
                      AI-ul va analiza fiecare document și va extrage automat:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Date, numere de document, sume
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Furnizori, clienți, CUI-uri
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Numere de înmatriculare, asociere cu camioane
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Nume șoferi, asociere automată
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Uploaded files summary */}
              <div className="space-y-2">
                {files.filter((f) => f.status === 'uploaded').map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="flex-1 truncate">{f.file.name}</span>
                    <Badge variant="outline">Încărcat</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Încarcă alte documente
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/documents'}>
                <Eye className="mr-2 h-4 w-4" /> Vezi toate documentele
              </Button>
              <Button
                onClick={handleProcess}
                disabled={processMutation.isPending || isProcessing}
                size="lg"
              >
                {processMutation.isPending || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se proceseaza... Te vom redirectiona la validare
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" /> Proceseaza cu AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
