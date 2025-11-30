import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

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
            <img src="/logo.webp" alt="Floteris Logo" className="h-24 w-24 brightness-0 invert" />
          </div>
          <h1 className="text-4xl font-bold mb-4">FLOTERIS</h1>
          <p className="text-xl opacity-90">
            Platformă inteligentă pentru managementul flotei
          </p>
          <div className="mt-8 text-sm opacity-75">
            <p>Vehicule, șoferi, curse și finanțe</p>
            <p>totul într-un singur loc</p>
          </div>
          <p className="mt-12 text-xs opacity-50">by ZED-ZEN</p>
        </div>
      </div>

      {/* Right side - auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src="/logo.webp" alt="Floteris Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold">FLOTERIS</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
