import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Search, X, SearchX } from 'lucide-react'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import DashboardProductListItem from '../components/DashboardProductListItem'
import SkeletonListItem from '../components/SkeletonListItem'
import Pagination from '../components/Pagination'

export default function Dashboard() {
  const qc = useQueryClient()
  const shopName = localStorage.getItem('shop_name') || 'My Shop'
  const productListRef = useRef()

  // Search + filter + pagination state
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset page when filter changes
  useEffect(() => { setCurrentPage(1) }, [stockFilter])

  // Build query params
  const buildParams = () => {
    const p = new URLSearchParams()
    if (searchQuery) p.set('search', searchQuery)
    if (stockFilter === 'in_stock') p.set('in_stock', 'true')
    if (stockFilter === 'out_of_stock') p.set('in_stock', 'false')
    p.set('page', String(currentPage))
    p.set('page_size', '12')
    return p.toString()
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['shop-products', searchQuery, stockFilter, currentPage],
    queryFn: () => api.get(`shop/products/?${buildParams()}`).then((r) => r.data),
    placeholderData: (prev) => prev,
  })

  const products = data?.products ?? []
  const pagination = data?.pagination ?? { total: 0, page: 1, page_size: 12, total_pages: 1 }

  // Stats — from pagination total (all items) for display, we fetch separately for stats
  const { data: statsData } = useQuery({
    queryKey: ['shop-products-stats'],
    queryFn: () => api.get('shop/products/?page_size=1').then((r) => r.data),
  })
  const { data: inStockData } = useQuery({
    queryKey: ['shop-products-stats-in'],
    queryFn: () => api.get('shop/products/?in_stock=true&page_size=1').then((r) => r.data),
  })
  const { data: outStockData } = useQuery({
    queryKey: ['shop-products-stats-out'],
    queryFn: () => api.get('shop/products/?in_stock=false&page_size=1').then((r) => r.data),
  })
  const totalAll = statsData?.pagination?.total ?? 0
  const totalInStock = inStockData?.pagination?.total ?? 0
  const totalOutStock = outStockData?.pagination?.total ?? 0

  const handleUpdate = () => {
    qc.invalidateQueries({ queryKey: ['shop-products'] })
    qc.invalidateQueries({ queryKey: ['shop-products-stats'] })
    qc.invalidateQueries({ queryKey: ['shop-products-stats-in'] })
    qc.invalidateQueries({ queryKey: ['shop-products-stats-out'] })
  }
  const handleDelete = (id) => {
    qc.setQueryData(['shop-products', searchQuery, stockFilter, currentPage], (old) => {
      if (!old) return old
      return { ...old, products: old.products?.filter((p) => p.id !== id) }
    })
    qc.invalidateQueries({ queryKey: ['shop-products-stats'] })
    qc.invalidateQueries({ queryKey: ['shop-products-stats-in'] })
    qc.invalidateQueries({ queryKey: ['shop-products-stats-out'] })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    productListRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning 👋' : hour < 17 ? 'Good afternoon 👋' : 'Good evening 👋'

  const pillCls = (active) =>
    `text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
      active ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#737373]'
    }`

  // Results header text
  const resultsText = () => {
    if (searchQuery) return `Results for "${searchQuery}" — ${pagination.total} found`
    if (stockFilter === 'in_stock') return `${pagination.total} in stock`
    if (stockFilter === 'out_of_stock') return `${pagination.total} out of stock`
    return `Products · ${pagination.total} items`
  }

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
          { label: 'Total', value: totalAll },
          { label: 'In Stock', value: totalInStock, color: 'text-[#166534]' },
          { label: 'Out of Stock', value: totalOutStock, color: 'text-[#991B1B]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 border border-[#F0F0F0]">
            <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
            <p className="text-[10px] text-[#737373] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-9 py-3 border border-[#E5E5E5] rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearchQuery('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-[#A3A3A3]" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'in_stock', label: 'In Stock' },
            { key: 'out_of_stock', label: 'Out of Stock' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStockFilter(key)} className={pillCls(stockFilter === key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="px-4 mt-4 mb-2" ref={productListRef}>
        <p className="text-xs text-[#737373]">{resultsText()}</p>
      </div>

      {/* Product list */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}
          </div>
        ) : products.length === 0 ? (
          searchQuery ? (
            /* Search empty state */
            <div className="bg-white rounded-2xl p-8 text-center border border-[#F0F0F0]">
              <SearchX className="w-10 h-10 text-[#D4D4D4] mx-auto" />
              <p className="text-sm font-semibold mt-3">No products found</p>
              <p className="text-xs text-[#737373] mt-1">Try a different search term</p>
              <button
                onClick={() => { setSearchInput(''); setSearchQuery('') }}
                className="mt-4 border border-[#E5E5E5] rounded-xl px-4 py-2 text-xs font-medium text-[#0A0A0A]"
              >
                Clear Search
              </button>
            </div>
          ) : stockFilter !== 'all' ? (
            /* Filter empty state */
            <div className="bg-white rounded-2xl p-8 text-center border border-[#F0F0F0]">
              <Package className="w-10 h-10 text-[#D4D4D4] mx-auto" />
              <p className="text-sm font-semibold mt-3">
                No {stockFilter === 'in_stock' ? 'in stock' : 'out of stock'} products
              </p>
              <button
                onClick={() => setStockFilter('all')}
                className="mt-4 border border-[#E5E5E5] rounded-xl px-4 py-2 text-xs font-medium text-[#0A0A0A]"
              >
                Show all products
              </button>
            </div>
          ) : (
            /* No products at all */
            <div className="bg-white rounded-2xl p-8 text-center border border-[#F0F0F0]">
              <Package className="w-12 h-12 text-[#D4D4D4] mx-auto" />
              <p className="text-sm font-semibold text-[#0A0A0A] mt-3">No products yet</p>
              <p className="text-xs text-[#737373] text-center mt-1.5 max-w-[200px] mx-auto">
                Tap the + button below to add your first product
              </p>
            </div>
          )
        ) : (
          <>
            <div className={`flex flex-col gap-3 ${isFetching ? 'opacity-60' : ''}`}>
              {products.map((p) => (
                <DashboardProductListItem
                  key={p.id}
                  product={p}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total}
              pageSize={pagination.page_size}
              onPageChange={handlePageChange}
              isLoading={isFetching}
            />
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
