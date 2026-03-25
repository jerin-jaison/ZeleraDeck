import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Toast from './components/Toast'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import StoreInfo from './pages/StoreInfo'
import StorePage from './pages/StorePage'
import ProductPage from './pages/ProductPage'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'
import StoreDisabled from './pages/StoreDisabled'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

// Protected route: redirects to /login if no token in localStorage
function Protected({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toast />
        <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/store/:slug" element={<StorePage />} />
            <Route path="/store/:slug/product/:displayId" element={<ProductPage />} />
            <Route path="/store-disabled" element={<StoreDisabled />} />
            <Route path="/404" element={<NotFound />} />

            {/* Protected — Shop Owner */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/dashboard/add-product" element={<Protected><AddProduct /></Protected>} />
            <Route path="/dashboard/edit-product/:id" element={<Protected><EditProduct /></Protected>} />
            <Route path="/dashboard/store-info" element={<Protected><StoreInfo /></Protected>} />

            {/* Admin */}
            <Route path="/admin-panel" element={<AdminPanel />} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
