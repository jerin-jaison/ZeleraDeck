/**
 * UnifiedStorefront
 *
 * Layout wrapper for all public storefronts at /<slug> and /<slug>/*.
 *
 * Fetches the public shop record to determine tier, then strictly dispatches:
 *   - is_pro === true  → renders <ProLayout /> which uses <Outlet /> for sub-routes
 *                        (/shop, /about, /contact, /wishlist, /product/:id)
 *   - is_pro === false → renders <StorePage /> (normal catalogue layout)
 *
 * NO SILENT FALLBACK: If tier cannot be determined or is_pro is missing,
 * renders an explicit error screen rather than defaulting to the wrong layout.
 */
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/axios'
import StorePage from './StorePage'
import ProLayout from '../pro/ProLayout'

export default function UnifiedStorefront() {
  const { slug } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['shop-tier', slug],
    queryFn: () => publicApi.get(`store/${slug}/?page=1&page_size=1`).then(r => r.data),
    enabled: !!slug,
    staleTime: 10_000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (error?.response?.status === 404) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[96px] font-black text-[#F0F0F0] leading-none">404</p>
        <p className="text-xl font-bold text-[#0A0A0A] mt-2">Store not found</p>
        <p className="text-sm text-[#737373] mt-2">This store link doesn't exist.</p>
      </div>
    )
  }

  // Strict check: if request failed or is_pro field is missing, show explicit error
  if (error || !data || typeof data.is_pro !== 'boolean') {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-bold text-[#0A0A0A] mb-2">Unable to Load Store</p>
        <p className="text-sm text-[#737373]">We couldn't determine this store's configuration. Please refresh or try again later.</p>
      </div>
    )
  }

  // Pro shops
  if (data.is_pro === true) {
    return <ProLayout />
  }

  // Normal shops
  if (data.is_pro === false) {
    return <StorePage />
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xl font-bold text-[#0A0A0A] mb-2">Configuration Error</p>
      <p className="text-sm text-[#737373]">Invalid store tier data.</p>
    </div>
  )
}
