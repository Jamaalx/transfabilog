import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Truck, Edit, Trash2, Container } from 'lucide-react'

type TruckData = {
  id: string
  registration_number: string
  vin?: string
  brand?: string
  model?: string
  year?: number
  status: string
  current_km?: number
  gps_provider?: string
  created_at: string
}

type TrailerData = {
  id: string
  registration_number: string
  vin?: string
  brand?: string
  model?: string
  type?: string
  capacity_tons?: number
  volume_m3?: number
  status: string
  created_at: string
}

const TRAILER_TYPES = [
  { value: 'prelata', label: 'Prelată' },
  { value: 'frigorific', label: 'Frigorific' },
  { value: 'cisterna', label: 'Cisternă' },
  { value: 'altele', label: 'Altele' },
]

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<'trucks' | 'trailers'>('trucks')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<TruckData | null>(null)
  const [editingTrailer, setEditingTrailer] = useState<TrailerData | null>(null)
  const [deleteTruckDialogOpen, setDeleteTruckDialogOpen] = useState(false)
  const [truckToDelete, setTruckToDelete] = useState<string | null>(null)
  const [deleteTrailerDialogOpen, setDeleteTrailerDialogOpen] = useState(false)
  const [trailerToDelete, setTrailerToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Trucks queries and mutations
  const { data: trucksData, isLoading: trucksLoading } = useQuery({
    queryKey: ['trucks', search],
    queryFn: () =>
      vehiclesApi.getTrucks({ search: search || undefined }).then((res) => res.data),
    enabled: activeTab === 'trucks',
  })

  const createTruckMutation = useMutation({
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

  const updateTruckMutation = useMutation({
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

  const deleteTruckMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.deleteTruck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      setDeleteTruckDialogOpen(false)
      setTruckToDelete(null)
      toast({ title: 'Succes', description: 'Camion dezactivat cu succes' })
    },
    onError: () => {
      setDeleteTruckDialogOpen(false)
      setTruckToDelete(null)
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva camionul',
        variant: 'destructive',
      })
    },
  })

  // Trailers queries and mutations
  const { data: trailersData, isLoading: trailersLoading } = useQuery({
    queryKey: ['trailers', search],
    queryFn: () =>
      vehiclesApi.getTrailers({ search: search || undefined }).then((res) => res.data),
    enabled: activeTab === 'trailers',
  })

  const createTrailerMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => vehiclesApi.createTrailer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trailers'] })
      setShowForm(false)
      toast({ title: 'Succes', description: 'Remorca adaugata cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adauga remorca',
        variant: 'destructive',
      })
    },
  })

  const updateTrailerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      vehiclesApi.updateTrailer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trailers'] })
      setEditingTrailer(null)
      toast({ title: 'Succes', description: 'Remorca actualizata cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza remorca',
        variant: 'destructive',
      })
    },
  })

  const deleteTrailerMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.deleteTrailer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trailers'] })
      setDeleteTrailerDialogOpen(false)
      setTrailerToDelete(null)
      toast({ title: 'Succes', description: 'Remorca dezactivata cu succes' })
    },
    onError: () => {
      setDeleteTrailerDialogOpen(false)
      setTrailerToDelete(null)
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva remorca',
        variant: 'destructive',
      })
    },
  })

  const handleTruckSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      registration_number: formData.get('registration_number'),
      vin: formData.get('vin') || undefined,
      brand: formData.get('brand') || undefined,
      model: formData.get('model') || undefined,
      year: formData.get('year') ? Number(formData.get('year')) : undefined,
      current_km: formData.get('current_km')
        ? Number(formData.get('current_km'))
        : undefined,
      gps_provider: formData.get('gps_provider') || undefined,
    }

    if (editingTruck) {
      updateTruckMutation.mutate({ id: editingTruck.id, data })
    } else {
      createTruckMutation.mutate(data)
    }
  }

  const handleTrailerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      registration_number: formData.get('registration_number'),
      vin: formData.get('vin') || undefined,
      brand: formData.get('brand') || undefined,
      model: formData.get('model') || undefined,
      type: formData.get('type') || undefined,
      capacity_tons: formData.get('capacity_tons')
        ? Number(formData.get('capacity_tons'))
        : undefined,
      volume_m3: formData.get('volume_m3')
        ? Number(formData.get('volume_m3'))
        : undefined,
    }

    if (editingTrailer) {
      updateTrailerMutation.mutate({ id: editingTrailer.id, data })
    } else {
      createTrailerMutation.mutate(data)
    }
  }

  const trucks = trucksData?.data || []
  const trailers = trailersData?.data || []

  const handleTabChange = (tab: 'trucks' | 'trailers') => {
    setActiveTab(tab)
    setShowForm(false)
    setEditingTruck(null)
    setEditingTrailer(null)
    setSearch('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicule</h1>
          <p className="text-muted-foreground">Gestioneaza flota de camioane si remorci</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'trucks' ? 'Adauga Camion' : 'Adauga Remorca'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => handleTabChange('trucks')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'trucks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Camioane
        </button>
        <button
          onClick={() => handleTabChange('trailers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'trailers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Container className="h-4 w-4 inline mr-2" />
          Remorci
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'trucks' ? 'Cauta dupa numar inmatriculare...' : 'Cauta remorca...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* TRUCKS TAB */}
      {activeTab === 'trucks' && (
        <>
          {/* Add/Edit Truck Form */}
          {(showForm || editingTruck) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTruck ? 'Editeaza Camion' : 'Adauga Camion Nou'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTruckSubmit} className="space-y-4">
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
                      <Label htmlFor="vin">Serie Sasiu (VIN)</Label>
                      <Input
                        id="vin"
                        name="vin"
                        defaultValue={editingTruck?.vin}
                        placeholder="ex: WVWZZZ3CZWE123456"
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
                    <Button type="submit" disabled={createTruckMutation.isPending || updateTruckMutation.isPending}>
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
            {trucksLoading ? (
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
                      {truck.vin && (
                        <p>
                          <span className="text-muted-foreground">VIN:</span>{' '}
                          {truck.vin}
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
                          setTruckToDelete(truck.id)
                          setDeleteTruckDialogOpen(true)
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
        </>
      )}

      {/* TRAILERS TAB */}
      {activeTab === 'trailers' && (
        <>
          {/* Add/Edit Trailer Form */}
          {(showForm || editingTrailer) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTrailer ? 'Editeaza Remorca' : 'Adauga Remorca Noua'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrailerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Numar Inmatriculare *</Label>
                      <Input
                        id="registration_number"
                        name="registration_number"
                        defaultValue={editingTrailer?.registration_number}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vin">Serie Sasiu (VIN)</Label>
                      <Input
                        id="vin"
                        name="vin"
                        defaultValue={editingTrailer?.vin}
                        placeholder="ex: WVWZZZ3CZWE123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        name="brand"
                        defaultValue={editingTrailer?.brand}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        name="model"
                        defaultValue={editingTrailer?.model}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tip Remorca</Label>
                      <select
                        id="type"
                        name="type"
                        defaultValue={editingTrailer?.type || 'prelata'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {TRAILER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity_tons">Capacitate (tone)</Label>
                      <Input
                        id="capacity_tons"
                        name="capacity_tons"
                        type="number"
                        step="0.1"
                        defaultValue={editingTrailer?.capacity_tons}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume_m3">Volum (m³)</Label>
                      <Input
                        id="volume_m3"
                        name="volume_m3"
                        type="number"
                        step="0.1"
                        defaultValue={editingTrailer?.volume_m3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createTrailerMutation.isPending || updateTrailerMutation.isPending}>
                      {editingTrailer ? 'Salveaza' : 'Adauga'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingTrailer(null)
                      }}
                    >
                      Anuleaza
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Trailers list */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trailersLoading ? (
              <p>Se incarca...</p>
            ) : trailers.length === 0 ? (
              <p className="text-muted-foreground">Nu exista remorci inregistrate</p>
            ) : (
              trailers.map((trailer: TrailerData) => (
                <Card key={trailer.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Container className="h-5 w-5" />
                        {trailer.registration_number}
                      </CardTitle>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          trailer.status === 'activ'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {trailer.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {trailer.type && (
                        <p>
                          <span className="text-muted-foreground">Tip:</span>{' '}
                          {TRAILER_TYPES.find(t => t.value === trailer.type)?.label || trailer.type}
                        </p>
                      )}
                      {trailer.brand && (
                        <p>
                          <span className="text-muted-foreground">Marca:</span>{' '}
                          {trailer.brand} {trailer.model}
                        </p>
                      )}
                      {trailer.vin && (
                        <p>
                          <span className="text-muted-foreground">VIN:</span>{' '}
                          {trailer.vin}
                        </p>
                      )}
                      {trailer.capacity_tons && (
                        <p>
                          <span className="text-muted-foreground">Capacitate:</span>{' '}
                          {trailer.capacity_tons} tone
                        </p>
                      )}
                      {trailer.volume_m3 && (
                        <p>
                          <span className="text-muted-foreground">Volum:</span>{' '}
                          {trailer.volume_m3} m³
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">Adaugat:</span>{' '}
                        {formatDate(trailer.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTrailer(trailer)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editeaza
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setTrailerToDelete(trailer.id)
                          setDeleteTrailerDialogOpen(true)
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
          {trailersData?.pagination && (
            <div className="text-sm text-muted-foreground text-center">
              Afisare {trailers.length} din {trailersData.pagination.total} remorci
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTruckDialogOpen}
        onOpenChange={setDeleteTruckDialogOpen}
        title="Dezactivează camionul"
        description="Sigur doriți să dezactivați acest camion?"
        confirmText="Dezactivează"
        cancelText="Anulează"
        variant="destructive"
        isLoading={deleteTruckMutation.isPending}
        onConfirm={() => {
          if (truckToDelete) {
            deleteTruckMutation.mutate(truckToDelete)
          }
        }}
      />

      <ConfirmDialog
        open={deleteTrailerDialogOpen}
        onOpenChange={setDeleteTrailerDialogOpen}
        title="Dezactivează remorca"
        description="Sigur doriți să dezactivați această remorcă?"
        confirmText="Dezactivează"
        cancelText="Anulează"
        variant="destructive"
        isLoading={deleteTrailerMutation.isPending}
        onConfirm={() => {
          if (trailerToDelete) {
            deleteTrailerMutation.mutate(trailerToDelete)
          }
        }}
      />
    </div>
  )
}
