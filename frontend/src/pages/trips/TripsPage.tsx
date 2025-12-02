import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi, vehiclesApi, driversApi, clientsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, MapPin, ArrowRight, Calendar, Truck, User, X, ChevronDown, ChevronUp, Package, Edit2, Clock, Save } from 'lucide-react'

type TripStop = {
  id?: string
  country: string
  city: string
  address?: string
  type: 'incarcare' | 'descarcare' | 'tranzit' | 'pauza'
  planned_date?: string
  client_id?: string
  operator_name?: string
  cargo_type?: string
  cmr_number?: string
  notes?: string
  sequence: number
}

type TripData = {
  id: string
  origin_city?: string
  origin_country?: string
  destination_city?: string
  destination_country?: string
  departure_date?: string
  estimated_arrival?: string
  actual_arrival?: string
  status: string
  cargo_type?: string
  price?: number
  currency?: string
  client_name?: string
  client_id?: string
  trailer_id?: string
  diurna?: number
  diurna_currency?: string
  cash_expenses?: number
  cash_expenses_currency?: string
  expense_report_number?: string
  km_start?: number
  km_end?: number
  total_km?: number
  last_modified_at?: string
  last_modified_by?: string
  driver?: { id: string; first_name: string; last_name: string }
  truck?: { id: string; registration_number: string }
  trailer?: { id: string; registration_number: string }
  stops?: TripStop[]
  client?: { id: string; company_name: string }
}

type TruckOption = { id: string; registration_number: string }
type TrailerOption = { id: string; registration_number: string }
type DriverOption = { id: string; first_name: string; last_name: string }
type ClientOption = { id: string; company_name: string }

const STOP_TYPES = [
  { value: 'incarcare', label: 'Incarcare' },
  { value: 'descarcare', label: 'Descarcare' },
  { value: 'tranzit', label: 'Tranzit' },
  { value: 'pauza', label: 'Pauza' },
]

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<TripData | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)
  const [stops, setStops] = useState<TripStop[]>([])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [tripToCancel, setTripToCancel] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ['trips', statusFilter],
    queryFn: () =>
      tripsApi
        .getAll({ status: statusFilter || undefined })
        .then((res) => res.data),
  })

  const { data: trucksData } = useQuery({
    queryKey: ['trucks-options'],
    queryFn: () =>
      vehiclesApi.getTrucks({ limit: 100 }).then((res) => res.data),
  })

  const { data: trailersData } = useQuery({
    queryKey: ['trailers-options'],
    queryFn: () =>
      vehiclesApi.getTrailers({ limit: 100 }).then((res) => res.data),
  })

  const { data: driversData } = useQuery({
    queryKey: ['drivers-options'],
    queryFn: () => driversApi.getAll({ limit: 100 }).then((res) => res.data),
  })

  const { data: clientsData } = useQuery({
    queryKey: ['clients-options'],
    queryFn: () => clientsApi.getAll({ limit: 100 }).then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const tripResponse = await tripsApi.create(data)
      const tripId = tripResponse.data.id

      // Create stops if any
      if (stops.length > 0) {
        for (const stop of stops) {
          await tripsApi.addStop(tripId, stop)
        }
      }

      return tripResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowForm(false)
      setEditingTrip(null)
      setStops([])
      toast({ title: 'Succes', description: 'Cursa salvata cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva cursa',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      return tripsApi.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowForm(false)
      setEditingTrip(null)
      setStops([])
      toast({ title: 'Succes', description: 'Cursa actualizata cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza cursa',
        variant: 'destructive',
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tripsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setCancelDialogOpen(false)
      setTripToCancel(null)
      toast({ title: 'Succes', description: 'Status actualizat cu succes' })
    },
    onError: () => {
      setCancelDialogOpen(false)
      setTripToCancel(null)
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive',
      })
    },
  })

  const addStop = () => {
    setStops([
      ...stops,
      {
        country: '',
        city: '',
        type: 'incarcare',
        sequence: stops.length + 1,
      },
    ])
  }

  const updateStop = (index: number, field: keyof TripStop, value: string) => {
    const newStops = [...stops]
    newStops[index] = { ...newStops[index], [field]: value }
    setStops(newStops)
  }

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index)
    newStops.forEach((stop, i) => {
      stop.sequence = i + 1
    })
    setStops(newStops)
  }

  const handleEdit = (trip: TripData) => {
    setEditingTrip(trip)
    setStops(trip.stops || [])
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, saveAsDraft: boolean = true) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: Record<string, unknown> = {
      driver_id: formData.get('driver_id') || undefined,
      truck_id: formData.get('truck_id') || undefined,
      trailer_id: formData.get('trailer_id') || undefined,
      origin_country: formData.get('origin_country') || undefined,
      origin_city: formData.get('origin_city') || undefined,
      destination_country: formData.get('destination_country') || undefined,
      destination_city: formData.get('destination_city') || undefined,
      departure_date: formData.get('departure_date') || undefined,
      estimated_arrival: formData.get('estimated_arrival') || undefined,
      cargo_type: formData.get('cargo_type') || undefined,
      client_id: formData.get('client_id') || undefined,
      client_name: formData.get('client_name') || undefined,
      price: formData.get('price') ? Number(formData.get('price')) : undefined,
      currency: formData.get('currency') || 'EUR',
      diurna: formData.get('diurna') ? Number(formData.get('diurna')) : undefined,
      diurna_currency: formData.get('diurna_currency') || 'EUR',
      cash_expenses: formData.get('cash_expenses') ? Number(formData.get('cash_expenses')) : undefined,
      cash_expenses_currency: formData.get('cash_expenses_currency') || 'EUR',
      expense_report_number: formData.get('expense_report_number') || undefined,
      status: saveAsDraft ? 'draft' : 'planificat',
    }

    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const trips = tripsData?.data || []
  const trucks = trucksData?.data || []
  const trailers = trailersData?.data || []
  const drivers = driversData?.data || []
  const clients = clientsData?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      case 'planificat':
        return 'bg-gray-100 text-gray-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'finalizat':
        return 'bg-green-100 text-green-700'
      case 'anulat':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Ciorna'
      case 'planificat':
        return 'Planificat'
      case 'in_progress':
        return 'In progres'
      case 'finalizat':
        return 'Finalizat'
      case 'anulat':
        return 'Anulat'
      default:
        return status
    }
  }

  const getStopTypeColor = (type: string) => {
    switch (type) {
      case 'incarcare':
        return 'bg-green-100 text-green-700'
      case 'descarcare':
        return 'bg-blue-100 text-blue-700'
      case 'tranzit':
        return 'bg-yellow-100 text-yellow-700'
      case 'pauza':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curse</h1>
          <p className="text-muted-foreground">Gestioneaza cursele de transport</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingTrip(null); setStops([]); }}>
          <Plus className="h-4 w-4 mr-2" />
          Adauga Cursa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Toate statusurile</option>
          <option value="draft">Ciorne</option>
          <option value="planificat">Planificat</option>
          <option value="in_progress">In progres</option>
          <option value="finalizat">Finalizat</option>
          <option value="anulat">Anulat</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className={editingTrip?.status === 'draft' ? 'border-orange-300' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingTrip ? (
                <>
                  <Edit2 className="h-5 w-5" />
                  Editeaza Cursa {editingTrip.status === 'draft' && <span className="text-sm font-normal text-orange-600">(Ciorna)</span>}
                </>
              ) : (
                'Adauga Cursa Noua'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              {/* Driver, Truck, Trailer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver_id">Sofer</Label>
                  <select
                    id="driver_id"
                    name="driver_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue={editingTrip?.driver?.id || ''}
                  >
                    <option value="">Selecteaza sofer</option>
                    {drivers.map((driver: DriverOption) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="truck_id">Camion</Label>
                  <select
                    id="truck_id"
                    name="truck_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue={editingTrip?.truck?.id || ''}
                  >
                    <option value="">Selecteaza camion</option>
                    {trucks.map((truck: TruckOption) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trailer_id">Remorca</Label>
                  <select
                    id="trailer_id"
                    name="trailer_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue={editingTrip?.trailer?.id || ''}
                  >
                    <option value="">Fara remorca</option>
                    {trailers.map((trailer: TrailerOption) => (
                      <option key={trailer.id} value={trailer.id}>
                        {trailer.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_country">Tara Plecare</Label>
                  <Input
                    id="origin_country"
                    name="origin_country"
                    placeholder="Romania"
                    defaultValue={editingTrip?.origin_country || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin_city">Oras Plecare</Label>
                  <Input
                    id="origin_city"
                    name="origin_city"
                    placeholder="Bucuresti"
                    defaultValue={editingTrip?.origin_city || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_country">Tara Destinatie</Label>
                  <Input
                    id="destination_country"
                    name="destination_country"
                    placeholder="Germania"
                    defaultValue={editingTrip?.destination_country || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_city">Oras Destinatie</Label>
                  <Input
                    id="destination_city"
                    name="destination_city"
                    placeholder="Berlin"
                    defaultValue={editingTrip?.destination_city || ''}
                  />
                </div>
              </div>

              {/* Dates, Cargo, Client */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_date">Data Plecare</Label>
                  <Input
                    id="departure_date"
                    name="departure_date"
                    type="datetime-local"
                    defaultValue={editingTrip?.departure_date ? editingTrip.departure_date.slice(0, 16) : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_arrival">Sosire Estimata</Label>
                  <Input
                    id="estimated_arrival"
                    name="estimated_arrival"
                    type="datetime-local"
                    defaultValue={editingTrip?.estimated_arrival ? editingTrip.estimated_arrival.slice(0, 16) : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_type">Tip Marfa</Label>
                  <Input
                    id="cargo_type"
                    name="cargo_type"
                    placeholder="General, ADR, etc."
                    defaultValue={editingTrip?.cargo_type || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client</Label>
                  <select
                    id="client_id"
                    name="client_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue={editingTrip?.client_id || ''}
                  >
                    <option value="">Selecteaza client</option>
                    {clients.map((client: ClientOption) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Pret Cursa</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={editingTrip?.price || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    name="currency"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue={editingTrip?.currency || 'EUR'}
                  >
                    <option value="EUR">EUR</option>
                    <option value="RON">RON</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client (text)</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="Sau scrie numele manual"
                    defaultValue={editingTrip?.client_name || ''}
                  />
                </div>
              </div>

              {/* Multi-stop section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Opriri Intermediare</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStop}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adauga Oprire
                  </Button>
                </div>

                {stops.length > 0 && (
                  <div className="space-y-3">
                    {stops.map((stop, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Oprire #{stop.sequence}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStop(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Tip</Label>
                            <select
                              value={stop.type}
                              onChange={(e) => updateStop(index, 'type', e.target.value)}
                              className="w-full border rounded-md px-2 py-1.5 text-sm"
                            >
                              {STOP_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tara</Label>
                            <Input
                              value={stop.country}
                              onChange={(e) => updateStop(index, 'country', e.target.value)}
                              placeholder="Tara"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Oras</Label>
                            <Input
                              value={stop.city}
                              onChange={(e) => updateStop(index, 'city', e.target.value)}
                              placeholder="Oras"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Operator</Label>
                            <Input
                              value={stop.operator_name || ''}
                              onChange={(e) => updateStop(index, 'operator_name', e.target.value)}
                              placeholder="Nume operator"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">CMR</Label>
                            <Input
                              value={stop.cmr_number || ''}
                              onChange={(e) => updateStop(index, 'cmr_number', e.target.value)}
                              placeholder="Nr. CMR"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expense fields section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Cheltuieli Sofer</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diurna">Diurna</Label>
                    <div className="flex gap-2">
                      <Input
                        id="diurna"
                        name="diurna"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="flex-1"
                        defaultValue={editingTrip?.diurna || ''}
                      />
                      <select
                        name="diurna_currency"
                        className="w-20 border rounded-md px-2 py-2 text-sm"
                        defaultValue={editingTrip?.diurna_currency || 'EUR'}
                      >
                        <option value="EUR">EUR</option>
                        <option value="RON">RON</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cash_expenses">Cheltuieli Cash</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cash_expenses"
                        name="cash_expenses"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="flex-1"
                        defaultValue={editingTrip?.cash_expenses || ''}
                      />
                      <select
                        name="cash_expenses_currency"
                        className="w-20 border rounded-md px-2 py-2 text-sm"
                        defaultValue={editingTrip?.cash_expenses_currency || 'EUR'}
                      >
                        <option value="EUR">EUR</option>
                        <option value="RON">RON</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense_report_number">Nr. Decont</Label>
                    <Input
                      id="expense_report_number"
                      name="expense_report_number"
                      placeholder="Ex: D-2025-001"
                      defaultValue={editingTrip?.expense_report_number || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salveaza Ciorna
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    const form = e.currentTarget.closest('form')
                    if (form) {
                      const formEvent = new Event('submit', { bubbles: true, cancelable: true })
                      Object.defineProperty(formEvent, 'currentTarget', { value: form })
                      handleSubmit(formEvent as unknown as React.FormEvent<HTMLFormElement>, false)
                    }
                  }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Salveaza si Planifica
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTrip(null)
                    setStops([])
                  }}
                >
                  Anuleaza
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trips list */}
      <div className="space-y-4">
        {isLoading ? (
          <p>Se incarca...</p>
        ) : trips.length === 0 ? (
          <p className="text-muted-foreground">Nu exista curse inregistrate</p>
        ) : (
          trips.map((trip: TripData) => (
            <Card key={trip.id} className={trip.status === 'draft' ? 'border-orange-200 bg-orange-50/30' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {trip.origin_city || '—'}{trip.origin_country ? `, ${trip.origin_country}` : ''}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {trip.destination_city || '—'}{trip.destination_country ? `, ${trip.destination_country}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {trip.stops && trip.stops.length > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {trip.stops.length} opriri
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                      {getStatusLabel(trip.status)}
                    </span>
                    {(trip.status === 'draft' || trip.status === 'planificat') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(trip)}
                        title="Editeaza"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedTrip(expandedTrip === trip.id ? null : trip.id)
                      }
                    >
                      {expandedTrip === trip.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  {trip.departure_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(trip.departure_date)}</span>
                    </div>
                  )}
                  {trip.driver && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {trip.driver.first_name} {trip.driver.last_name}
                      </span>
                    </div>
                  )}
                  {trip.truck && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{trip.truck.registration_number}</span>
                    </div>
                  )}
                  {trip.trailer && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{trip.trailer.registration_number}</span>
                    </div>
                  )}
                  {(trip.client_name || trip.client) && (
                    <div>
                      <span className="text-muted-foreground">Client: </span>
                      {trip.client?.company_name || trip.client_name}
                    </div>
                  )}
                  {trip.price && (
                    <div>
                      <span className="text-muted-foreground">Pret: </span>
                      {formatCurrency(trip.price, trip.currency)}
                    </div>
                  )}
                </div>

                {/* Last modified info for drafts */}
                {trip.status === 'draft' && trip.last_modified_at && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                    <Clock className="h-3 w-3" />
                    Ultima modificare: {formatDate(trip.last_modified_at)}
                  </div>
                )}

                {/* Expanded details with stops */}
                {expandedTrip === trip.id && (
                  <div className="mt-4 pt-4 border-t">
                    {/* Expense info */}
                    {(trip.diurna || trip.cash_expenses || trip.expense_report_number) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        {trip.diurna && trip.diurna > 0 && (
                          <div>
                            <span className="text-muted-foreground">Diurna: </span>
                            <span className="font-medium">{formatCurrency(trip.diurna, trip.diurna_currency)}</span>
                          </div>
                        )}
                        {trip.cash_expenses && trip.cash_expenses > 0 && (
                          <div>
                            <span className="text-muted-foreground">Cash: </span>
                            <span className="font-medium">{formatCurrency(trip.cash_expenses, trip.cash_expenses_currency)}</span>
                          </div>
                        )}
                        {trip.expense_report_number && (
                          <div>
                            <span className="text-muted-foreground">Nr. Decont: </span>
                            <span className="font-medium">{trip.expense_report_number}</span>
                          </div>
                        )}
                        {trip.total_km && trip.total_km > 0 && (
                          <div>
                            <span className="text-muted-foreground">KM: </span>
                            <span className="font-medium">{trip.total_km.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stops */}
                    {trip.stops && trip.stops.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Opriri:</h4>
                        <div className="space-y-2">
                          {trip.stops
                            .sort((a, b) => a.sequence - b.sequence)
                            .map((stop, idx) => (
                              <div
                                key={stop.id || idx}
                                className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded"
                              >
                                <span className="text-muted-foreground w-6">#{stop.sequence}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${getStopTypeColor(stop.type)}`}>
                                  {stop.type}
                                </span>
                                <span className="font-medium">
                                  {stop.city}, {stop.country}
                                </span>
                                {stop.operator_name && (
                                  <span className="text-muted-foreground">
                                    ({stop.operator_name})
                                  </span>
                                )}
                                {stop.cmr_number && (
                                  <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                    CMR: {stop.cmr_number}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick actions */}
                <div className="mt-4 flex gap-2">
                  {trip.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: trip.id,
                          status: 'planificat',
                        })
                      }
                    >
                      Planifica
                    </Button>
                  )}
                  {trip.status === 'planificat' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: trip.id,
                          status: 'in_progress',
                        })
                      }
                    >
                      Porneste Cursa
                    </Button>
                  )}
                  {trip.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: trip.id,
                          status: 'finalizat',
                        })
                      }
                    >
                      Finalizeaza Cursa
                    </Button>
                  )}
                  {(trip.status === 'draft' || trip.status === 'planificat' || trip.status === 'in_progress') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => {
                        setTripToCancel(trip.id)
                        setCancelDialogOpen(true)
                      }}
                    >
                      Anuleaza
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination info */}
      {tripsData?.pagination && (
        <div className="text-sm text-muted-foreground text-center">
          Afisare {trips.length} din {tripsData.pagination.total} curse
        </div>
      )}

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Anulează cursa"
        description="Sigur doriți să anulați această cursă? Această acțiune nu poate fi anulată."
        confirmText="Anulează cursa"
        cancelText="Înapoi"
        variant="destructive"
        isLoading={updateStatusMutation.isPending}
        onConfirm={() => {
          if (tripToCancel) {
            updateStatusMutation.mutate({ id: tripToCancel, status: 'anulat' })
          }
        }}
      />
    </div>
  )
}
