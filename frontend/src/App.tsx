import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Toaster } from '@/components/ui/toaster'

// Layouts
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages
import LandingPage from '@/pages/LandingPage' // <--- Importa pagina noua
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
// ... alte importuri existente ...
import VehiclesPage from '@/pages/vehicles/VehiclesPage'
import DriversPage from '@/pages/drivers/DriversPage'
import DriverDocumentsPage from '@/pages/drivers/DriverDocumentsPage'
import ClientsPage from '@/pages/clients/ClientsPage'
import TripsPage from '@/pages/trips/TripsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import AIAnalyticsPage from '@/pages/ai/AIAnalyticsPage'
import DocumentsListPage from '@/pages/documents/DocumentsListPage'
import DocumentUploadPage from '@/pages/documents/DocumentUploadPage'
import DocumentValidationPage from '@/pages/documents/DocumentValidationPage'
import BankStatementReviewPage from '@/pages/documents/BankStatementReviewPage'
import DKVPage from '@/pages/dkv/DKVPage'
import EurowagPage from '@/pages/eurowag/EurowagPage'
import VeragPage from '@/pages/verag/VeragPage'
import HelpPage from '@/pages/help/HelpPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import GDPRPage from '@/pages/GDPRPage'

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
        {/* Public Route - Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Legal Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/gdpr" element={<GDPRPage />} />

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
          {/* Remove the redirect from root since we have a landing page now */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles/*" element={<VehiclesPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/drivers/documents" element={<DriverDocumentsPage />} />
          <Route path="/clients/*" element={<ClientsPage />} />
          <Route path="/trips/*" element={<TripsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai" element={<AIAnalyticsPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/documents/:id" element={<DocumentValidationPage />} />
          <Route path="/documents/:id/validate" element={<DocumentValidationPage />} />
          <Route path="/documents/:documentId/bank-review" element={<BankStatementReviewPage />} />
          <Route path="/dkv" element={<DKVPage />} />
          <Route path="/eurowag" element={<EurowagPage />} />
          <Route path="/verag" element={<VeragPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App