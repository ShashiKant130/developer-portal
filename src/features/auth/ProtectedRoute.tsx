import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/StateViews.tsx'

export function ProtectedRoute({ children }: { children: ReactNode }) {    // TODO: Implement authentication check
    const loading = false
    const user = false
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <Skeleton className="h-8 w-48" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
