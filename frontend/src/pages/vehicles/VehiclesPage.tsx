import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Truck, Edit, Trash2 } from 'lucide-react'

type TruckData = {
  id: string
  registration_number: string
  brand?: string
  model?: string
  year?: number
  status: string
  current_km?: number
  gps_provider?: string
  created_at: string
}

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<TruckData | null>(null)
  const queryClient = useQueryClient()

  const { data: trucksData, isLoading } = useQuery({
    queryKey: ['trucks', search],
    queryFn: () =>
      vehiclesApi.getTrucks({ search: search || undefined }).then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => vehiclesApi.createTruck(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      setShowForm(false)
      toast({ title: 'Succes', description: 'Camion adaugat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adauga camionul',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      vehiclesApi.updateTruck(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      setEditingTruck(null)
      toast({ title: 'Succes', description: 'Camion actualizat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza camionul',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.deleteTruck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      toast({ title: 'Succes', description: 'Camion dezactivat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva camionul',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      registration_number: formData.get('registration_number'),
      brand: formData.get('brand') || undefined,
      model: formData.get('model') || undefined,
      year: formData.get('year') ? Number(formData.get('year')) : undefined,
      current_km: formData.get('current_km')
        ? Number(formData.get('current_km'))
        : undefined,
      gps_provider: formData.get('gps_provider') || undefined,
    }

    if (editingTruck) {
      updateMutation.mutate({ id: editingTruck.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const trucks = trucksData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicule</h1>
          <p className="text-muted-foreground">Gestioneaza flota de camioane</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adauga Camion
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cauta dupa numar inmatriculare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingTruck) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTruck ? 'Editeaza Camion' : 'Adauga Camion Nou'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Numar Inmatriculare *</Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    defaultValue={editingTruck?.registration_number}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    name="brand"
                    defaultValue={editingTruck?.brand}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={editingTruck?.model}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">An Fabricatie</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={editingTruck?.year}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_km">KM Actuali</Label>
                  <Input
                    id="current_km"
                    name="current_km"
                    type="number"
                    defaultValue={editingTruck?.current_km}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps_provider">Provider GPS</Label>
                  <Input
                    id="gps_provider"
                    name="gps_provider"
                    defaultValue={editingTruck?.gps_provider}
                    placeholder="wialon, arobs, volvo..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTruck ? 'Salveaza' : 'Adauga'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTruck(null)
                  }}
                >
                  Anuleaza
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trucks list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Se incarca...</p>
        ) : trucks.length === 0 ? (
          <p className="text-muted-foreground">Nu exista camioane inregistrate</p>
        ) : (
          trucks.map((truck: TruckData) => (
            <Card key={truck.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {truck.registration_number}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      truck.status === 'activ'
                        ? 'bg-green-100 text-green-700'
                        : truck.status === 'service'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {truck.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {truck.brand && (
                    <p>
                      <span className="text-muted-foreground">Marca:</span>{' '}
                      {truck.brand} {truck.model}
                    </p>
                  )}
                  {truck.year && (
                    <p>
                      <span className="text-muted-foreground">An:</span> {truck.year}
                    </p>
                  )}
                  {truck.current_km && (
                    <p>
                      <span className="text-muted-foreground">KM:</span>{' '}
                      {truck.current_km.toLocaleString()}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Adaugat:</span>{' '}
                    {formatDate(truck.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTruck(truck)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editeaza
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Sigur doriti sa dezactivati acest camion?')) {
                        deleteMutation.mutate(truck.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Dezactiveaza
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination info */}
      {trucksData?.pagination && (
        <div className="text-sm text-muted-foreground text-center">
          Afisare {trucks.length} din {trucksData.pagination.total} camioane
        </div>
      )}
    </div>
  )
}
