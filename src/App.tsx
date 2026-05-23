import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute.tsx'
import { AppLayout } from '@/components/layout/AppLayout.tsx'
import { ApiDocsPage, DocsIndexPage } from '@/features/docs/DocsPage.tsx'
import { EndpointPage } from '@/features/docs/EndpointPage.tsx'
import { LoginPage } from '@/features/auth/LoginPage.tsx'


const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          </Route>
          <Route path="*" element={<Navigate to="/docs" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
