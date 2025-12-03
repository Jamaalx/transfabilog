import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { driversApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import {
  Search,
  User,
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
  CreditCard,
  Award,
  Heart,
  Flame,
  BookOpen,
  FileCheck,
  Thermometer,
  Car,
  Brain,
} from 'lucide-react'

// Icon mapping for document types
const iconMap: Record<string, React.ElementType> = {
  FileText,
  CreditCard,
  Clock,
  Award,
  Brain,
  Heart,
  Shield,
  Flame,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Thermometer,
  Car,
}

type DriverDocumentStatus = {
  driver: {
    id: string
    first_name: string
    last_name: string
    phone?: string
    email?: string
    has_international_routes?: boolean
    has_adr?: boolean
    has_frigo?: boolean
    photo_url?: string
  }
  status: {
    total: number
    valid: number
    expiring: number
    expired: number
    compliancePercent: number
    alerts: Array<{
      documentId: string
      documentType: string
      documentName: string
      expiryDate: string
      daysUntilExpiry: number
      color: string
      status: string
      label: string
      priority: number
    }>
    missing: Array<{
      docType: string
      name: string
      description: string
      required: boolean
      priority: string
    }>
    byType: Record<string, {
      document: {
        id: string
        doc_type: string
        doc_number?: string
        expiry_date?: string
        file_url?: string
      }
      config: {
        name: string
        icon: string
        expires: boolean
      }
      daysUntilExpiry: number | null
      alertStatus: {
        color: string
        status: string
        label: string
      }
    }>
  }
}

type DocumentType = {
  value: string
  label: string
  category: string
  icon: string
  expires: boolean
  alertDaysBefore?: number
}

type AlertItem = {
  driverId: string
  driverName: string
  documentId: string
  documentType: string
  documentName: string
  expiryDate: string
  daysUntilExpiry: number
  color: string
  status: string
  label: string
  priority: number
}

function getStatusColor(color: string) {
  switch (color) {
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'orange':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'green':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'blue':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getProgressColor(percent: number) {
  if (percent >= 90) return 'bg-green-500'
  if (percent >= 70) return 'bg-yellow-500'
  if (percent >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

function DriverDocumentCard({
  driverStatus,
  expanded,
  onToggle,
}: {
  driverStatus: DriverDocumentStatus
  expanded: boolean
  onToggle: () => void
}) {
  const { driver, status } = driverStatus
  const hasUrgentAlerts = status.alerts.some((a) => a.priority >= 4)

  return (
    <Card className={hasUrgentAlerts ? 'border-red-300 bg-red-50/30' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {driver.photo_url ? (
                <img
                  src={driver.photo_url}
                  alt={`${driver.first_name} ${driver.last_name}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {driver.first_name} {driver.last_name}
              </CardTitle>
              <div className="flex gap-2 mt-1">
                {driver.has_international_routes && (
                  <Badge variant="outline" className="text-xs">
                    International
                  </Badge>
                )}
                {driver.has_adr && (
                  <Badge variant="outline" className="text-xs">
                    ADR
                  </Badge>
                )}
                {driver.has_frigo && (
                  <Badge variant="outline" className="text-xs">
                    FRIGO
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Compliance indicator */}
            <div className="text-right">
              <div className="text-sm font-medium">{status.compliancePercent}%</div>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(status.compliancePercent)}`}
                  style={{ width: `${status.compliancePercent}%` }}
                />
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-3 text-sm">
              {status.expired > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {status.expired}
                </div>
              )}
              {status.expiring > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-4 w-4" />
                  {status.expiring}
                </div>
              )}
              {status.valid > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {status.valid}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
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
                Documente ({status.total})
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alerte ({status.alerts.length})
              </TabsTrigger>
              <TabsTrigger value="missing">
                <XCircle className="h-4 w-4 mr-2" />
                Lipsa ({status.missing.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(status.byType).map(([docType, info]) => {
                  const IconComponent = iconMap[info.config.icon] || FileText
                  return (
                    <div
                      key={docType}
                      className={`p-3 rounded-lg border ${getStatusColor(info.alertStatus.color)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium text-sm">{info.config.name}</span>
                        </div>
                        <Badge
                          className={`text-xs ${getStatusColor(info.alertStatus.color)}`}
                        >
                          {info.alertStatus.label}
                        </Badge>
                      </div>
                      {info.document.doc_number && (
                        <p className="text-xs mt-1 opacity-75">
                          Nr: {info.document.doc_number}
                        </p>
                      )}
                      {info.document.expiry_date && (
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(info.document.expiry_date)}
                          {info.daysUntilExpiry !== null && (
                            <span className="opacity-75">
                              ({info.daysUntilExpiry > 0 ? `${info.daysUntilExpiry} zile` : 'EXPIRAT'})
                            </span>
                          )}
                        </p>
                      )}
                      {info.document.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => window.open(info.document.file_url, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Vezi document
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              {Object.keys(status.byType).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nu exista documente inregistrate pentru acest sofer.
                </p>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <div className="space-y-2">
                {status.alerts.map((alert, idx) => {
                  const IconComponent = iconMap[
                    Object.entries(status.byType).find(([k]) => k === alert.documentType)?.[1]?.config?.icon || 'FileText'
                  ] || FileText
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(alert.color)}`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{alert.documentName}</p>
                          <p className="text-sm opacity-75">
                            {alert.daysUntilExpiry < 0
                              ? `Expirat de ${Math.abs(alert.daysUntilExpiry)} zile`
                              : alert.daysUntilExpiry === 0
                              ? 'Expira astazi!'
                              : `Expira in ${alert.daysUntilExpiry} zile`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(alert.color)}>{alert.label}</Badge>
                    </div>
                  )
                })}
                {status.alerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nu exista alerte pentru acest sofer.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="missing" className="mt-4">
              <div className="space-y-2">
                {status.missing.map((doc) => (
                  <div
                    key={doc.docType}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      doc.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : doc.priority === 'medium'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={doc.required ? 'destructive' : 'secondary'}
                      >
                        {doc.required ? 'Obligatoriu' : 'Recomandat'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-1" />
                        Incarca
                      </Button>
                    </div>
                  </div>
                ))}
                {status.missing.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Toate documentele obligatorii sunt incarcate!
                    </p>
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

export default function DriverDocumentsPage() {
  const [search, setSearch] = useState('')
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch all drivers
  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.getAll({ limit: 100 }).then((res) => res.data),
  })

  // Fetch all alerts summary
  const { data: alertsData } = useQuery({
    queryKey: ['driver-alerts'],
    queryFn: () => driversApi.getAllAlerts().then((res) => res.data),
  })

  // Fetch document status for each driver
  const drivers = driversData?.data || []
  const { data: driverStatuses, isLoading: statusLoading } = useQuery({
    queryKey: ['driver-document-statuses', drivers.map((d: { id: string }) => d.id)],
    queryFn: async () => {
      const statuses: DriverDocumentStatus[] = []
      for (const driver of drivers) {
        try {
          const res = await driversApi.getDocumentStatus(driver.id)
          statuses.push(res.data)
        } catch {
          statuses.push({
            driver,
            status: {
              total: 0,
              valid: 0,
              expiring: 0,
              expired: 0,
              compliancePercent: 0,
              alerts: [],
              missing: [],
              byType: {},
            },
          })
        }
      }
      return statuses
    },
    enabled: drivers.length > 0,
  })

  // Filter drivers
  const filteredDrivers = (driverStatuses || []).filter((ds) => {
    const nameMatch =
      !search ||
      `${ds.driver.first_name} ${ds.driver.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())

    let statusMatch = true
    if (statusFilter === 'expired') {
      statusMatch = ds.status.expired > 0
    } else if (statusFilter === 'expiring') {
      statusMatch = ds.status.expiring > 0
    } else if (statusFilter === 'ok') {
      statusMatch = ds.status.expired === 0 && ds.status.expiring === 0
    } else if (statusFilter === 'missing') {
      statusMatch = ds.status.missing.filter((m) => m.required).length > 0
    }

    return nameMatch && statusMatch
  })

  const isLoading = driversLoading || statusLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documente Soferi</h1>
          <p className="text-muted-foreground">
            Gestioneaza si monitorizeaza documentele soferilor
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {alertsData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Expirate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {alertsData.summary?.expired || 0}
              </div>
              <p className="text-xs text-muted-foreground">documente expirate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {alertsData.summary?.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">expira in 7 zile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Atentie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {alertsData.summary?.warning || 0}
              </div>
              <p className="text-xs text-muted-foreground">expira in 30 zile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Valide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {alertsData.summary?.ok || 0}
              </div>
              <p className="text-xs text-muted-foreground">documente valide</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cauta dupa nume..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Toti
          </Button>
          <Button
            variant={statusFilter === 'expired' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('expired')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Expirate
          </Button>
          <Button
            variant={statusFilter === 'expiring' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('expiring')}
            className={statusFilter === 'expiring' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Clock className="h-4 w-4 mr-1" />
            Expira curand
          </Button>
          <Button
            variant={statusFilter === 'missing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('missing')}
            className={statusFilter === 'missing' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Lipsa
          </Button>
          <Button
            variant={statusFilter === 'ok' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ok')}
            className={statusFilter === 'ok' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            OK
          </Button>
        </div>
      </div>

      {/* Drivers list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'Nu exista soferi care sa corespunda criteriilor de cautare.'
                  : 'Nu exista soferi inregistrati.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDrivers.map((driverStatus) => (
            <DriverDocumentCard
              key={driverStatus.driver.id}
              driverStatus={driverStatus}
              expanded={expandedDriver === driverStatus.driver.id}
              onToggle={() =>
                setExpandedDriver(
                  expandedDriver === driverStatus.driver.id ? null : driverStatus.driver.id
                )
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
