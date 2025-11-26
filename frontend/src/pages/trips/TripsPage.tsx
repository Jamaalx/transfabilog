import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi, vehiclesApi, driversApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, MapPin, ArrowRight, Calendar, Truck, User } from 'lucide-react'

type TripData = {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  departure_date: string
  estimated_arrival?: string
  actual_arrival?: string
  status: string
  cargo_type?: string
  price?: number
  currency?: string
  client_name?: string
  driver?: { id: string; first_name: string; last_name: string }
  truck?: { id: string; registration_number: string }
}

type TruckOption = { id: string; registration_number: string }
type DriverOption = { id: string; first_name: string; last_name: string }

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
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

  const { data: driversData } = useQuery({
    queryKey: ['drivers-options'],
    queryFn: () => driversApi.getAll({ limit: 100 }).then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => tripsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowForm(false)
      toast({ title: 'Succes', description: 'Cursa adaugata cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adauga cursa',
        variant: 'destructive',
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tripsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      toast({ title: 'Succes', description: 'Status actualizat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      driver_id: formData.get('driver_id'),
      truck_id: formData.get('truck_id'),
      origin_country: formData.get('origin_country'),
      origin_city: formData.get('origin_city'),
      destination_country: formData.get('destination_country'),
      destination_city: formData.get('destination_city'),
      departure_date: formData.get('departure_date'),
      estimated_arrival: formData.get('estimated_arrival') || undefined,
      cargo_type: formData.get('cargo_type') || undefined,
      client_name: formData.get('client_name') || undefined,
      price: formData.get('price') ? Number(formData.get('price')) : undefined,
      currency: formData.get('currency') || 'EUR',
    }

    createMutation.mutate(data)
  }

  const trips = tripsData?.data || []
  const trucks = trucksData?.data || []
  const drivers = driversData?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curse</h1>
          <p className="text-muted-foreground">Gestioneaza cursele de transport</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
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
          <option value="planificat">Planificat</option>
          <option value="in_progress">In progres</option>
          <option value="finalizat">Finalizat</option>
          <option value="anulat">Anulat</option>
        </select>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adauga Cursa Noua</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver_id">Sofer *</Label>
                  <select
                    id="driver_id"
                    name="driver_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
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
                  <Label htmlFor="truck_id">Camion *</Label>
                  <select
                    id="truck_id"
                    name="truck_id"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selecteaza camion</option>
                    {trucks.map((truck: TruckOption) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_country">Tara Plecare *</Label>
                  <Input
                    id="origin_country"
                    name="origin_country"
                    placeholder="Romania"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin_city">Oras Plecare *</Label>
                  <Input
                    id="origin_city"
                    name="origin_city"
                    placeholder="Bucuresti"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_country">Tara Destinatie *</Label>
                  <Input
                    id="destination_country"
                    name="destination_country"
                    placeholder="Germania"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_city">Oras Destinatie *</Label>
                  <Input
                    id="destination_city"
                    name="destination_city"
                    placeholder="Berlin"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_date">Data Plecare *</Label>
                  <Input
                    id="departure_date"
                    name="departure_date"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_arrival">Sosire Estimata</Label>
                  <Input
                    id="estimated_arrival"
                    name="estimated_arrival"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_type">Tip Marfa</Label>
                  <Input
                    id="cargo_type"
                    name="cargo_type"
                    placeholder="General, ADR, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="Nume client"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Pret</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    name="currency"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    defaultValue="EUR"
                  >
                    <option value="EUR">EUR</option>
                    <option value="RON">RON</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  Adauga Cursa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
            <Card key={trip.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {trip.origin_city}, {trip.origin_country}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {trip.destination_city}, {trip.destination_country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        trip.status
                      )}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(trip.departure_date)}</span>
                  </div>
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
                  {trip.client_name && (
                    <div>
                      <span className="text-muted-foreground">Client: </span>
                      {trip.client_name}
                    </div>
                  )}
                  {trip.price && (
                    <div>
                      <span className="text-muted-foreground">Pret: </span>
                      {formatCurrency(trip.price, trip.currency)}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="mt-4 flex gap-2">
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
                  {(trip.status === 'planificat' ||
                    trip.status === 'in_progress') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => {
                        if (confirm('Sigur doriti sa anulati aceasta cursa?')) {
                          updateStatusMutation.mutate({
                            id: trip.id,
                            status: 'anulat',
                          })
                        }
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
    </div>
  )
}
