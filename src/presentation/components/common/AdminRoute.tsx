import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/presentation/stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
