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
 *   - Shows 'Unable to load store' with a Retry button on any other error.
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

  // 404 from the fallback store endpoint -> Store truly does not exist
  if (error?.response?.status === 404 || error?.status === 404) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[96px] font-black text-[#F0F0F0] leading-none">404</p>
        <p className="text-xl font-bold text-[#0A0A0A] mt-2">Store not found</p>
        <p className="text-sm text-[#737373] mt-2">This store link doesn't exist.</p>
      </div>
    )
  }

  // Any other error (5xx, network, parse error) -> show error with retry button
  if (error || !data || typeof data.is_pro !== 'boolean') {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-bold text-[#0A0A0A] mb-2">Unable to Load Store</p>
        <p className="text-sm text-[#737373] mb-6">We couldn't load this store's configuration. Please check your connection or try again.</p>
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

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xl font-bold text-[#0A0A0A] mb-2">Unable to Load Store</p>
      <p className="text-sm text-[#737373] mb-6">Invalid store tier data.</p>
      <button
        onClick={() => refetch()}
        className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        Retry
      </button>
    </div>
  )
}
