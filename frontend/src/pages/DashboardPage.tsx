import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi, driversApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then((res) => res.data),
  })

  const { data: financial, isLoading: financialLoading } = useQuery({
    queryKey: ['dashboard', 'financial'],
    queryFn: () => dashboardApi.getFinancial().then((res) => res.data),
  })

  const { data: alerts } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getAlerts().then((res) => res.data),
  })

  const { data: recentTrips } = useQuery({
    queryKey: ['dashboard', 'recent-trips'],
    queryFn: () => dashboardApi.getRecentTrips().then((res) => res.data),
  })

  const { data: driverAlerts } = useQuery({
    queryKey: ['driver-alerts'],
    queryFn: () => driversApi.getAllAlerts().then((res) => res.data),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Prezentare generala a flotei si operatiunilor
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camioane Active</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.fleet?.trucks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.fleet?.trailers || 0} remorci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soferi Activi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.fleet?.drivers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibili pentru curse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curse Active</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.trips?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.trips?.thisMonth || 0} in aceasta luna
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerte</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documente care expira curand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venituri Luna</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialLoading
                ? '-'
                : formatCurrency(financial?.income || 0, financial?.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {financialLoading
                ? '-'
                : formatCurrency(financial?.expenses || 0, financial?.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Luna</CardTitle>
            {(financial?.balance || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (financial?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {financialLoading
                ? '-'
                : formatCurrency(financial?.balance || 0, financial?.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent trips and alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent trips */}
        <Card>
          <CardHeader>
            <CardTitle>Curse Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips?.slice(0, 5).map((trip: {
                id: string
                origin_city: string
                origin_country: string
                destination_city: string
                destination_country: string
                departure_date: string
                status: string
                driver?: { first_name: string; last_name: string }
                truck?: { registration_number: string }
              }) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {trip.origin_city} → {trip.destination_city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trip.driver?.first_name} {trip.driver?.last_name} •{' '}
                      {trip.truck?.registration_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatDate(trip.departure_date)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        trip.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : trip.status === 'finalizat'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  Nu exista curse recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerte Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.alerts?.slice(0, 5).map((alert: {
                type: string
                severity: string
                message: string
                date: string
                entity_type: string
                entity_id: string
              }, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 border-b pb-2 last:border-0"
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'high'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Expira: {formatDate(alert.date)}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  Nu exista alerte active
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Document Alerts */}
      {driverAlerts?.alerts && driverAlerts.alerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documente Soferi - Alerte
            </CardTitle>
            <Link to="/drivers/documents">
              <Button variant="outline" size="sm">
                Vezi toate
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {driverAlerts.summary?.expired || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Expirate</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {driverAlerts.summary?.critical || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Critice (&lt;7 zile)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {driverAlerts.summary?.warning || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Atentie (&lt;30 zile)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {driverAlerts.summary?.driversWithIssues || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Soferi cu probleme</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {driverAlerts.alerts.slice(0, 5).map((alert: {
                driverId: string
                driverName: string
                documentType: string
                documentName: string
                expiryDate: string
                daysUntilExpiry: number
                color: string
                status: string
                label: string
              }, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.color === 'red'
                      ? 'bg-red-50 border-red-200'
                      : alert.color === 'orange'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {alert.color === 'red' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : alert.color === 'orange' ? (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{alert.driverName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.documentName} - {alert.daysUntilExpiry < 0
                          ? `Expirat de ${Math.abs(alert.daysUntilExpiry)} zile`
                          : `Expira in ${alert.daysUntilExpiry} zile`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.color === 'red'
                        ? 'destructive'
                        : alert.color === 'orange'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      alert.color === 'orange'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : alert.color === 'yellow'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : ''
                    }
                  >
                    {alert.label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
