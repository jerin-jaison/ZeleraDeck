import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './hooks/useAuth'
import MaintenanceGate from './components/MaintenanceGate'
import MaintenancePage from './pages/MaintenancePage'
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
import AdminMaintenance from './pages/admin/AdminMaintenance'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function Protected({ children }) {
  const { isAuthenticated, hydrated } = useAuth()

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#F0F0F0] border-t-[#0A0A0A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
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

function AppRoutes() {
  return (
    <Routes>
      {/* Preview route — always accessible regardless of maintenance */}
      <Route path="/maintenance-preview" element={
        <MaintenancePage message="Preview — this is what visitors see during maintenance." />
      } />

      {/* Everything else goes through the maintenance gate */}
      <Route path="*" element={
        <MaintenanceGate>
          <AuthProvider>
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
                <Route path="maintenance" element={<AdminMaintenance />} />
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </MaintenanceGate>
      } />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
)
