import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import SkeletonCard from '../components/SkeletonCard'
import PublicProductCard from '../components/PublicProductCard'
import StoreDisabled from './StoreDisabled'
import NotFound from './NotFound'

const API = 'https://zeleradeck.onrender.com/api/'

export default function StorePage() {
  const { slug } = useParams()

  const { data: store, isLoading, isError, error } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => axios.get(`${API}store/${slug}/`).then((r) => r.data),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto">
        {/* Header skeleton */}
        <div className="sticky top-0 bg-white border-b border-[#F0F0F0] px-4 py-3">
          <div className="h-4 skeleton rounded-full w-1/2 mb-1" />
          <div className="h-3 skeleton rounded-full w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    const status = error?.response?.status
    if (status === 403) return <StoreDisabled shop={{ whatsapp_number: error?.response?.data?.whatsapp_number }} />
    return <NotFound />
  }

  const { shop, products } = store

  if (!shop.is_active) return <StoreDisabled shop={shop} />

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Sticky header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-[#F0F0F0] px-4 py-3 z-10">
        <p className="text-base font-bold text-[#0A0A0A]">{shop.name}</p>
        <p className="text-xs text-[#737373]">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <svg className="w-12 h-12 text-[#D4D4D4] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm font-semibold text-[#0A0A0A]">No products yet</p>
          <p className="text-xs text-[#737373] mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-8">
          {products.map((p) => (
            <PublicProductCard key={p.id} product={p} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}
