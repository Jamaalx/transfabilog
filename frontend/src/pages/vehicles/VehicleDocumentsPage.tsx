import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Eye,
  Calendar,
  Shield,
  FileCheck,
  Thermometer,
  Globe,
  Map,
  CreditCard,
  Container,
} from 'lucide-react'

// Document type configuration interface
interface DocTypeConfig {
  type: string
  name: string
  expires: boolean
  alertDays: number | null
  icon: string
  optional?: boolean
  conditional?: 'adr' | 'frigo'
}

// Document type configurations with expiration rules
const TRUCK_DOCUMENTS: DocTypeConfig[] = [
  { type: 'talon_camion', name: 'Talon', expires: false, alertDays: null, icon: 'FileText' },
  { type: 'itp_camion', name: 'ITP', expires: true, alertDays: 30, icon: 'FileCheck' },
  { type: 'rca_camion', name: 'RCA', expires: true, alertDays: 30, icon: 'Shield' },
  { type: 'casco_camion', name: 'CASCO', expires: true, alertDays: 30, icon: 'Shield', optional: true },
  { type: 'rovinieta_camion', name: 'Rovinietă', expires: true, alertDays: 7, icon: 'FileText' },
  { type: 'copie_conforma_camion', name: 'Copie Conformă', expires: true, alertDays: 90, icon: 'FileCheck' },
  { type: 'agreare_tahograf', name: 'Agreare Tahograf', expires: true, alertDays: 60, icon: 'Clock' },
  { type: 'verificare_tahograf', name: 'Verificare Tahograf', expires: true, alertDays: 60, icon: 'Clock' },
  { type: 'cmr_asigurare', name: 'Asigurare CMR', expires: true, alertDays: 30, icon: 'FileText' },
  { type: 'certificat_adr_vehicul', name: 'Certificat ADR', expires: true, alertDays: 60, icon: 'AlertTriangle', conditional: 'adr' },
]

const TRAILER_DOCUMENTS: DocTypeConfig[] = [
  { type: 'talon_remorca', name: 'Talon', expires: false, alertDays: null, icon: 'FileText' },
  { type: 'itp_remorca', name: 'ITP', expires: true, alertDays: 30, icon: 'FileCheck' },
  { type: 'rca_remorca', name: 'RCA', expires: true, alertDays: 30, icon: 'Shield' },
  { type: 'certificat_atp_frigo', name: 'Certificat ATP/FRIGO', expires: true, alertDays: 90, icon: 'Thermometer', conditional: 'frigo' },
  { type: 'certificat_adr_remorca', name: 'Certificat ADR', expires: true, alertDays: 60, icon: 'AlertTriangle', conditional: 'adr' },
]

const INTERNATIONAL_DOCUMENTS: DocTypeConfig[] = [
  { type: 'carnet_tir', name: 'Carnet TIR', expires: true, alertDays: 60, icon: 'Globe' },
  { type: 'autorizatii_cemt', name: 'Autorizații CEMT', expires: true, alertDays: 30, icon: 'FileCheck' },
  { type: 'viniete_strainatate', name: 'Viniete Străinătate', expires: true, alertDays: 7, icon: 'Map' },
  { type: 'carte_verde', name: 'Carte Verde', expires: true, alertDays: 30, icon: 'CreditCard' },
]

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  FileText,
  FileCheck,
  Shield,
  Clock,
  AlertTriangle,
  Thermometer,
  Globe,
  Map,
  CreditCard,
}

type VehicleType = 'truck' | 'trailer'

interface VehicleData {
  id: string
  registration_number: string
  brand?: string
  model?: string
  type?: string
  status?: string
  has_adr?: boolean
  has_frigo?: boolean
  has_international?: boolean
}

interface DocumentData {
  id: string
  doc_type: string
  doc_number?: string
  expiry_date?: string
  file_url?: string
}

function calculateDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getAlertStatus(daysUntilExpiry: number | null, expires: boolean) {
  if (!expires) return { color: 'gray', label: 'Nu expiră', priority: 0 }
  if (daysUntilExpiry === null) return { color: 'gray', label: 'Dată necunoscută', priority: 0 }
  if (daysUntilExpiry < 0) return { color: 'red', label: 'EXPIRAT', priority: 5 }
  if (daysUntilExpiry <= 7) return { color: 'red', label: 'Critic', priority: 4 }
  if (daysUntilExpiry <= 30) return { color: 'orange', label: 'Urgent', priority: 3 }
  if (daysUntilExpiry <= 90) return { color: 'yellow', label: 'Atenție', priority: 2 }
  return { color: 'green', label: 'OK', priority: 0 }
}

function getStatusColor(color: string) {
  switch (color) {
    case 'red': return 'bg-red-100 text-red-800 border-red-200'
    case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'green': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function VehicleDocumentCard({
  vehicle,
  vehicleType,
  documents,
  expanded,
  onToggle,
}: {
  vehicle: VehicleData
  vehicleType: VehicleType
  documents: DocumentData[]
  expanded: boolean
  onToggle: () => void
}) {
  const docTypes = vehicleType === 'trailer' ? TRAILER_DOCUMENTS : TRUCK_DOCUMENTS
  const existingDocs = new Map<string, DocumentData>(documents.map(d => [d.doc_type, d]))

  // Calculate stats
  let expired = 0, expiring = 0, valid = 0
  const alerts: Array<{ name: string; daysUntilExpiry: number | null; status: ReturnType<typeof getAlertStatus> }> = []
  const missing: Array<{ type: string; name: string; required: boolean }> = []

  for (const docType of docTypes) {
    const doc = existingDocs.get(docType.type)

    // Check conditional requirements
    if (docType.conditional) {
      if (docType.conditional === 'adr' && !vehicle.has_adr) continue
      if (docType.conditional === 'frigo' && !vehicle.has_frigo) continue
    }

    if (doc) {
      const daysUntilExpiry = calculateDaysUntilExpiry(doc.expiry_date)
      const status = getAlertStatus(daysUntilExpiry, docType.expires)

      if (status.priority >= 4) expired++
      else if (status.priority >= 2) expiring++
      else valid++

      if (status.priority > 0) {
        alerts.push({ name: docType.name, daysUntilExpiry, status })
      }
    } else if (!docType.optional) {
      missing.push({ type: docType.type, name: docType.name, required: true })
    }
  }

  const hasUrgentAlerts = alerts.some(a => a.status.priority >= 4)

  return (
    <Card className={hasUrgentAlerts ? 'border-red-300 bg-red-50/30' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {vehicleType === 'trailer' ? (
                <Container className="h-5 w-5 text-primary" />
              ) : (
                <Truck className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {vehicle.registration_number}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {vehicle.brand} {vehicle.model}
              </p>
              <div className="flex gap-2 mt-1">
                {vehicle.has_international && (
                  <Badge variant="outline" className="text-xs">International</Badge>
                )}
                {vehicle.has_adr && (
                  <Badge variant="outline" className="text-xs">ADR</Badge>
                )}
                {vehicle.has_frigo && (
                  <Badge variant="outline" className="text-xs">FRIGO</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex gap-3 text-sm">
              {expired > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {expired}
                </div>
              )}
              {expiring > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-4 w-4" />
                  {expiring}
                </div>
              )}
              {valid > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {valid}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <Tabs defaultValue="documents" className="mt-4">
            <TabsList>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documente ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alerte ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="missing">
                <XCircle className="h-4 w-4 mr-2" />
                Lipsă ({missing.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {docTypes.map((docType) => {
                  // Check conditional requirements
                  if (docType.conditional) {
                    if (docType.conditional === 'adr' && !vehicle.has_adr) return null
                    if (docType.conditional === 'frigo' && !vehicle.has_frigo) return null
                  }

                  const doc = existingDocs.get(docType.type)
                  const IconComponent = iconMap[docType.icon] || FileText

                  if (!doc) {
                    return (
                      <div key={docType.type} className="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium text-sm">{docType.name}</span>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">Neîncărcat</p>
                      </div>
                    )
                  }

                  const daysUntilExpiry = calculateDaysUntilExpiry(doc.expiry_date)
                  const status = getAlertStatus(daysUntilExpiry, docType.expires)

                  return (
                    <div key={docType.type} className={`p-3 rounded-lg border ${getStatusColor(status.color)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium text-sm">{docType.name}</span>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(status.color)}`}>
                          {status.label}
                        </Badge>
                      </div>
                      {doc.doc_number && (
                        <p className="text-xs mt-1 opacity-75">Nr: {doc.doc_number}</p>
                      )}
                      {doc.expiry_date && (
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.expiry_date)}
                          {daysUntilExpiry !== null && (
                            <span className="opacity-75">
                              ({daysUntilExpiry > 0 ? `${daysUntilExpiry} zile` : 'EXPIRAT'})
                            </span>
                          )}
                        </p>
                      )}
                      {doc.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Vezi document
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(alert.status.color)}`}>
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm opacity-75">
                        {alert.daysUntilExpiry !== null && alert.daysUntilExpiry < 0
                          ? `Expirat de ${Math.abs(alert.daysUntilExpiry)} zile`
                          : alert.daysUntilExpiry === 0
                          ? 'Expiră astăzi!'
                          : `Expiră în ${alert.daysUntilExpiry} zile`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(alert.status.color)}>{alert.status.label}</Badge>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nu există alerte.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="missing" className="mt-4">
              <div className="space-y-2">
                {missing.map((doc) => (
                  <div key={doc.type} className="p-3 rounded-lg border bg-red-50 border-red-200 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">Document obligatoriu lipsă</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Obligatoriu</Badge>
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-1" />
                        Încarcă
                      </Button>
                    </div>
                  </div>
                ))}
                {missing.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">Toate documentele obligatorii sunt încărcate!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}

export default function VehicleDocumentsPage() {
  const [search, setSearch] = useState('')
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null)
  const [vehicleType, setVehicleType] = useState<'all' | 'truck' | 'trailer'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch trucks
  const { data: trucksData, isLoading: trucksLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => vehiclesApi.getTrucks({ limit: 100 }).then((res) => res.data),
  })

  // Fetch trailers
  const { data: trailersData, isLoading: trailersLoading } = useQuery({
    queryKey: ['trailers'],
    queryFn: () => vehiclesApi.getTrailers({ limit: 100 }).then((res) => res.data),
  })

  const trucks = trucksData?.data || []
  const trailers = trailersData?.data || []
  const isLoading = trucksLoading || trailersLoading

  // Combine and filter vehicles
  const allVehicles = [
    ...trucks.map((t: VehicleData) => ({ ...t, vehicleType: 'truck' as const })),
    ...trailers.map((t: VehicleData) => ({ ...t, vehicleType: 'trailer' as const })),
  ].filter((v) => {
    const matchesSearch = !search || v.registration_number.toLowerCase().includes(search.toLowerCase())
    const matchesType = vehicleType === 'all' || v.vehicleType === vehicleType
    return matchesSearch && matchesType
  })

  // Calculate summary
  const summary = {
    totalTrucks: trucks.length,
    totalTrailers: trailers.length,
    expired: 0,
    expiring: 0,
    ok: 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documente Vehicule</h1>
          <p className="text-muted-foreground">
            Gestionează și monitorizează documentele camioanelor și semiremorcilor
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Camioane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">capete tractor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Container className="h-4 w-4 text-cyan-500" />
              Semiremorci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{summary.totalTrailers}</div>
            <p className="text-xs text-muted-foreground">semiremorci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Expirate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.expired}</div>
            <p className="text-xs text-muted-foreground">documente expirate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Expiră curând
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.expiring}</div>
            <p className="text-xs text-muted-foreground">necesită atenție</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nr. înmatriculare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={vehicleType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVehicleType('all')}
          >
            Toate
          </Button>
          <Button
            variant={vehicleType === 'truck' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVehicleType('truck')}
            className={vehicleType === 'truck' ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            <Truck className="h-4 w-4 mr-1" />
            Camioane
          </Button>
          <Button
            variant={vehicleType === 'trailer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVehicleType('trailer')}
            className={vehicleType === 'trailer' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
          >
            <Container className="h-4 w-4 mr-1" />
            Semiremorci
          </Button>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : allVehicles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Nu există vehicule care să corespundă căutării.' : 'Nu există vehicule înregistrate.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          allVehicles.map((vehicle) => (
            <VehicleDocumentCard
              key={vehicle.id}
              vehicle={vehicle}
              vehicleType={vehicle.vehicleType}
              documents={[]} // TODO: Fetch documents for each vehicle
              expanded={expandedVehicle === vehicle.id}
              onToggle={() => setExpandedVehicle(expandedVehicle === vehicle.id ? null : vehicle.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
