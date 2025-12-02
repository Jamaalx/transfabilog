import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driversApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Search, User, Edit, Trash2, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react'

type DriverData = {
  id: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  license_number?: string
  license_expiry?: string
  medical_expiry?: string
  status: string
  employee_type?: string
  created_at: string
}

const EMPLOYEE_TYPES = [
  { value: 'sofer', label: 'Șofer' },
  { value: 'mecanic', label: 'Mecanic' },
  { value: 'portar', label: 'Portar' },
  { value: 'femeie_serviciu', label: 'Femeie de serviciu' },
  { value: 'asistent_manager', label: 'Asistent Manager' },
  { value: 'coordonator_transport', label: 'Coordonator Transport' },
  { value: 'altele', label: 'Altele' },
]

export default function DriversPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<DriverData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers', search, page],
    queryFn: () =>
      driversApi.getAll({ search: search || undefined, page, limit }).then((res) => res.data),
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => driversApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      setShowForm(false)
      toast({ title: 'Succes', description: 'Sofer adaugat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adauga soferul',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      driversApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      setEditingDriver(null)
      toast({ title: 'Succes', description: 'Sofer actualizat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza soferul',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      setDeleteDialogOpen(false)
      setDriverToDelete(null)
      toast({ title: 'Succes', description: 'Sofer dezactivat cu succes' })
    },
    onError: () => {
      setDeleteDialogOpen(false)
      setDriverToDelete(null)
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva soferul',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone') || undefined,
      email: formData.get('email') || undefined,
      license_number: formData.get('license_number') || undefined,
      license_expiry: formData.get('license_expiry') || undefined,
      medical_expiry: formData.get('medical_expiry') || undefined,
      employee_type: formData.get('employee_type') || 'sofer',
    }

    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const drivers = driversData?.data || []

  const isExpiringSoon = (date?: string) => {
    if (!date) return false
    const expiryDate = new Date(date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soferi</h1>
          <p className="text-muted-foreground">Gestioneaza soferii companiei</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adauga Sofer
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cauta dupa nume..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingDriver) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDriver ? 'Editeaza Sofer' : 'Adauga Sofer Nou'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prenume *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    defaultValue={editingDriver?.first_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nume *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    defaultValue={editingDriver?.last_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingDriver?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingDriver?.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">Numar Permis</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    defaultValue={editingDriver?.license_number}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_expiry">Expirare Permis</Label>
                  <Input
                    id="license_expiry"
                    name="license_expiry"
                    type="date"
                    defaultValue={editingDriver?.license_expiry?.split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical_expiry">Expirare Fisa Medicala</Label>
                  <Input
                    id="medical_expiry"
                    name="medical_expiry"
                    type="date"
                    defaultValue={editingDriver?.medical_expiry?.split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_type">Tip Angajat</Label>
                  <select
                    id="employee_type"
                    name="employee_type"
                    defaultValue={editingDriver?.employee_type || 'sofer'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {EMPLOYEE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDriver ? 'Salveaza' : 'Adauga'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDriver(null)
                  }}
                >
                  Anuleaza
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Drivers list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Se incarca...</p>
        ) : drivers.length === 0 ? (
          <p className="text-muted-foreground">Nu exista soferi inregistrati</p>
        ) : (
          drivers.map((driver: DriverData) => (
            <Card key={driver.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {driver.first_name} {driver.last_name}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      driver.status === 'activ'
                        ? 'bg-green-100 text-green-700'
                        : driver.status === 'concediu'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {driver.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {driver.phone}
                    </p>
                  )}
                  {driver.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {driver.email}
                    </p>
                  )}
                  {driver.employee_type && (
                    <p>
                      <span className="text-muted-foreground">Tip:</span>{' '}
                      {EMPLOYEE_TYPES.find(t => t.value === driver.employee_type)?.label || driver.employee_type}
                    </p>
                  )}
                  {driver.license_expiry && (
                    <p
                      className={
                        isExpiringSoon(driver.license_expiry)
                          ? 'text-red-600'
                          : ''
                      }
                    >
                      <span className="text-muted-foreground">Permis expira:</span>{' '}
                      {formatDate(driver.license_expiry)}
                    </p>
                  )}
                  {driver.medical_expiry && (
                    <p
                      className={
                        isExpiringSoon(driver.medical_expiry)
                          ? 'text-red-600'
                          : ''
                      }
                    >
                      <span className="text-muted-foreground">
                        Fisa medicala expira:
                      </span>{' '}
                      {formatDate(driver.medical_expiry)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingDriver(driver)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editeaza
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setDriverToDelete(driver.id)
                      setDeleteDialogOpen(true)
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

      {/* Pagination */}
      {driversData?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Afisare {(page - 1) * limit + 1}-{Math.min(page * limit, driversData.pagination.total)} din {driversData.pagination.total} soferi
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Inapoi
            </Button>
            <span className="text-sm text-muted-foreground">
              Pagina {page} din {Math.ceil(driversData.pagination.total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(driversData.pagination.total / limit)}
            >
              Inainte
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Dezactivează șoferul"
        description="Sigur doriți să dezactivați acest șofer? Acesta nu va mai putea fi asignat la curse."
        confirmText="Dezactivează"
        cancelText="Anulează"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (driverToDelete) {
            deleteMutation.mutate(driverToDelete)
          }
        }}
      />
    </div>
  )
}
