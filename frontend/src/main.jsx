/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './hooks/useAuth'
import MaintenanceGate from './components/MaintenanceGate'
import './index.css'

// ── Eager Storefront & Pro Storefront imports (fastest critical paint) ────────
import UnifiedStorefront from './pages/UnifiedStorefront'
import StorePage from './pages/StorePage'
import ProductPage from './pages/ProductPage'
import ProLayout from './pro/ProLayout'
import ProHomePage from './pro/ProHomePage'
import ProShopPage from './pro/ProShopPage'
import ProProductPage from './pro/ProProductPage'
import ProWishlistPage from './pro/ProWishlistPage'
import ProAboutPage from './pro/ProAboutPage'
import ProContactPage from './pro/ProContactPage'

// ── Lazy-loaded Marketing pages ──────────────────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'))
const OldHomePage = lazy(() => import('./pages/OldHomePage'))
const WhyUsPage = lazy(() => import('./pages/WhyUsPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))

// ── Lazy-loaded Login ────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login'))

// ── Lazy-loaded Shop Owner Dashboard pages ───────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AddProduct = lazy(() => import('./pages/AddProduct'))
const EditProduct = lazy(() => import('./pages/EditProduct'))
const StoreInfo = lazy(() => import('./pages/StoreInfo'))

// ── Lazy-loaded Admin panel pages ────────────────────────────────────────────
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminShops = lazy(() => import('./pages/admin/AdminShops'))
const AdminCreateShop = lazy(() => import('./pages/admin/AdminCreateShop'))
const AdminShopDetail = lazy(() => import('./pages/admin/AdminShopDetail'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminMaintenance = lazy(() => import('./pages/admin/AdminMaintenance'))

// ── Lazy-loaded Pro Admin pages ──────────────────────────────────────────────
const ProAdminGuard = lazy(() => import('./pro/admin/ProAdminGuard'))
const ProAdminLayout = lazy(() => import('./pro/admin/ProAdminLayout'))
const ProAdminDashboardPage = lazy(() => import('./pro/admin/ProAdminDashboardPage'))
const ProAdminProductsPage = lazy(() => import('./pro/admin/ProAdminProductsPage'))
const ProAdminProductFormPage = lazy(() => import('./pro/admin/ProAdminProductFormPage'))
const ProAdminAboutPage = lazy(() => import('./pro/admin/ProAdminAboutPage'))
const ProAdminContactPage = lazy(() => import('./pro/admin/ProAdminContactPage'))
const ProAdminHomepagePage = lazy(() => import('./pro/admin/ProAdminHomepagePage'))
const ProAdminAnalyticsPage = lazy(() => import('./pro/admin/ProAdminAnalyticsPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function PageSpinner() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#F0F0F0] border-t-[#0A0A0A] rounded-full animate-spin" />
    </div>
  )
}

// ── GA4 Pageview tracker ──────────────────────────────────────────────────────
function GA4PageTracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])

  return null
}

// ── Auth layout route: keeps AuthProvider mounted between login, dashboard & pro-admin
function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

function Protected({ children }) {
  const { isAuthenticated, isPro, shop, hydrated } = useAuth()

  if (!hydrated) {
    return <PageSpinner />
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If shop owner is Pro, route to Pro Admin panel instead of normal user dashboard
  if (isPro && shop?.slug) {
    return <Navigate to={`/pro-admin/${shop.slug}/dashboard`} replace />
  }

  return children
}

// ── Legacy redirect helpers ──────────────────────────────────────────────────
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
  const { slug, '*': rest } = useParams()
  const subPath = rest ? `/${rest}` : ''
  return <Navigate to={`/${slug}${subPath}`} replace />
}

function AppRoutes() {
  return (
    <>
      <GA4PageTracker />
      <Routes>
        {/* Preview route — accessible during maintenance */}
        <Route
          path="/maintenance-preview"
          element={
            <Suspense fallback={<PageSpinner />}>
              <MaintenancePage message="Preview — this is what visitors see during maintenance." />
            </Suspense>
          }
        />

        {/* Everything else goes through the non-blocking MaintenanceGate */}
        <Route
          path="*"
          element={
            <MaintenanceGate>
              <Suspense fallback={<PageSpinner />}>
                <Routes>
                  {/* Public marketing (AuthProvider not mounted) */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/old-home" element={<OldHomePage />} />
                  <Route path="/why-us" element={<WhyUsPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/directory" element={<DirectoryPage />} />
                  <Route path="/shops" element={<Navigate to="/directory" replace />} />

                  {/* Legacy redirects */}
                  <Route path="/store/:slug" element={<LegacyStoreRedirect />} />
                  <Route path="/store/:slug/product/:displayId" element={<LegacyStoreProductRedirect />} />
                  <Route path="/pro/:slug" element={<LegacyProRedirect />} />
                  <Route path="/pro/:slug/*" element={<LegacyProSubpathRedirect />} />

                  {/* Admin panel (independent from shop owner auth) */}
                  <Route path="/admin-panel" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="shops" element={<AdminShops />} />
                    <Route path="shops/:id" element={<AdminShopDetail />} />
                    <Route path="create-shop" element={<AdminCreateShop />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="maintenance" element={<AdminMaintenance />} />
                  </Route>

                  {/* Shared AuthProvider layout for Login, Dashboard, and Pro Admin */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />

                    {/* Protected — Shop Owner */}
                    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                    <Route path="/dashboard/add-product" element={<Protected><AddProduct /></Protected>} />
                    <Route path="/dashboard/edit-product/:id" element={<Protected><EditProduct /></Protected>} />
                    <Route path="/dashboard/store-info" element={<Protected><StoreInfo /></Protected>} />

                    {/* Pro Admin */}
                    <Route
                      path="/pro-admin/:slug"
                      element={
                        <ProAdminGuard>
                          <ProAdminLayout />
                        </ProAdminGuard>
                      }
                    >
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<ProAdminDashboardPage />} />
                      <Route path="analytics" element={<ProAdminAnalyticsPage />} />
                      <Route path="homepage" element={<ProAdminHomepagePage />} />
                      <Route path="products" element={<ProAdminProductsPage />} />
                      <Route path="products/add" element={<ProAdminProductFormPage mode="add" />} />
                      <Route path="products/edit/:displayId" element={<ProAdminProductFormPage mode="edit" />} />
                      <Route path="about" element={<ProAdminAboutPage />} />
                      <Route path="contact" element={<ProAdminContactPage />} />
                    </Route>
                  </Route>

                  {/*
                    Unified public storefront — EAGER (critical path for buyers).
                    Must come last before 404 catch-all.
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
              </Suspense>
            </MaintenanceGate>
          }
        />
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
