/**
 * UnifiedStorefront
 *
 * Layout wrapper for all public storefronts at /<slug> and /<slug>/*.
 *
 * Uses useStorefrontData:
 *   - Tries /api/pro/<slug>/page-data/ first.
 *   - Falls back seamlessly to old endpoints on ANY failure.
 *   - Seeds React Query caches so sub-components make zero extra requests.
 *   - Shows 'Store not found' ONLY when the old store endpoint returns 404.
 *   - Shows 'The store is having trouble right now' on 5xx server errors with Retry button.
 *   - Shows 'Can’t reach the server. Check your connection' on network/timeout/CORS failures with Retry button.
 */
import { useParams } from 'react-router-dom'
import { useStorefrontData } from '../hooks/useStorefrontData'
import StorePage from './StorePage'
import ProductPage from './ProductPage'
import ProLayout from '../pro/ProLayout'

export default function UnifiedStorefront() {
  const { slug, displayId } = useParams()
  const { data, isLoading, error, refetch } = useStorefrontData(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  // Handle failure modes
  if (error) {
    const errorType = error.type || (
      error.response?.status === 404 || error.status === 404
        ? 'NOT_FOUND'
        : (error.response?.status >= 500 && error.response?.status < 600) || (error.status >= 500 && error.status < 600)
          ? 'SERVER_ERROR'
          : 'NETWORK_ERROR'
    )

    // 1. Store really does not exist (404 from old store endpoint)
    if (errorType === 'NOT_FOUND') {
      return (
        <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[96px] font-black text-[#F0F0F0] leading-none">404</p>
          <p className="text-xl font-bold text-[#0A0A0A] mt-2">Store not found</p>
          <p className="text-sm text-[#737373] mt-2">This store link doesn't exist.</p>
        </div>
      )
    }

    // 2. Server answered with an error (5xx)
    if (errorType === 'SERVER_ERROR') {
      return (
        <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xl font-bold text-[#0A0A0A] mb-2">The store is having trouble right now</p>
          <p className="text-sm text-[#737373] mb-6">Our servers encountered an unexpected issue. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )
    }

    // 3. No response at all (network failure, timeout or CORS block)
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-bold text-[#0A0A0A] mb-2">Can’t reach the server. Check your connection</p>
        <p className="text-sm text-[#737373] mb-6">Unable to connect to the store service. Please check your internet connection or verify CORS access.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  // Fallback check if data is malformed
  if (!data || typeof data.is_pro !== 'boolean') {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-bold text-[#0A0A0A] mb-2">The store is having trouble right now</p>
        <p className="text-sm text-[#737373] mb-6">Received invalid store data.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  // Pro shops: renders ProLayout which uses <Outlet /> to render sub-routes
  // (/shop, /product/:displayId -> ProProductPage, /wishlist, /about, /contact)
  if (data.is_pro === true) {
    return <ProLayout />
  }

  // Normal shops: render ProductPage if displayId is in URL, otherwise StorePage
  if (data.is_pro === false) {
    return displayId ? <ProductPage /> : <StorePage />
  }

  return null
}
