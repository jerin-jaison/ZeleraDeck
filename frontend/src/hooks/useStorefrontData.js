import { useQuery, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '../api/axios'

/**
 * useStorefrontData
 *
 * Single unified storefront data hook:
 * 1. Calls /api/pro/<slug>/page-data/ first.
 * 2. If page-data fails for ANY reason (404, 5xx, timeout, network error),
 *    falls back to the old flow:
 *      - Store tier call: /api/store/<slug>/?page=1&page_size=1
 *      - If Pro, calls /api/pro/<slug>/ and /api/pro/<slug>/about/
 * 3. For non-Pro shops, returns the data from the store tier call.
 * 4. Seeds the existing query caches for 'pro-store' and 'pro-about-blocks'
 *    so ProLayout and ProHomePage fire ZERO extra network requests.
 */
export function useStorefrontData(slug) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['storefront-data', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Store slug is required')

      // ── Step 1: Try combined page-data endpoint ──────────────────────────
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
      } catch {
        // Any error (404, 500, network, timeout) falls through to Step 2 fallback flow
      }

      // ── Step 2: Fallback flow — old store tier call ────────────────────────
      const tierRes = await publicApi.get(`store/${slug}/?page=1&page_size=1`)
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
    // Do not retry on 404
    retry: (failureCount, error) => {
      if (error?.response?.status === 404 || error?.status === 404) return false
      return failureCount < 2
    },
  })
}
