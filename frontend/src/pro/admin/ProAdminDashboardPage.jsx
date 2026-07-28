/**
 * ProAdminDashboardPage
 *
 * AUDIT RESULT — what's real vs. fabricated in a WhatsApp-enquiry storefront:
 *
 * REMOVED (no real data source):
 *   ❌ Net Revenue          — no payment/order system
 *   ❌ Total Orders         — no order tracking
 *   ❌ Active Carts         — no cart system
 *   ❌ Conversion Rate      — no session/enquiry tracking
 *   ❌ Sales Overview chart — hardcoded bar heights, toggle changed nothing
 *   ❌ Recent Activity feed — fake timestamps and events
 *
 * KEPT / REAL:
 *   ✅ Total Products   — fetched from API (paginator.count)
 *   ✅ In Stock count   — derivable from products results
 *   ✅ Categories count — included in products API response
 *   ✅ Top Products     — real images/names (fake "124 SALES" badge removed)
 *   ✅ Quick Actions    — all 4 already link to correct admin pages
 */
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function ProAdminDashboardPage() {
  const { slug } = useParams()

  // Single API call — products list gives us total count, in-stock, and categories
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['pro-admin-products', slug],
    queryFn: () => api.get('pro/admin/products/').then(r => r.data),
  })

  const products = productsData?.results || []
  const totalProducts = productsData?.count || 0
  const inStockCount = products.filter(p => p.is_in_stock).length
  const categories = productsData?.categories || []
  const categoryCount = categories.length

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 lg:py-12 space-y-8 lg:space-y-12">

      {/* ── Real Stat Cards ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">

        {/* Total Products */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-4">
            Total Products
          </p>
          <h2 className="font-serif text-[40px] text-black leading-none">
            {isLoading ? '—' : totalProducts}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
            <span>Listed in your store</span>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-4">
            In Stock
          </p>
          <h2 className="font-serif text-[40px] text-black leading-none">
            {isLoading ? '—' : inStockCount}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>Available to customers</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-4">
            Categories
          </p>
          <h2 className="font-serif text-[40px] text-black leading-none">
            {isLoading ? '—' : categoryCount}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">category</span>
            <span>Product collections</span>
          </div>
        </div>
      </section>

      {/* ── Main Row: Quick Actions + Top Products ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* Quick Actions */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="font-serif text-xl uppercase tracking-tight text-black mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link
              to={`/pro-admin/${slug}/products/add`}
              className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors group text-center"
            >
              <span className="material-symbols-outlined text-black group-hover:scale-105 transition-transform">add_circle</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-black font-semibold">New Drop</span>
            </Link>
            <Link
              to={`/pro-admin/${slug}/homepage`}
              className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors group text-center"
            >
              <span className="material-symbols-outlined text-black group-hover:scale-105 transition-transform">home</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-black font-semibold">Homepage</span>
            </Link>
            <Link
              to={`/pro-admin/${slug}/about`}
              className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors group text-center"
            >
              <span className="material-symbols-outlined text-black group-hover:scale-105 transition-transform">edit_note</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-black font-semibold">Edit About</span>
            </Link>
            <Link
              to={`/pro-admin/${slug}/contact`}
              className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors group text-center"
            >
              <span className="material-symbols-outlined text-black group-hover:scale-105 transition-transform">contact_page</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-black font-semibold">Contact</span>
            </Link>
            <Link
              to={`/pro-admin/${slug}/products`}
              className="col-span-2 mt-4 bg-black text-white py-4 text-center text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-colors"
            >
              View Full Inventory
            </Link>
          </div>
        </div>

        {/* Top Products — real data, no fake sales numbers */}
        <div className="bg-white border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl uppercase tracking-tight text-black">Recent Products</h3>
            <Link
              to={`/pro-admin/${slug}/products`}
              className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] hover:text-black transition-colors flex items-center gap-1 font-semibold"
            >
              All products
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-[#7e7576] uppercase tracking-[0.1em] text-xs">
              <span className="material-symbols-outlined text-[40px] text-[#cfc4c5] block mb-2">inventory_2</span>
              No products listed yet.
              <Link to={`/pro-admin/${slug}/products/add`} className="block mt-3 text-black underline text-[11px]">
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {products.slice(0, 4).map((p, idx) => (
                <Link
                  key={p.id || idx}
                  to={`/pro-admin/${slug}/products/edit/${p.id}`}
                  className="group space-y-2 block"
                >
                  <div className="aspect-[3/4] bg-[#f3f3f3] relative overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#cfc4c5] text-[32px]">image</span>
                      </div>
                    )}
                    {!p.is_in_stock && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold">
                        Out of stock
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-black truncate">{p.name}</p>
                  <p className="text-[11px] text-[#7e7576]">₹{Number(p.price).toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
