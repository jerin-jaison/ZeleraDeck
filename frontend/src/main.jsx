import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './context/ToastContext'
import './index.css'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import StoreInfo from './pages/StoreInfo'
import StorePage from './pages/StorePage'
import ProductPage from './pages/ProductPage'
import ContactPage from './pages/ContactPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShops from './pages/admin/AdminShops'
import AdminCreateShop from './pages/admin/AdminCreateShop'
import AdminShopDetail from './pages/admin/AdminShopDetail'
import AdminSettings from './pages/admin/AdminSettings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function Protected({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" replace />
}

function NotFoundPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[96px] font-black text-[#F0F0F0] leading-none">404</p>
      <p className="text-xl font-bold text-[#0A0A0A] mt-2">Page not found</p>
      <p className="text-sm text-[#737373] mt-2">This page doesn't exist.</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/store/:slug" element={<StorePage />} />
            <Route path="/store/:slug/product/:displayId" element={<ProductPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Protected — Shop Owner */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/dashboard/add-product" element={<Protected><AddProduct /></Protected>} />
            <Route path="/dashboard/edit-product/:id" element={<Protected><EditProduct /></Protected>} />
            <Route path="/dashboard/store-info" element={<Protected><StoreInfo /></Protected>} />

            {/* Admin — nested under AdminLayout */}
            <Route path="/admin-panel" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="shops" element={<AdminShops />} />
              <Route path="shops/:id" element={<AdminShopDetail />} />
              <Route path="create-shop" element={<AdminCreateShop />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
)
