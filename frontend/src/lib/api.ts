import axios from 'axios'
import { getSupabaseAsync } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const supabase = await getSupabaseAsync()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    console.warn('[API] Could not get auth session:', error)
  }
  return config
})

// Handle response errors with automatic retry after token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Token expired, try to refresh
        const supabase = await getSupabaseAsync()
        const { data, error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError || !data.session) {
          // Refresh failed, redirect to login
          console.error('Session refresh failed:', refreshError?.message)
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Update the authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`

        // Retry the original request with the new token
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

// API functions
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getFinancial: () => api.get('/dashboard/financial'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getRecentTrips: () => api.get('/dashboard/recent-trips'),
}

export const vehiclesApi = {
  getTrucks: (params?: Record<string, unknown>) => api.get('/vehicles/trucks', { params }),
  getTruck: (id: string) => api.get(`/vehicles/trucks/${id}`),
  createTruck: (data: Record<string, unknown>) => api.post('/vehicles/trucks', data),
  updateTruck: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/trucks/${id}`, data),
  deleteTruck: (id: string) => api.delete(`/vehicles/trucks/${id}`),
  getTrailers: (params?: Record<string, unknown>) => api.get('/vehicles/trailers', { params }),
  getTrailer: (id: string) => api.get(`/vehicles/trailers/${id}`),
  createTrailer: (data: Record<string, unknown>) => api.post('/vehicles/trailers', data),
  updateTrailer: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/trailers/${id}`, data),
  deleteTrailer: (id: string) => api.delete(`/vehicles/trailers/${id}`),
}

export const driversApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/drivers', { params }),
  getOne: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post('/drivers', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
}

export const clientsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/clients', { params }),
  getOne: (id: string) => api.get(`/clients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/clients', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
}

export const tripsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/trips', { params }),
  getOne: (id: string) => api.get(`/trips/${id}`),
  create: (data: Record<string, unknown>) => api.post('/trips', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
  addExpense: (tripId: string, data: Record<string, unknown>) => api.post(`/trips/${tripId}/expenses`, data),
  addStop: (tripId: string, data: Record<string, unknown>) => api.post(`/trips/${tripId}/stops`, data),
}

export const reportsApi = {
  getFinancial: (params?: Record<string, unknown>) => api.get('/reports/financial', { params }),
  getTrips: (params?: Record<string, unknown>) => api.get('/reports/trips', { params }),
  getFleet: (params?: Record<string, unknown>) => api.get('/reports/fleet', { params }),
  getExpenses: (params?: Record<string, unknown>) => api.get('/reports/expenses', { params }),
  getDocuments: () => api.get('/reports/documents'),
  getProfitability: (params?: Record<string, unknown>) => api.get('/reports/profitability', { params }),
}

export const aiApi = {
  getInsights: () => api.get('/ai/insights'),
  getDataSummary: () => api.get('/ai/data-summary'),
  chat: (message: string, conversationHistory?: Array<{ role: string; content: string }>) =>
    api.post('/ai/chat', { message, conversationHistory }),
  getPredictions: () => api.get('/ai/predictions'),
  getRecommendations: () => api.get('/ai/recommendations'),
}

export const uploadedDocumentsApi = {
  getTypes: () => api.get('/uploaded-documents/types'),
  getStats: () => api.get('/uploaded-documents/stats'),
  getAll: (params?: Record<string, unknown>) => api.get('/uploaded-documents', { params }),
  getOne: (id: string) => api.get(`/uploaded-documents/${id}`),
  upload: (formData: FormData) => api.post('/uploaded-documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  process: (id: string) => api.post(`/uploaded-documents/${id}/process`),
  processBatch: (documentIds: string[]) => api.post('/uploaded-documents/process-batch', { document_ids: documentIds }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/uploaded-documents/${id}`, data),
  delete: (id: string) => api.delete(`/uploaded-documents/${id}`),
  createTransaction: (id: string) => api.post(`/uploaded-documents/${id}/create-transaction`),
  confirm: (id: string, data: Record<string, unknown>) => api.post(`/uploaded-documents/${id}/confirm`, data),
  createTripExpenses: (id: string, tripId: string) => api.post(`/uploaded-documents/${id}/create-trip-expenses`, { trip_id: tripId }),
  // Bank statement specific
  confirmBankStatement: (id: string, data: Record<string, unknown>) => api.post(`/uploaded-documents/${id}/confirm-bank-statement`, data),
  getUnpaidInvoices: () => api.get('/uploaded-documents/unpaid-invoices'),
}

export const dkvApi = {
  // Import - supports provider parameter for DKV, EUROWAG, VERAG
  // Saves to TEMP staging tables
  import: (formData: FormData, provider?: string) => {
    const url = provider ? `/dkv/import?provider=${provider}` : '/dkv/import'
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // ============= TEMP STAGING ENDPOINTS =============
  // Batches from TEMP tables
  getTempBatches: (provider?: string) => {
    const params = provider ? { provider } : {}
    return api.get('/dkv/temp/batches', { params })
  },
  // Transactions from TEMP tables
  getTempTransactions: (params?: Record<string, unknown>) => api.get('/dkv/temp/transactions', { params }),
  // Summary from TEMP tables
  getTempSummary: (provider?: string) => {
    const params = provider ? { provider } : {}
    return api.get('/dkv/temp/summary', { params })
  },
  // Match in TEMP table
  matchTempTransaction: (id: string, truckId: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.put(`/dkv/temp/transaction/${id}/match`, { truck_id: truckId }, { params })
  },
  // Delete batch from TEMP
  deleteTempBatch: (id: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.delete(`/dkv/temp/batch/${id}`, { params })
  },
  // Approve - move from TEMP to FINAL and create expenses
  approveTempTransactions: (transactionIds: string[], provider?: string) => {
    const params = provider ? { provider } : {}
    return api.post('/dkv/temp/approve', { transaction_ids: transactionIds }, { params })
  },
  // Ignore single transaction in TEMP (deletes from staging)
  ignoreTempTransaction: (id: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.patch(`/dkv/temp/transaction/${id}/ignore`, {}, { params })
  },
  // Bulk ignore transactions in TEMP (deletes from staging)
  bulkIgnoreTempTransactions: (transactionIds: string[], provider?: string) => {
    const params = provider ? { provider } : {}
    return api.post('/dkv/temp/transactions/bulk-ignore', { transaction_ids: transactionIds }, { params })
  },
  // Bulk delete all transactions from TEMP staging
  bulkDeleteTempTransactions: (provider?: string) => {
    const params = provider ? { provider } : {}
    return api.delete('/dkv/temp/transactions/bulk-delete', { params })
  },

  // ============= FINAL TABLE ENDPOINTS =============
  // Batches - supports provider filtering
  getBatches: (provider?: string) => {
    const params = provider ? { provider } : {}
    return api.get('/dkv/batches', { params })
  },
  getBatch: (id: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.get(`/dkv/batches/${id}`, { params })
  },
  deleteBatch: (id: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.delete(`/dkv/batches/${id}`, { params })
  },
  // Transactions - supports status and provider filtering
  getTransactions: (params?: Record<string, unknown>) => api.get('/dkv/transactions', { params }),
  getTransaction: (id: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.get(`/dkv/transactions/${id}`, { params })
  },
  matchTransaction: (id: string, truckId: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.patch(`/dkv/transactions/${id}/match`, { truck_id: truckId }, { params })
  },
  ignoreTransaction: (id: string, notes?: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.patch(`/dkv/transactions/${id}/ignore`, { notes }, { params })
  },
  createExpense: (id: string, tripId?: string, provider?: string) => {
    const params = provider ? { provider } : {}
    return api.post(`/dkv/transactions/${id}/create-expense`, { trip_id: tripId }, { params })
  },
  bulkCreateExpenses: (transactionIds: string[], provider?: string) => {
    const params = provider ? { provider } : {}
    return api.post('/dkv/transactions/bulk-create-expenses', { transaction_ids: transactionIds }, { params })
  },
  bulkIgnoreTransactions: (transactionIds: string[], provider?: string) => {
    const params = provider ? { provider } : {}
    return api.post('/dkv/transactions/bulk-ignore', { transaction_ids: transactionIds }, { params })
  },
  bulkDeleteTransactions: (status: 'ignored' | 'all', provider?: string) => {
    const params: Record<string, string> = { status }
    if (provider) params.provider = provider
    return api.delete('/dkv/transactions/bulk-delete', { params })
  },
  // Summary - supports provider filtering and batch filtering
  getSummary: (provider?: string, options?: { batch_id?: string; latest?: boolean }) => {
    const params: Record<string, string | boolean> = {}
    if (provider) params.provider = provider
    if (options?.batch_id) params.batch_id = options.batch_id
    if (options?.latest) params.latest = true
    return api.get('/dkv/summary', { params })
  },
}
