import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadedDocumentsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  FileSpreadsheet,
  Image,
  Search,
  Filter,
  Upload,
  Brain,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Truck,
  User,
} from 'lucide-react'

interface UploadedDocument {
  id: string
  original_name: string
  file_size: number
  mime_type: string
  document_type: string
  document_category: string
  status: string
  document_date: string
  document_number: string
  amount: number
  currency: string
  ai_confidence: number
  created_at: string
  truck?: { id: string; registration_number: string; brand: string }
  driver?: { id: string; first_name: string; last_name: string }
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  uploaded: { label: 'Încărcat', color: 'bg-blue-100 text-blue-800', icon: Clock },
  processing: { label: 'Se procesează', color: 'bg-yellow-100 text-yellow-800', icon: Loader2 },
  processed: { label: 'Procesat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Eroare', color: 'bg-red-100 text-red-800', icon: XCircle },
  needs_review: { label: 'Necesită verificare', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  archived: { label: 'Arhivat', color: 'bg-gray-100 text-gray-800', icon: FileText },
}

const categoryLabels: Record<string, string> = {
  financial: 'Financiare',
  fuel: 'Combustibil',
  transport: 'Transport',
  fleet: 'Flotă',
  hr: 'Resurse Umane',
  other: 'Altele',
}

const typeLabels: Record<string, string> = {
  factura_intrare: 'Factură Intrare',
  factura_iesire: 'Factură Ieșire',
  extras_bancar: 'Extras Bancar',
  bon_fiscal: 'Bon Fiscal',
  raport_dkv: 'Raport DKV',
  raport_eurowag: 'Raport Eurowag',
  raport_verag: 'Raport Verag',
  cmr: 'CMR',
  asigurare: 'Asigurare',
  itp: 'ITP',
  altele: 'Altele',
}

export default function DocumentsListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['uploaded-documents', page, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.document_category = categoryFilter
      const response = await uploadedDocumentsApi.getAll(params)
      return response.data
    },
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['uploaded-documents-stats'],
    queryFn: async () => {
      const response = await uploadedDocumentsApi.getStats()
      return response.data
    },
  })

  // Process mutation
  const processMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await uploadedDocumentsApi.processBatch(ids)
      return { ...response.data, documentIds: ids }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents-stats'] })
      setSelectedDocs([])
      // Navigate to validation page with the batch of document IDs
      if (data.documentIds && data.documentIds.length > 0) {
        const firstId = data.documentIds[0]
        const batchParam = data.documentIds.join(',')
        navigate(`/documents/${firstId}/validate?batch=${batchParam}`)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await uploadedDocumentsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents'] })
      queryClient.invalidateQueries({ queryKey: ['uploaded-documents-stats'] })
    },
  })

  const documents: UploadedDocument[] = data?.data || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return Image
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel') || mimeType === 'text/csv')
      return FileSpreadsheet
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ro-RO')
  }

  const toggleSelectDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(documents.map((d) => d.id))
    }
  }

  const handleProcessSelected = () => {
    const toProcess = selectedDocs.filter((id) => {
      const doc = documents.find((d) => d.id === id)
      return doc && doc.status === 'uploaded'
    })
    if (toProcess.length > 0) {
      processMutation.mutate(toProcess)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documente</h1>
          <p className="text-muted-foreground">Gestionează documentele încărcate</p>
        </div>
        <Button onClick={() => (window.location.href = '/documents/upload')}>
          <Upload className="mr-2 h-4 w-4" /> Încarcă Documente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total documente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.byStatus?.processed || 0}</div>
            <div className="text-sm text-muted-foreground">Procesate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.byStatus?.uploaded || 0}</div>
            <div className="text-sm text-muted-foreground">În așteptare</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats?.byStatus?.needs_review || 0}</div>
            <div className="text-sm text-muted-foreground">Necesită verificare</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută documente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Toate statusurile</option>
              <option value="uploaded">Încărcate</option>
              <option value="processing">Se procesează</option>
              <option value="processed">Procesate</option>
              <option value="failed">Eroare</option>
              <option value="needs_review">Necesită verificare</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Toate categoriile</option>
              <option value="financial">Financiare</option>
              <option value="fuel">Combustibil</option>
              <option value="transport">Transport</option>
              <option value="fleet">Flotă</option>
              <option value="hr">HR</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedDocs.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="font-medium">{selectedDocs.length} documente selectate</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessSelected}
              disabled={processMutation.isPending}
            >
              {processMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Brain className="mr-2 h-4 w-4" />
              )}
              Procesează cu AI
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDocs([])}>
              Anulează
            </Button>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Documente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Nu există documente</p>
              <p className="text-muted-foreground mb-4">Încarcă primul tău document pentru a începe</p>
              <Button onClick={() => (window.location.href = '/documents/upload')}>
                <Upload className="mr-2 h-4 w-4" /> Încarcă Documente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedDocs.length === documents.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3">Document</th>
                    <th className="text-left p-3">Tip</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Sumă</th>
                    <th className="text-left p-3">Asocieri</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.mime_type)
                    const status = statusConfig[doc.status] || statusConfig.uploaded
                    const StatusIcon = status.icon
                    return (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => toggleSelectDoc(doc.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium truncate max-w-[200px]">
                                {doc.original_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(doc.file_size)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {typeLabels[doc.document_type] || doc.document_type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {categoryLabels[doc.document_category] || doc.document_category}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div>{formatDate(doc.document_date)}</div>
                            {doc.document_number && (
                              <div className="text-sm text-muted-foreground">
                                #{doc.document_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {doc.amount ? (
                            <span className="font-medium">
                              {doc.amount.toLocaleString()} {doc.currency || 'EUR'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {doc.truck && (
                              <Badge variant="outline" className="text-xs">
                                <Truck className="h-3 w-3 mr-1" />
                                {doc.truck.registration_number}
                              </Badge>
                            )}
                            {doc.driver && (
                              <Badge variant="outline" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {doc.driver.first_name} {doc.driver.last_name}
                              </Badge>
                            )}
                            {!doc.truck && !doc.driver && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={status.color}>
                            <StatusIcon className={`h-3 w-3 mr-1 ${doc.status === 'processing' ? 'animate-spin' : ''}`} />
                            {status.label}
                          </Badge>
                          {doc.ai_confidence && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {doc.ai_confidence.toFixed(0)}% confidence
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                              title="Vizualizeaza / Valideaza"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Ești sigur că vrei să ștergi acest document?')) {
                                  deleteMutation.mutate(doc.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                Pagina {pagination.page} din {pagination.totalPages} ({pagination.total} documente)
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
    </div>
  )
}
