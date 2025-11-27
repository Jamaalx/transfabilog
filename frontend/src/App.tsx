import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Toaster } from '@/components/ui/toaster'

// Layouts
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import VehiclesPage from '@/pages/vehicles/VehiclesPage'
import DriversPage from '@/pages/drivers/DriversPage'
import TripsPage from '@/pages/trips/TripsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import AIAnalyticsPage from '@/pages/ai/AIAnalyticsPage'
import DocumentsListPage from '@/pages/documents/DocumentsListPage'
import DocumentUploadPage from '@/pages/documents/DocumentUploadPage'
import DocumentValidationPage from '@/pages/documents/DocumentValidationPage'
import DKVPage from '@/pages/dkv/DKVPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles/*" element={<VehiclesPage />} />
          <Route path="/drivers/*" element={<DriversPage />} />
          <Route path="/trips/*" element={<TripsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai" element={<AIAnalyticsPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/documents/:id" element={<DocumentValidationPage />} />
          <Route path="/documents/:id/validate" element={<DocumentValidationPage />} />
          <Route path="/dkv" element={<DKVPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
