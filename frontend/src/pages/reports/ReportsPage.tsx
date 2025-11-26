import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, driversApi, vehiclesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  MapPin,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  AlertTriangle,
  Fuel,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ReportTab = 'financial' | 'trips' | 'fleet' | 'expenses' | 'documents'

const tabs = [
  { id: 'financial' as const, label: 'Financiar', icon: TrendingUp },
  { id: 'trips' as const, label: 'Curse', icon: MapPin },
  { id: 'fleet' as const, label: 'Flota', icon: Truck },
  { id: 'expenses' as const, label: 'Cheltuieli', icon: CreditCard },
  { id: 'documents' as const, label: 'Documente', icon: FileText },
]

const expenseCategories: Record<string, string> = {
  combustibil: 'Combustibil',
  taxa_drum: 'Taxe Drum',
  parcare: 'Parcare',
  mancare: 'Mancare',
  reparatii: 'Reparatii',
  asigurare: 'Asigurare',
  taxe: 'Taxe',
  altele: 'Altele',
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('financial')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [selectedTruck, setSelectedTruck] = useState<string>('')

  // Fetch drivers and trucks for filters
  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.getAll({ limit: 100 }).then(res => res.data),
  })

  const { data: trucksData } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => vehiclesApi.getTrucks({ limit: 100 }).then(res => res.data),
  })

  // Fetch reports based on active tab
  const { data: financialReport, isLoading: financialLoading } = useQuery({
    queryKey: ['reports', 'financial', dateFrom, dateTo],
    queryFn: () => reportsApi.getFinancial({ date_from: dateFrom, date_to: dateTo }).then(res => res.data),
    enabled: activeTab === 'financial',
  })

  const { data: tripsReport, isLoading: tripsLoading } = useQuery({
    queryKey: ['reports', 'trips', dateFrom, dateTo, selectedDriver, selectedTruck],
    queryFn: () => reportsApi.getTrips({
      date_from: dateFrom,
      date_to: dateTo,
      driver_id: selectedDriver || undefined,
      truck_id: selectedTruck || undefined,
    }).then(res => res.data),
    enabled: activeTab === 'trips',
  })

  const { data: fleetReport, isLoading: fleetLoading } = useQuery({
    queryKey: ['reports', 'fleet', dateFrom, dateTo],
    queryFn: () => reportsApi.getFleet({ date_from: dateFrom, date_to: dateTo }).then(res => res.data),
    enabled: activeTab === 'fleet',
  })

  const { data: expensesReport, isLoading: expensesLoading } = useQuery({
    queryKey: ['reports', 'expenses', dateFrom, dateTo],
    queryFn: () => reportsApi.getExpenses({ date_from: dateFrom, date_to: dateTo }).then(res => res.data),
    enabled: activeTab === 'expenses',
  })

  const { data: documentsReport, isLoading: documentsLoading } = useQuery({
    queryKey: ['reports', 'documents'],
    queryFn: () => reportsApi.getDocuments().then(res => res.data),
    enabled: activeTab === 'documents',
  })

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h]
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`
        }
        return val
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${dateFrom}_${dateTo}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapoarte</h1>
          <p className="text-muted-foreground">
            Analizeaza performanta si statisticile companiei
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom" className="whitespace-nowrap">De la:</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo" className="whitespace-nowrap">Pana la:</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            {activeTab === 'trips' && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="driver" className="whitespace-nowrap">Sofer:</Label>
                  <select
                    id="driver"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Toti soferii</option>
                    {driversData?.data?.map((driver: { id: string; first_name: string; last_name: string }) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="truck" className="whitespace-nowrap">Camion:</Label>
                  <select
                    id="truck"
                    value={selectedTruck}
                    onChange={(e) => setSelectedTruck(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Toate camioanele</option>
                    {trucksData?.data?.map((truck: { id: string; registration_number: string }) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Report */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Venituri Totale</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {financialLoading ? '-' : formatCurrency(financialReport?.summary?.totalIncome || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cheltuieli Totale</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {financialLoading ? '-' : formatCurrency(financialReport?.summary?.totalExpenses || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Net</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={cn(
                  'text-2xl font-bold',
                  (financialReport?.summary?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {financialLoading ? '-' : formatCurrency(financialReport?.summary?.profit || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marja Profit</CardTitle>
                <PieChart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {financialLoading ? '-' : `${financialReport?.summary?.profitMargin || 0}%`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses by category */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Cheltuieli pe Categorii</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = Object.entries(financialReport?.expensesByCategory || {}).map(([cat, val]: [string, { total: number; count: number }]) => ({
                      Categorie: expenseCategories[cat] || cat,
                      Total: val.total,
                      Tranzactii: val.count,
                    }))
                    exportToCSV(data, 'cheltuieli_categorii')
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(financialReport?.expensesByCategory || {}).map(([category, data]: [string, { total: number; count: number }]) => {
                    const percentage = financialReport?.summary?.totalExpenses > 0
                      ? (data.total / financialReport.summary.totalExpenses) * 100
                      : 0
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{expenseCategories[category] || category}</span>
                          <span className="font-medium">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {data.count} tranzactii ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    )
                  })}
                  {Object.keys(financialReport?.expensesByCategory || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista cheltuieli in aceasta perioada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venituri pe Categorii</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(financialReport?.incomeByCategory || {}).map(([category, data]: [string, { total: number; count: number }]) => {
                    const percentage = financialReport?.summary?.totalIncome > 0
                      ? (data.total / financialReport.summary.totalIncome) * 100
                      : 0
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="font-medium">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {data.count} tranzactii ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    )
                  })}
                  {Object.keys(financialReport?.incomeByCategory || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista venituri in aceasta perioada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend */}
          <Card>
            <CardHeader>
              <CardTitle>Evolutie Lunara</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(financialReport?.monthlyData || {}).sort().map(([month, data]: [string, { income: number; expenses: number }]) => (
                  <div key={month} className="grid grid-cols-4 gap-4 items-center border-b pb-2 last:border-0">
                    <span className="font-medium">{month}</span>
                    <div className="text-green-600">
                      <span className="text-xs text-muted-foreground block">Venituri</span>
                      {formatCurrency(data.income)}
                    </div>
                    <div className="text-red-600">
                      <span className="text-xs text-muted-foreground block">Cheltuieli</span>
                      {formatCurrency(data.expenses)}
                    </div>
                    <div className={cn(
                      (data.income - data.expenses) >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      <span className="text-xs text-muted-foreground block">Profit</span>
                      {formatCurrency(data.income - data.expenses)}
                    </div>
                  </div>
                ))}
                {Object.keys(financialReport?.monthlyData || {}).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nu exista date in aceasta perioada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips Report */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Curse Totale</CardTitle>
                <MapPin className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tripsLoading ? '-' : tripsReport?.summary?.totalTrips || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Finalizate</CardTitle>
                <MapPin className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tripsLoading ? '-' : tripsReport?.summary?.completedTrips || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Venit Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tripsLoading ? '-' : formatCurrency(tripsReport?.summary?.totalRevenue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KM Total</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tripsLoading ? '-' : formatNumber(tripsReport?.summary?.totalKm || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Venit/Cursa</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tripsLoading ? '-' : formatCurrency(parseFloat(tripsReport?.summary?.avgRevenuePerTrip || '0'))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By driver and truck */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Performanta Soferi</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = (tripsReport?.tripsByDriver || []).map((d: { name: string; trips: number; completedTrips: number; revenue: number; km: number }) => ({
                      Sofer: d.name,
                      Curse: d.trips,
                      Finalizate: d.completedTrips,
                      Venit: d.revenue,
                      KM: d.km,
                    }))
                    exportToCSV(data, 'performanta_soferi')
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(tripsReport?.tripsByDriver || []).map((driver: { name: string; trips: number; completedTrips: number; revenue: number; km: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {driver.completedTrips}/{driver.trips} curse | {formatNumber(driver.km)} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(driver.revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {(tripsReport?.tripsByDriver || []).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Performanta Camioane</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = (tripsReport?.tripsByTruck || []).map((t: { registration: string; trips: number; completedTrips: number; revenue: number; km: number }) => ({
                      Camion: t.registration,
                      Curse: t.trips,
                      Finalizate: t.completedTrips,
                      Venit: t.revenue,
                      KM: t.km,
                    }))
                    exportToCSV(data, 'performanta_camioane')
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(tripsReport?.tripsByTruck || []).map((truck: { registration: string; brand: string; trips: number; completedTrips: number; revenue: number; km: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{truck.registration}</p>
                        <p className="text-xs text-muted-foreground">
                          {truck.brand} | {truck.completedTrips}/{truck.trips} curse | {formatNumber(truck.km)} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(truck.revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {(tripsReport?.tripsByTruck || []).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By destination */}
          <Card>
            <CardHeader>
              <CardTitle>Curse pe Destinatii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(tripsReport?.tripsByDestination || {}).map(([country, data]: [string, { trips: number; revenue: number }]) => (
                  <div key={country} className="border rounded-lg p-3">
                    <p className="font-medium">{country}</p>
                    <p className="text-2xl font-bold">{data.trips}</p>
                    <p className="text-sm text-green-600">{formatCurrency(data.revenue)}</p>
                  </div>
                ))}
                {Object.keys(tripsReport?.tripsByDestination || {}).length === 0 && (
                  <p className="text-muted-foreground text-center py-4 col-span-full">
                    Nu exista date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fleet Report */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Camioane</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fleetLoading ? '-' : fleetReport?.summary?.totalTrucks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fleetReport?.summary?.activeTrucks || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remorci</CardTitle>
                <Truck className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fleetLoading ? '-' : fleetReport?.summary?.totalTrailers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fleetReport?.summary?.activeTrailers || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Soferi</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fleetLoading ? '-' : fleetReport?.summary?.totalDrivers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fleetReport?.summary?.activeDrivers || 0} activi
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Truck utilization */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Utilizare Camioane</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = (fleetReport?.truckUtilization || []).map((t: { registration: string; brand: string; totalTrips: number; completedTrips: number; totalKm: number; revenue: number; revenuePerKm: string }) => ({
                    Camion: t.registration,
                    Marca: t.brand,
                    Curse: t.totalTrips,
                    KM: t.totalKm,
                    Venit: t.revenue,
                    'EUR/KM': t.revenuePerKm,
                  }))
                  exportToCSV(data, 'utilizare_camioane')
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Camion</th>
                      <th className="text-left py-2">Marca</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-center py-2">Curse</th>
                      <th className="text-right py-2">KM</th>
                      <th className="text-right py-2">Venit</th>
                      <th className="text-right py-2">EUR/KM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fleetReport?.truckUtilization || []).map((truck: { id: string; registration: string; brand: string; model: string; status: string; totalTrips: number; completedTrips: number; totalKm: number; revenue: number; revenuePerKm: string }) => (
                      <tr key={truck.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{truck.registration}</td>
                        <td className="py-2">{truck.brand} {truck.model}</td>
                        <td className="py-2 text-center">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs',
                            truck.status === 'activ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          )}>
                            {truck.status}
                          </span>
                        </td>
                        <td className="py-2 text-center">{truck.completedTrips}/{truck.totalTrips}</td>
                        <td className="py-2 text-right">{formatNumber(truck.totalKm)}</td>
                        <td className="py-2 text-right text-green-600">{formatCurrency(truck.revenue)}</td>
                        <td className="py-2 text-right">{truck.revenuePerKm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(fleetReport?.truckUtilization || []).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nu exista date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver utilization */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Utilizare Soferi</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = (fleetReport?.driverUtilization || []).map((d: { name: string; totalTrips: number; completedTrips: number; totalKm: number; revenue: number; avgRevenuePerTrip: string }) => ({
                    Sofer: d.name,
                    Curse: d.totalTrips,
                    KM: d.totalKm,
                    Venit: d.revenue,
                    'Venit/Cursa': d.avgRevenuePerTrip,
                  }))
                  exportToCSV(data, 'utilizare_soferi')
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Sofer</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-center py-2">Curse</th>
                      <th className="text-right py-2">KM</th>
                      <th className="text-right py-2">Venit</th>
                      <th className="text-right py-2">Venit/Cursa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fleetReport?.driverUtilization || []).map((driver: { id: string; name: string; status: string; totalTrips: number; completedTrips: number; totalKm: number; revenue: number; avgRevenuePerTrip: string }) => (
                      <tr key={driver.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{driver.name}</td>
                        <td className="py-2 text-center">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs',
                            driver.status === 'activ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          )}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="py-2 text-center">{driver.completedTrips}/{driver.totalTrips}</td>
                        <td className="py-2 text-right">{formatNumber(driver.totalKm)}</td>
                        <td className="py-2 text-right text-green-600">{formatCurrency(driver.revenue)}</td>
                        <td className="py-2 text-right">{formatCurrency(parseFloat(driver.avgRevenuePerTrip))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(fleetReport?.driverUtilization || []).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nu exista date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Report */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cheltuieli Totale</CardTitle>
                <CreditCard className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {expensesLoading ? '-' : formatCurrency(expensesReport?.summary?.totalExpenses || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nr. Tranzactii</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {expensesLoading ? '-' : expensesReport?.summary?.transactionCount || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medie/Tranzactie</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {expensesLoading ? '-' : formatCurrency(parseFloat(expensesReport?.summary?.avgExpense || '0'))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By category and payment method */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cheltuieli pe Categorii</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(expensesReport?.byCategory || {}).map(([category, data]: [string, { total: number; count: number; percentage: string }]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {category === 'combustibil' && <Fuel className="h-4 w-4" />}
                          {expenseCategories[category] || category}
                        </span>
                        <span className="font-medium">{formatCurrency(data.total)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.count} tranzactii ({data.percentage}%)
                      </p>
                    </div>
                  ))}
                  {Object.keys(expensesReport?.byCategory || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista cheltuieli
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metode de Plata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(expensesReport?.byPaymentMethod || {}).map(([method, data]: [string, { total: number; count: number }]) => (
                    <div key={method} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium capitalize">{method}</p>
                        <p className="text-xs text-muted-foreground">{data.count} tranzactii</p>
                      </div>
                      <p className="font-medium">{formatCurrency(data.total)}</p>
                    </div>
                  ))}
                  {Object.keys(expensesReport?.byPaymentMethod || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nu exista date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions list */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Lista Cheltuieli</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = (expensesReport?.expenses || []).map((e: { date: string; category: string; amount: number; description: string; payment_method: string }) => ({
                    Data: e.date,
                    Categorie: expenseCategories[e.category] || e.category,
                    Suma: e.amount,
                    Descriere: e.description || '',
                    'Metoda Plata': e.payment_method || '',
                  }))
                  exportToCSV(data, 'cheltuieli_detalii')
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Data</th>
                      <th className="text-left py-2">Categorie</th>
                      <th className="text-left py-2">Descriere</th>
                      <th className="text-left py-2">Metoda</th>
                      <th className="text-right py-2">Suma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expensesReport?.expenses || []).slice(0, 20).map((expense: { id: string; date: string; category: string; description: string; payment_method: string; amount: number }) => (
                      <tr key={expense.id} className="border-b last:border-0">
                        <td className="py-2">{formatDate(expense.date)}</td>
                        <td className="py-2">{expenseCategories[expense.category] || expense.category}</td>
                        <td className="py-2 max-w-xs truncate">{expense.description || '-'}</td>
                        <td className="py-2 capitalize">{expense.payment_method || '-'}</td>
                        <td className="py-2 text-right text-red-600">{formatCurrency(expense.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(expensesReport?.expenses || []).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nu exista cheltuieli
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Report */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documente</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documentsLoading ? '-' : documentsReport?.summary?.totalDocuments || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {documentsLoading ? '-' : documentsReport?.summary?.expired || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expira in 30 zile</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {documentsLoading ? '-' : documentsReport?.summary?.expiringIn30Days || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expira in 60 zile</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {documentsLoading ? '-' : documentsReport?.summary?.expiringIn60Days || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expira in 90 zile</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documentsLoading ? '-' : documentsReport?.summary?.expiringIn90Days || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expired documents */}
          {(documentsReport?.expired || []).length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Documente Expirate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(documentsReport?.expired || []).map((doc: { id: string; doc_type: string; expiry_date: string; entity_type: string }) => (
                    <div key={doc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{doc.doc_type}</p>
                        <p className="text-xs text-muted-foreground">{doc.entity_type}</p>
                      </div>
                      <p className="text-red-600">{formatDate(doc.expiry_date)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents expiring in 30 days */}
          {(documentsReport?.expiringIn30Days || []).length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Documente care Expira in 30 Zile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(documentsReport?.expiringIn30Days || []).map((doc: { id: string; doc_type: string; expiry_date: string; entity_type: string }) => (
                    <div key={doc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{doc.doc_type}</p>
                        <p className="text-xs text-muted-foreground">{doc.entity_type}</p>
                      </div>
                      <p className="text-orange-600">{formatDate(doc.expiry_date)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver alerts */}
          {(documentsReport?.driverAlerts || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Alerte Soferi (Permise / Fise Medicale)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(documentsReport?.driverAlerts || []).map((alert: { driverId: string; type: string; driverName: string; expiryDate: string; status: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{alert.driverName}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.type === 'license' ? 'Permis conducere' : 'Fisa medicala'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          alert.status === 'expired' && 'text-red-600',
                          alert.status === 'critical' && 'text-orange-600',
                          alert.status === 'warning' && 'text-yellow-600',
                          alert.status === 'attention' && 'text-blue-600',
                        )}>
                          {formatDate(alert.expiryDate)}
                        </p>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          alert.status === 'expired' && 'bg-red-100 text-red-700',
                          alert.status === 'critical' && 'bg-orange-100 text-orange-700',
                          alert.status === 'warning' && 'bg-yellow-100 text-yellow-700',
                          alert.status === 'attention' && 'bg-blue-100 text-blue-700',
                        )}>
                          {alert.status === 'expired' ? 'Expirat' :
                           alert.status === 'critical' ? 'Urgent' :
                           alert.status === 'warning' ? 'Atentie' : 'De reinnoit'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No alerts message */}
          {(documentsReport?.expired || []).length === 0 &&
           (documentsReport?.expiringIn30Days || []).length === 0 &&
           (documentsReport?.driverAlerts || []).length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  Nu exista documente care expira curand sau alerte active.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
