import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
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
import HomePage from './pages/HomePage'
import OldHomePage from './pages/OldHomePage'
import WhyUsPage from './pages/WhyUsPage'
import SignupPage from './pages/SignupPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import SocialProofToast from './components/SocialProofToast'
import SplashScreen from './components/SplashScreen'
import UnifiedStorefront from './pages/UnifiedStorefront'

// Pro storefront pages
import ProLayout from './pro/ProLayout'
import ProHomePage from './pro/ProHomePage'
import ProShopPage from './pro/ProShopPage'
import ProProductPage from './pro/ProProductPage'
import ProWishlistPage from './pro/ProWishlistPage'
import ProAboutPage from './pro/ProAboutPage'
import ProContactPage from './pro/ProContactPage'

// Pro admin pages
import ProAdminGuard from './pro/admin/ProAdminGuard'
import ProAdminLayout from './pro/admin/ProAdminLayout'
import ProAdminDashboardPage from './pro/admin/ProAdminDashboardPage'
import ProAdminProductsPage from './pro/admin/ProAdminProductsPage'
import ProAdminProductFormPage from './pro/admin/ProAdminProductFormPage'
import ProAdminAboutPage from './pro/admin/ProAdminAboutPage'
import ProAdminContactPage from './pro/admin/ProAdminContactPage'
import ProAdminHomepagePage from './pro/admin/ProAdminHomepagePage'

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

// ── GA4 Pageview tracker ──────────────────────────────────────────────────────
function GA4PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // Only fire if GA4 is loaded
    if (typeof window.gtag !== 'function') return
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])

  return null
}
// ─────────────────────────────────────────────────────────────────────────────

function Protected({ children }) {
  const { isAuthenticated, isPro, shop, hydrated } = useAuth()

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#F0F0F0] border-t-[#0A0A0A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If shop owner is Pro, route to Pro Admin panel instead of normal user dashboard
  if (isPro && shop?.slug) {
    return <Navigate to={`/pro-admin/${shop.slug}/dashboard`} replace />
  }

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

// ── Legacy redirect helpers — keep old /store/ and /pro/ URLs alive indefinitely
function LegacyStoreRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/${slug}`} replace />
}
function LegacyStoreProductRedirect() {
  const { slug, displayId } = useParams()
  return <Navigate to={`/${slug}/product/${displayId}`} replace />
}
function LegacyProRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/${slug}`} replace />
}
function LegacyProSubpathRedirect() {
  // Matches /pro/:slug/* — e.g. /pro/labella/shop → /labella/shop
  const { slug, '*': rest } = useParams()
  const subPath = rest ? `/${rest}` : ''
  return <Navigate to={`/${slug}${subPath}`} replace />
}
// ───────────────────────────────────────────────────────────────────────────

const PUBLIC_TOAST_PATHS = ['/', '/why-us', '/contact']

function AppRoutes() {
  const location = useLocation()
  const showToast = PUBLIC_TOAST_PATHS.includes(location.pathname)

  return (
    <>
      <GA4PageTracker />
      {showToast && <SocialProofToast />}
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
                {/* Public marketing */}
                <Route path="/" element={<HomePage />} />
                <Route path="/old-home" element={<OldHomePage />} />
                <Route path="/why-us" element={<WhyUsPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Legacy redirects — keep old /store/<slug> and /pro/<slug> URLs alive */}
                <Route path="/store/:slug" element={<LegacyStoreRedirect />} />
                <Route path="/store/:slug/product/:displayId" element={<LegacyStoreProductRedirect />} />
                <Route path="/pro/:slug" element={<LegacyProRedirect />} />
                <Route path="/pro/:slug/*" element={<LegacyProSubpathRedirect />} />

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

                {/* Pro Admin — shop owner management panel (UNCHANGED) */}
                <Route path="/pro-admin/:slug" element={
                  <ProAdminGuard>
                    <ProAdminLayout />
                  </ProAdminGuard>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ProAdminDashboardPage />} />
                  <Route path="homepage" element={<ProAdminHomepagePage />} />
                  <Route path="products" element={<ProAdminProductsPage />} />
                  <Route path="products/add" element={<ProAdminProductFormPage mode="add" />} />
                  <Route path="products/edit/:displayId" element={<ProAdminProductFormPage mode="edit" />} />
                  <Route path="about" element={<ProAdminAboutPage />} />
                  <Route path="contact" element={<ProAdminContactPage />} />
                </Route>

                {/*
                  Unified public storefront — must come last before 404.
                  /:slug → UnifiedStorefront determines tier (Pro vs Normal).
                  Pro sub-routes are children; ProLayout's <Outlet /> renders them.
                  Normal shops render StorePage or ProductPage based on route parameters.
                */}
                <Route path="/:slug" element={<UnifiedStorefront />}>
                  <Route index element={<ProHomePage />} />
                  <Route path="shop" element={<ProShopPage />} />
                  <Route path="product/:displayId" element={<ProProductPage />} />
                  <Route path="wishlist" element={<ProWishlistPage />} />
                  <Route path="about" element={<ProAboutPage />} />
                  <Route path="contact" element={<ProContactPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AuthProvider>
          </MaintenanceGate>
        } />
      </Routes>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <ThemeProvider>
              <AppRoutes />
            </ThemeProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
)
