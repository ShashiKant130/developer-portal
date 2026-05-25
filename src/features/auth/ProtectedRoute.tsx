import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/StateViews.tsx'
import { useAuth } from './useAuth.ts'


export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isGuest, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}