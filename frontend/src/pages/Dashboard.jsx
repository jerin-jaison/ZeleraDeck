import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import DashboardProductListItem from '../components/DashboardProductListItem'
import SkeletonListItem from '../components/SkeletonListItem'

export default function Dashboard() {
  const qc = useQueryClient()
  const shopName = localStorage.getItem('shop_name') || 'My Shop'

  const { data: products, isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: () => api.get('shop/products/').then((r) => r.data),
  })

  const total = products?.length ?? 0
  const inStock = products?.filter((p) => p.is_in_stock).length ?? 0
  const outOfStock = total - inStock

  const handleUpdate = () => qc.invalidateQueries(['shop-products'])
  const handleDelete = (id) => {
    qc.setQueryData(['shop-products'], (old) => old?.filter((p) => p.id !== id))
  }

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning 👋' : hour < 17 ? 'Good afternoon 👋' : 'Good evening 👋'

  return (
    <div className="bg-[#F8F8F8] min-h-screen pb-24 max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-[#F0F0F0]">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{shopName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-[#0A0A0A]">{shopName}</h1>
            <p className="text-xs text-[#737373]">{greeting}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: total },
          { label: 'In Stock', value: inStock, color: 'text-[#166534]' },
          { label: 'Out of Stock', value: outOfStock, color: 'text-[#991B1B]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 border border-[#F0F0F0]">
            <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
            <p className="text-[10px] text-[#737373] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products heading */}
      <div className="px-4 mt-5 mb-3 flex justify-between items-center">
        <p className="text-sm font-semibold text-[#0A0A0A]">Products</p>
        <p className="text-xs text-[#737373]">{total} items</p>
      </div>

      {/* Product list */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#F0F0F0]">
            <Package className="w-12 h-12 text-[#D4D4D4] mx-auto" />
            <p className="text-sm font-semibold text-[#0A0A0A] mt-3">No products yet</p>
            <p className="text-xs text-[#737373] text-center mt-1.5 max-w-[200px] mx-auto">
              Tap the + button below to add your first product
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((p) => (
              <DashboardProductListItem
                key={p.id}
                product={p}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
