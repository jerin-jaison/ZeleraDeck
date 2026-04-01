import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, PackageSearch, Filter } from 'lucide-react'
import api from '../api/axios'
import ImageWithFallback from '../components/ImageWithFallback'
import SkeletonCard from '../components/SkeletonCard'
import Pagination from '../components/Pagination'

const WA_SVG = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
)

function PublicProductCard({ product, shop }) {
  const navigate = useNavigate()
  const slug = shop.slug

  const orderOnWhatsApp = (e) => {
    e.stopPropagation()
    const message =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ Product: ${product.name}\n` +
      `🆔 ID: ${product.display_id}\n` +
      `💰 Price: ₹${product.price}\n` +
      `🔗 Link: https://zeleradeck.onrender.com/og/store/${slug}/product/${product.display_id}\n\n` +
      `Please confirm availability. Thank you!`
    window.open(`https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div
      className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden shadow-sm cursor-pointer"
      onClick={() => navigate(`/store/${slug}/product/${product.display_id}`)}
    >
      <div className="relative aspect-square bg-[#F8F8F8]">
        <ImageWithFallback src={product.image_url} alt={product.name} className="w-full h-full" />
        <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
          {product.display_id}
        </span>
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[10px] text-white font-medium px-2 py-1 bg-black/60 rounded-md">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 text-[#0A0A0A]">{product.name}</p>
        <p className="text-sm font-bold mt-1">₹{Number(product.price).toLocaleString('en-IN')}</p>
        {product.is_in_stock && (
          <button
            onClick={orderOnWhatsApp}
            className="w-full mt-2 bg-[#25D366] text-white text-xs font-medium rounded-xl py-2.5 flex items-center justify-center gap-1.5"
          >
            {WA_SVG} Order on WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}

export default function StorePage() {
  const { slug } = useParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['public-store', slug, currentPage],
    queryFn: () => api.get(`store/${slug}/?page=${currentPage}&page_size=12`).then((r) => r.data),
    placeholderData: (prev) => prev,
  })

  const shopCategories = data?.categories || []

  // Client-side search + stock + category filter on loaded products
  const filteredProducts = useMemo(() => {
    const products = data?.products || []
    let filtered = products

    // Stock filter
    if (stockFilter === 'in_stock') filtered = filtered.filter((p) => p.is_in_stock)
    else if (stockFilter === 'out_of_stock') filtered = filtered.filter((p) => !p.is_in_stock)

    // Category filter (client-side)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category_name === categoryFilter)
    }

    // Search filter (client-side, instant)
    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.display_id.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [data?.products, searchInput, stockFilter, categoryFilter])

  const isSearching = searchInput.trim().length > 0
  const isFiltering = stockFilter !== 'all' || categoryFilter !== 'all'
  const pagination = data?.pagination
  const pillCls = (active) =>
    `text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
      active ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#737373]'
    }`

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSearchInput('')
    setStockFilter('all')
    setCategoryFilter('all')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#F0F0F0] px-4 py-3 flex items-center">
          <div className="h-4 w-32 skeleton rounded" />
        </div>
        <div className="px-4 pt-4 pb-8 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
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

  if (!data?.is_active) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto">
        <svg className="w-16 h-16 text-[#D4D4D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>
        <h2 className="text-xl font-bold mt-6">Temporarily Unavailable</h2>
        <p className="text-sm text-[#737373] mt-2">This store is currently paused.</p>
        <p className="text-sm text-[#737373]">Please contact the shop directly.</p>
        {data?.whatsapp_number && (
          <a href={`https://wa.me/${data.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
            className="mt-8 bg-[#25D366] text-white rounded-xl px-6 py-3.5 flex items-center gap-2 font-medium text-sm">
            {WA_SVG} Chat on WhatsApp
          </a>
        )}
      </div>
    )
  }

  const shop = data

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#F0F0F0] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {shop.logo_url && (
            <img src={shop.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover mr-2 flex-shrink-0" />
          )}
          <h1 className="text-base font-bold text-[#0A0A0A]">{shop.name}</h1>
        </div>
        <span className="text-xs text-[#737373]">{pagination?.total ?? 0} products</span>
      </div>

      {/* Search + Filter — sticky below header */}
      <div className="sticky top-[53px] z-10 bg-white border-b border-[#F0F0F0] px-4 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-9 py-3 border border-[#E5E5E5] rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-[#A3A3A3]" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${
              showFilters || isFiltering
                ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                : 'bg-white border-[#E5E5E5] text-[#0A0A0A]'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-2xl animate-in slide-in-from-top-2 fade-in duration-200">
            <p className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mb-2">Availability</p>
            <div className="flex gap-2">
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

            {/* Category filter pills — show if any categories exist */}
            {shopCategories.length >= 1 && (
              <div className="mt-4">
                <p className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mb-2">Categories</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={pillCls(categoryFilter === 'all')}
                  >
                    All Products
                  </button>
                  {shopCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.name)}
                      className={pillCls(categoryFilter === cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results header */}
      {(isSearching || isFiltering) && (
        <div className="px-4 py-2">
          <p className="text-xs text-[#737373]">
            {isSearching && categoryFilter !== 'all'
              ? `Showing ${filteredProducts.length} results for '${searchInput.trim()}' in ${categoryFilter}`
              : isSearching
              ? `Showing ${filteredProducts.length} results for '${searchInput.trim()}'`
              : categoryFilter !== 'all'
              ? `Showing: ${categoryFilter} · ${filteredProducts.length} items`
              : `${filteredProducts.length} ${stockFilter === 'in_stock' ? 'in stock' : 'out of stock'}`}
          </p>
          {isSearching && (
            <p className="text-xs text-[#A3A3A3] mt-0.5">Search results from current page. Clear search to browse all.</p>
          )}
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        isSearching ? (
          <div className="px-4 pt-8 pb-8 text-center">
            <PackageSearch className="w-12 h-12 text-[#D4D4D4] mx-auto" />
            <p className="text-sm text-[#737373] text-center mt-3">No products match '{searchInput.trim()}'</p>
            <button onClick={() => setSearchInput('')} className="text-sm underline text-[#0A0A0A] mt-2">Clear search</button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-[#737373]">No products available yet</p>
          </div>
        )
      ) : (
        <div className={`px-4 pt-4 pb-8 grid grid-cols-2 gap-3 ${isFetching ? 'opacity-60' : ''}`}>
          {filteredProducts.map((p) => (
            <PublicProductCard key={p.display_id} product={p} shop={shop} />
          ))}
        </div>
      )}

      {/* Pagination — hidden when searching/filtering client-side */}
      {!isSearching && !isFiltering && pagination && (
        <div className="px-4 pb-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            pageSize={pagination.page_size}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  )
}
