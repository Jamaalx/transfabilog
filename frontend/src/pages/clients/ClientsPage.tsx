import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Building2, Edit, Trash2, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

type ClientData = {
  id: string
  company_name: string
  cui?: string
  registration_number?: string
  address?: string
  city?: string
  county?: string
  country?: string
  phone?: string
  email?: string
  contact_person?: string
  client_type?: string
  payment_terms?: number
  status: string
  created_at: string
}

const CLIENT_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'furnizor', label: 'Furnizor' },
  { value: 'partener', label: 'Partener' },
]

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const limit = 20

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', search, page],
    queryFn: () =>
      clientsApi.getAll({ search: search || undefined, page, limit }).then((res) => res.data),
  })

  // Reset page when search changes
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowForm(false)
      toast({ title: 'Succes', description: 'Client adaugat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adauga clientul',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setEditingClient(null)
      toast({ title: 'Succes', description: 'Client actualizat cu succes' })
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza clientul',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      toast({ title: 'Succes', description: 'Client dezactivat cu succes' })
    },
    onError: () => {
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva clientul',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      company_name: formData.get('company_name'),
      cui: formData.get('cui') || undefined,
      registration_number: formData.get('registration_number') || undefined,
      address: formData.get('address') || undefined,
      city: formData.get('city') || undefined,
      county: formData.get('county') || undefined,
      country: formData.get('country') || 'Romania',
      phone: formData.get('phone') || undefined,
      email: formData.get('email') || undefined,
      contact_person: formData.get('contact_person') || undefined,
      contact_phone: formData.get('contact_phone') || undefined,
      client_type: formData.get('client_type') || 'client',
      payment_terms: formData.get('payment_terms') ? Number(formData.get('payment_terms')) : 30,
      bank_name: formData.get('bank_name') || undefined,
      bank_account: formData.get('bank_account') || undefined,
      notes: formData.get('notes') || undefined,
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const clients = clientsData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">Gestioneaza clientii si furnizorii</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adauga Client
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cauta dupa nume, CUI, email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingClient) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? 'Editeaza Client' : 'Adauga Client Nou'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date firma */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Numele Firmei *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={editingClient?.company_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cui">CUI / Cod TVA</Label>
                  <Input
                    id="cui"
                    name="cui"
                    defaultValue={editingClient?.cui}
                    placeholder="RO12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Nr. Inregistrare</Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    defaultValue={editingClient?.registration_number}
                    placeholder="J40/1234/2020"
                  />
                </div>

                {/* Adresa */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingClient?.address}
                    placeholder="Strada, numar, bloc, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Oras</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingClient?.city}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">Judet</Label>
                  <Input
                    id="county"
                    name="county"
                    defaultValue={editingClient?.county}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Tara</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={editingClient?.country || 'Romania'}
                  />
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingClient?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingClient?.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Persoana Contact</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    defaultValue={editingClient?.contact_person}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefon Contact</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                  />
                </div>

                {/* Comercial */}
                <div className="space-y-2">
                  <Label htmlFor="client_type">Tip Client</Label>
                  <select
                    id="client_type"
                    name="client_type"
                    defaultValue={editingClient?.client_type || 'client'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {CLIENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Termen Plata (zile)</Label>
                  <Input
                    id="payment_terms"
                    name="payment_terms"
                    type="number"
                    defaultValue={editingClient?.payment_terms || 30}
                  />
                </div>

                {/* Bancar */}
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Banca</Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bank_account">IBAN</Label>
                  <Input
                    id="bank_account"
                    name="bank_account"
                    placeholder="RO49AAAA1B31007593840000"
                  />
                </div>

                {/* Note */}
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="notes">Note</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Informatii suplimentare..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingClient ? 'Salveaza' : 'Adauga'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingClient(null)
                  }}
                >
                  Anuleaza
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Se incarca...</p>
        ) : clients.length === 0 ? (
          <p className="text-muted-foreground">Nu exista clienti inregistrati</p>
        ) : (
          clients.map((client: ClientData) => (
            <Card key={client.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {client.company_name}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      client.status === 'activ'
                        ? 'bg-green-100 text-green-700'
                        : client.status === 'blocat'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {client.cui && (
                    <p>
                      <span className="text-muted-foreground">CUI:</span> {client.cui}
                    </p>
                  )}
                  {client.client_type && (
                    <p>
                      <span className="text-muted-foreground">Tip:</span>{' '}
                      {CLIENT_TYPES.find(t => t.value === client.client_type)?.label || client.client_type}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {client.phone}
                    </p>
                  )}
                  {client.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {client.email}
                    </p>
                  )}
                  {(client.city || client.country) && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {[client.city, client.county, client.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {client.contact_person && (
                    <p>
                      <span className="text-muted-foreground">Contact:</span> {client.contact_person}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Adaugat:</span>{' '}
                    {formatDate(client.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingClient(client)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editeaza
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setClientToDelete(client.id)
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
      {clientsData?.pagination && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Inapoi
          </Button>

          <div className="text-sm text-muted-foreground">
            Pagina {page} din {Math.ceil(clientsData.pagination.total / limit)}
            <span className="ml-2">({clientsData.pagination.total} clienti)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(clientsData.pagination.total / limit)}
          >
            Inainte
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Dezactivează clientul"
        description="Sigur doriți să dezactivați acest client?"
        confirmText="Dezactivează"
        cancelText="Anulează"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (clientToDelete) {
            deleteMutation.mutate(clientToDelete)
          }
        }}
      />
    </div>
  )
}
