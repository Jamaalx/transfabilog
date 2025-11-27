import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login'
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
  createTrailer: (data: Record<string, unknown>) => api.post('/vehicles/trailers', data),
}

export const driversApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/drivers', { params }),
  getOne: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post('/drivers', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
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
  // Import
  import: (formData: FormData) => api.post('/dkv/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Batches
  getBatches: (params?: Record<string, unknown>) => api.get('/dkv/batches', { params }),
  getBatch: (id: string) => api.get(`/dkv/batches/${id}`),
  deleteBatch: (id: string) => api.delete(`/dkv/batches/${id}`),
  // Transactions
  getTransactions: (params?: Record<string, unknown>) => api.get('/dkv/transactions', { params }),
  getTransaction: (id: string) => api.get(`/dkv/transactions/${id}`),
  matchTransaction: (id: string, truckId: string) => api.patch(`/dkv/transactions/${id}/match`, { truck_id: truckId }),
  ignoreTransaction: (id: string, notes?: string) => api.patch(`/dkv/transactions/${id}/ignore`, { notes }),
  createExpense: (id: string, tripId?: string) => api.post(`/dkv/transactions/${id}/create-expense`, { trip_id: tripId }),
  bulkCreateExpenses: (transactionIds: string[]) => api.post('/dkv/transactions/bulk-create-expenses', { transaction_ids: transactionIds }),
  // Summary
  getSummary: () => api.get('/dkv/summary'),
}
