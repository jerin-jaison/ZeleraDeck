import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import SkeletonCard from '../components/SkeletonCard'
import { PublicProductCard } from '../components/ProductCard'

export default function StorePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['store', slug],
    queryFn: () =>
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'}store/${slug}/`).then((r) => r.data),

    retry: false,
  })

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fake header skeleton */}
        <div className="bg-white border-b border-gray-100 h-14 px-4 flex items-center">
          <div className="h-5 w-36 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-5">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  /* ── Error / 404 ── */
  if (isError) {
    if (error?.response?.status === 404) {
      navigate('/404', { replace: true })
      return null
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Something went wrong. Try again.</p>
      </div>
    )
  }

  /* ── Disabled shop ── */
  if (!data.is_active) {
    navigate('/store-disabled', { replace: true, state: data })
    return null
  }

  const inStock = data.products.filter((p) => p.is_in_stock)
  const oos = data.products.filter((p) => !p.is_in_stock)
  const sorted = [...inStock, ...oos]

  /* ── Active store ── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public store header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-gray-900 truncate">{data.name}</h1>
            <p className="text-[11px] text-gray-400">
              {data.products.length} product{data.products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Empty state */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-gray-500">No products yet</p>
            <p className="text-[12px] text-gray-400 mt-1">Check back soon</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {sorted.map((p) => (
                <PublicProductCard key={p.display_id} product={p} shop={data} />
              ))}
            </div>
            {/* Footer powered-by */}
            <p className="text-center text-[11px] text-gray-300 mt-8 mb-2">
              Powered by ZeleraDeck
            </p>
          </>
        )}
        <div className="h-6" />
      </main>
    </div>
  )
}
