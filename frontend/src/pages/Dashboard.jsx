import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import SkeletonCard from '../components/SkeletonCard'
import { DashboardProductCard } from '../components/ProductCard'

export default function Dashboard() {
  const qc = useQueryClient()

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('shop/products/').then((r) => r.data),
  })

  const handleDeleted = (id) => {
    qc.setQueryData(['products'], (prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggled = (updated) => {
    qc.setQueryData(['products'], (prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    )
  }

  const count = products?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">My Products</h2>
            {!isLoading && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                {count === 0 ? 'No products yet' : `${count} product${count === 1 ? '' : 's'}`}
              </p>
            )}
          </div>
          <Link
            to="/dashboard/add-product"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </Link>
        </div>

        {/* Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Failed to load products</p>
            <button
              onClick={() => qc.invalidateQueries(['products'])}
              className="text-indigo-600 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && count === 0 && (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-1">No products yet</h3>
            <p className="text-[13px] text-gray-400 mb-6 max-w-[220px]">Add your first product to start sharing your store</p>
            <Link
              to="/dashboard/add-product"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-5 py-3 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add your first product
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && count > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <DashboardProductCard
                key={p.id}
                product={p}
                onDeleted={handleDeleted}
                onToggled={handleToggled}
              />
            ))}
          </div>
        )}

        {/* Bottom padding for phones with home indicator */}
        <div className="h-6" />
      </main>
    </div>
  )
}
