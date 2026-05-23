import { BrowserRouter, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const queryClient = new QueryClient()

function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/*TODO: Add Features and Protected Routes */}
          </Routes>
        </BrowserRouter>
    </QueryClientProvider>
    </>
  )
}

export default App
