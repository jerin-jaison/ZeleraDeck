import { useQuery, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '../api/axios'

export class StorefrontError extends Error {
  constructor(type, message, status = null, originalError = null) {
    super(message)
    this.name = 'StorefrontError'
    this.type = type // 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR'
    this.status = status
    this.originalError = originalError
  }
}

function classifyError(err) {
  // 1. 404 from store endpoint -> Not Found
  if (err?.response?.status === 404 || err?.status === 404) {
    return {
      type: 'NOT_FOUND',
      status: 404,
      message: 'Store not found',
    }
  }

  // 2. 5xx Server Error
  if (err?.response?.status >= 500 && err?.response?.status < 600) {
    return {
      type: 'SERVER_ERROR',
      status: err.response.status,
      message: 'The store is having trouble right now',
    }
  }

  // 3. No response at all: network failure, timeout, or CORS block
  return {
    type: 'NETWORK_ERROR',
    status: err?.response?.status || null,
    message: "Can’t reach the server. Check your connection",
  }
}

/**
 * useStorefrontData
 *
 * Single unified storefront data hook:
 * 1. Calls /api/pro/<slug>/page-data/ first (timeout 8s <= 15s).
 * 2. If page-data fails for ANY reason (404, 5xx, timeout, network error),
 *    falls back to the old flow:
 *      - Store tier call: /api/store/<slug>/?page=1&page_size=1
 *      - If Pro, calls /api/pro/<slug>/ and /api/pro/<slug>/about/
 * 3. Classifies final errors:
 *      - NOT_FOUND (404): store does not exist
 *      - SERVER_ERROR (5xx): backend exception
 *      - NETWORK_ERROR: no response / network error / timeout / CORS block
 * 4. Seeds query caches for 'pro-store' and 'pro-about-blocks' on success.
 * 5. Early failure never caches an error as store data.
 */
export function useStorefrontData(slug) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['storefront-data', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Store slug is required')

      const apiBase = publicApi.defaults.baseURL || import.meta.env.VITE_API_URL || 'unknown'

      // ── Step 1: Try combined page-data endpoint (timeout <= 15s) ───────────
      try {
        const res = await publicApi.get(`pro/${slug}/page-data/`, { timeout: 8000 })
        const pageData = res.data

        if (pageData && typeof pageData.is_pro === 'boolean') {
          if (pageData.is_pro) {
            // Seed pro-store cache
            queryClient.setQueryData(['pro-store', slug], {
              shop: pageData.shop,
              categories: pageData.categories || [],
              featured_products: pageData.featured_products || [],
              total_products: pageData.total_products || 0,
              hero: pageData.hero || {},
            })

            // Seed pro-about-blocks cache
            queryClient.setQueryData(['pro-about-blocks', slug], pageData.about_blocks || [])

            return pageData
          } else {
            // For non-Pro shops, page-data only returns { is_pro: false }.
            // Fetch the old tier endpoint to return full catalogue data expected by StorePage.
            const tierRes = await publicApi.get(`store/${slug}/?page=1&page_size=1`)
            return { ...tierRes.data, is_pro: false }
          }
        }
      } catch (pageDataErr) {
        // Log non-fatal fallback warning (does not cache any error)
        console.warn(`[StorefrontData] page-data failed for "${slug}", falling back to legacy store endpoints. API Base: ${apiBase}`, pageDataErr)
      }

      // ── Step 2: Fallback flow — old store tier call ────────────────────────
      let tierRes
      try {
        tierRes = await publicApi.get(`store/${slug}/?page=1&page_size=1`, { timeout: 10000 })
      } catch (err) {
        const classified = classifyError(err)
        console.warn(`[StorefrontData] ${classified.type} loading store "${slug}". API Base: ${apiBase}`, err)
        throw new StorefrontError(classified.type, classified.message, classified.status, err)
      }

      const tierData = tierRes.data

      // Non-Pro shop or inactive shop: ensure is_pro is explicitly boolean
      if (!tierData.is_pro) {
        return { ...tierData, is_pro: false }
      }

      // Pro shop: fetch pro store home and about blocks in parallel
      const [proStoreRes, aboutRes] = await Promise.allSettled([
        publicApi.get(`pro/${slug}/`),
        publicApi.get(`pro/${slug}/about/`),
      ])

      const proStoreData = proStoreRes.status === 'fulfilled' ? proStoreRes.value.data : null
      const aboutBlocks = aboutRes.status === 'fulfilled' ? aboutRes.value.data : []

      if (proStoreData) {
        queryClient.setQueryData(['pro-store', slug], proStoreData)
      }
      queryClient.setQueryData(['pro-about-blocks', slug], aboutBlocks)

      return {
        is_pro: true,
        shop: proStoreData?.shop || tierData,
        hero: proStoreData?.hero || {},
        categories: proStoreData?.categories || tierData.categories || [],
        featured_products: proStoreData?.featured_products || tierData.products || [],
        total_products: proStoreData?.total_products || tierData.pagination?.total || 0,
        about_blocks: aboutBlocks,
        ...tierData,
      }
    },
    enabled: !!slug,
    staleTime: 30_000,
    // Do not retry on 404 (Store not found)
    retry: (failureCount, error) => {
      if (error?.type === 'NOT_FOUND' || error?.status === 404 || error?.response?.status === 404) {
        return false
      }
      return failureCount < 1
    },
  })
}
