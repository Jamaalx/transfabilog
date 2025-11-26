import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Truck } from 'lucide-react'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="flex items-center justify-center mb-8">
            <Truck className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Transport SaaS</h1>
          <p className="text-xl opacity-90">
            Fleet management platform for transport companies
          </p>
          <div className="mt-8 text-sm opacity-75">
            <p>Manage your fleet, drivers, trips and finances</p>
            <p>all in one place</p>
          </div>
        </div>
      </div>

      {/* Right side - auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Truck className="h-10 w-10 text-primary mr-2" />
            <span className="text-2xl font-bold">Transport SaaS</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
