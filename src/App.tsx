import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute.tsx'
import { AppLayout } from '@/components/layout/AppLayout.tsx'
import { ApiDocsPage, DocsIndexPage } from '@/features/docs/DocsPage.tsx'
import { EndpointPage } from '@/features/docs/EndpointPage.tsx'
import { LoginPage } from '@/features/auth/LoginPage.tsx'
import { KeysPage } from '@/features/keys/KeysPage.tsx'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage.tsx'
import { StatusPage } from '@/features/status/StatusPage.tsx'
import { ChangelogPage } from '@/features/changelog/ChangelogPage.tsx'
import { AuthProvider } from '@/features/auth/AuthProvider.tsx'
import { SignupPage } from '@/features/auth/SignupPage.tsx'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/docs" replace />} />
            <Route path="docs" element={<DocsIndexPage />} />
            <Route path="docs/:apiId" element={<ApiDocsPage />} />
            <Route path="docs/:apiId/endpoint/:endpointId" element={<EndpointPage />} />
            <Route path="keys" element={<KeysPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="status" element={<StatusPage />} />
            <Route path="changelog" element={<ChangelogPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/docs" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
