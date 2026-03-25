import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import Toast from '../components/Toast'
import SkeletonCard from '../components/SkeletonCard'
import DashboardProductCard from '../components/DashboardProductCard'

function StatCard({ label, value, highlight }) {
  return (
    <div className="bg-white rounded-2xl p-3 flex-1 min-w-[80px]">
      <p className={`text-xl font-bold ${highlight || 'text-[#0A0A0A]'}`}>{value ?? '—'}</p>
      <p className="text-xs text-[#737373] mt-0.5">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const shopName = localStorage.getItem('shop_name') || 'Your Shop'

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('shop/products/').then((r) => r.data),
  })

  const inStock = products?.filter((p) => p.is_in_stock).length ?? 0
  const outOfStock = products?.filter((p) => !p.is_in_stock).length ?? 0

  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <Toast />

      <div className="max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="bg-white px-4 pt-10 pb-4 border-b border-[#F0F0F0]">
          <h1 className="text-xl font-bold text-[#0A0A0A] truncate">{shopName}</h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Managing {products?.length ?? '…'} product{products?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 px-4 mt-4">
          <StatCard label="Products"    value={products?.length} />
          <StatCard label="In Stock"    value={inStock}     highlight="text-[#166534]" />
          <StatCard label="Out of Stock" value={outOfStock} highlight="text-[#991B1B]" />
        </div>

        {/* Section heading */}
        <div className="flex items-center gap-2 px-4 mt-5 mb-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Your Products</h2>
          {products && (
            <span className="text-xs bg-[#F0F0F0] text-[#737373] px-2 py-0.5 rounded-full font-medium">
              {products.length}
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8 text-center">
              <p className="text-sm font-semibold text-[#737373]">Failed to load products</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Check your connection and try again</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-10 text-center">
              <svg className="w-12 h-12 text-[#D4D4D4] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm font-semibold text-[#0A0A0A] mt-3">No products yet</p>
              <p className="text-xs text-[#737373] mt-1">Tap the + button below to add your first product</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <DashboardProductCard
                  key={p.id}
                  product={p}
                  onEdit={(id) => navigate(`/dashboard/edit-product/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
