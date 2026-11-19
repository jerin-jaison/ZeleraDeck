import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../api/supabase'

const LOGS_PER_PAGE = 15

export default function ProAdminAnalyticsPage() {
  const { slug } = useParams()
  const [timeFilter, setTimeFilter] = useState('month') // 'today' | 'week' | 'month' | 'custom-month' | 'custom-day'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [visibleLogCount, setVisibleLogCount] = useState(LOGS_PER_PAGE)

  // Determine start / end ISO strings based on selected filters
  let startDate = null
  let endDate = null

  const now = new Date()

  if (timeFilter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  } else if (timeFilter === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  } else if (timeFilter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  } else if (timeFilter === 'custom-month' && selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number)
    startDate = new Date(year, month - 1, 1).toISOString()
    endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
  } else if (timeFilter === 'custom-day' && selectedDate) {
    const d = new Date(selectedDate)
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()
  }

  // Fetch all views matching filter for this shop
  const { data: views = [], isLoading } = useQuery({
    queryKey: ['pro-admin-analytics-views', slug, timeFilter, selectedMonth, selectedDate],
    queryFn: async () => {
      if (!slug) return []
      let query = supabase
        .from('storefront_views')
        .select('*')
        .eq('shop_id', slug)
        .order('viewed_at', { ascending: false })

      if (startDate) query = query.gte('viewed_at', startDate)
      if (endDate) query = query.lte('viewed_at', endDate)

      const { data, error } = await query
      if (error) return []
      return data || []
    },
    enabled: !!slug,
    staleTime: 30_000,
  })

  // Derive summary metrics
  const totalViews = views.length
  const storefrontViews = views.filter((v) => !v.page_type || v.page_type === 'storefront').length
  const productViews = views.filter((v) => v.page_type === 'product').length

  // De-duplicate visitor count (by visitor_ip_hash or session grouping)
  const uniqueVisitorHashes = new Set(views.map((v) => v.visitor_ip_hash || v.id.slice(0, 8)))
  const uniqueVisitorsCount = uniqueVisitorHashes.size

  // Group by Product ID / Name to find Most Viewed Products
  const productCountsMap = {}
  views.forEach((v) => {
    if (v.page_type === 'product' || v.product_display_id) {
      const key = v.product_display_id || v.product_name || 'Unknown Product'
      if (!productCountsMap[key]) {
        productCountsMap[key] = {
          displayId: v.product_display_id || key,
          name: v.product_name || `Product (${v.product_display_id})`,
          count: 0,
        }
      }
      productCountsMap[key].count += 1
    }
  })

  const topProducts = Object.values(productCountsMap).sort((a, b) => b.count - a.count)
  const topProduct = topProducts[0] || null

  // Group views by Date for Daily Breakdown
  const dailyBreakdownMap = {}
  views.forEach((v) => {
    const dateStr = new Date(v.viewed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    dailyBreakdownMap[dateStr] = (dailyBreakdownMap[dateStr] || 0) + 1
  })

  const dailyBreakdown = Object.entries(dailyBreakdownMap).map(([date, count]) => ({
    date,
    count,
  }))

  const maxDailyViews = Math.max(...dailyBreakdown.map((d) => d.count), 1)

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 lg:py-12 space-y-8 lg:space-y-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e2e2] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#7e7576] font-semibold mb-2">
            <Link to={`/pro-admin/${slug}/dashboard`} className="hover:text-black transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-black">Analytics</span>
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl uppercase tracking-tight text-black font-normal">
            Storefront Analytics
          </h1>
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#7e7576] mt-2 font-medium">
            Real-time customer traffic, daily breakdowns, and product engagement
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: '7 Days' },
            { id: 'month', label: 'This Month' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setTimeFilter(f.id)
                setVisibleLogCount(LOGS_PER_PAGE)
              }}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold border transition-all whitespace-nowrap ${
                timeFilter === f.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#7e7576] border-[#e2e2e2] hover:text-black hover:border-black'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#e2e2e2] px-2.5 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#7e7576] whitespace-nowrap font-semibold">
              Month:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setTimeFilter('custom-month')
                setVisibleLogCount(LOGS_PER_PAGE)
              }}
              className="text-[11px] font-sans font-semibold text-black bg-transparent border-none outline-none cursor-pointer"
            />
          </div>

          {/* Specific Day Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-[#e2e2e2] px-2.5 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#7e7576] whitespace-nowrap font-semibold">
              Day:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setTimeFilter('custom-day')
                setVisibleLogCount(LOGS_PER_PAGE)
              }}
              className="text-[11px] font-sans font-semibold text-black bg-transparent border-none outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── Summary Stat Cards (Equal height, 2x2 on mobile/tablet, 4x1 on desktop) ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Views */}
        <div className="bg-white p-5 lg:p-7 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
          <div>
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-3 sm:mb-4">
              Total Views
            </p>
            <div className="h-10 flex items-center">
              <h2 className="font-serif text-3xl sm:text-[40px] text-black leading-none">
                {isLoading ? '—' : totalViews}
              </h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px] shrink-0">visibility</span>
            <span className="truncate">Total page loads</span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white p-5 lg:p-7 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
          <div>
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-3 sm:mb-4">
              Unique Visitors
            </p>
            <div className="h-10 flex items-center">
              <h2 className="font-serif text-3xl sm:text-[40px] text-black leading-none">
                {isLoading ? '—' : uniqueVisitorsCount}
              </h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px] shrink-0">group</span>
            <span className="truncate">Distinct sessions</span>
          </div>
        </div>

        {/* Product Page Views */}
        <div className="bg-white p-5 lg:p-7 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
          <div>
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-3 sm:mb-4">
              Product Page Views
            </p>
            <div className="h-10 flex items-center">
              <h2 className="font-serif text-3xl sm:text-[40px] text-black leading-none">
                {isLoading ? '—' : productViews}
              </h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px] shrink-0">inventory_2</span>
            <span className="truncate">{storefrontViews} catalogue views</span>
          </div>
        </div>

        {/* Top Product */}
        <div className="bg-white p-5 lg:p-7 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
          <div>
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold mb-3 sm:mb-4">
              Top Product
            </p>
            <div className="h-10 flex items-center min-w-0">
              <h2
                className="font-serif text-lg sm:text-xl text-black leading-tight truncate w-full"
                title={topProduct ? topProduct.name : ''}
              >
                {isLoading ? '—' : topProduct ? topProduct.name : 'No views yet'}
              </h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#7e7576] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px] shrink-0">trending_up</span>
            <span className="truncate">
              {topProduct ? `${topProduct.count} views` : 'Waiting for traffic'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Breakdown Grid (items-start prevents cards from stretching each other) ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
        {/* Left: Daily Traffic Breakdown */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f3f3f3] shrink-0">
            <h3 className="font-serif text-xl uppercase tracking-tight text-black">
              Daily Views Breakdown
            </h3>
            <span className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold">
              {dailyBreakdown.length} active days
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dailyBreakdown.length === 0 ? (
            <div className="text-center py-12 text-[#7e7576] uppercase tracking-[0.1em] text-xs">
              <span className="material-symbols-outlined text-[36px] text-[#cfc4c5] block mb-2">
                bar_chart
              </span>
              No views recorded for this time filter.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[640px] pr-1.5 analytics-scrollbar">
              {dailyBreakdown.map((item) => {
                const rawPercent = (item.count / maxDailyViews) * 100
                const widthPercent = item.count > 0 ? Math.max(Math.round(rawPercent), 3) : 0
                return (
                  <div key={item.date} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold gap-3 whitespace-nowrap">
                      <span className="text-black shrink-0">{item.date}</span>
                      <span className="text-[#7e7576] shrink-0 font-mono">{item.count} views</span>
                    </div>
                    <div className="w-full bg-[#f3f3f3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Most Viewed Products */}
        <div className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f3f3f3] shrink-0">
            <h3 className="font-serif text-xl uppercase tracking-tight text-black">
              Most Viewed Products
            </h3>
            <span className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold">
              {topProducts.length} products
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-12 text-[#7e7576] uppercase tracking-[0.1em] text-xs">
              <span className="material-symbols-outlined text-[36px] text-[#cfc4c5] block mb-2">
                local_mall
              </span>
              No product page views recorded yet.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[640px] pr-1.5 analytics-scrollbar">
              {topProducts.map((prod, idx) => (
                <div
                  key={prod.displayId + idx}
                  className="flex items-center justify-between p-3 border border-[#e2e2e2] bg-[#fafafa] gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[12px] uppercase tracking-[0.1em] font-semibold text-black truncate leading-tight"
                        title={prod.name}
                      >
                        {prod.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#7e7576] truncate mt-0.5">
                        ID: {prod.displayId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 min-w-[50px]">
                    <p className="text-sm font-bold font-serif text-black leading-none">{prod.count}</p>
                    <p className="text-[9px] uppercase tracking-wider text-[#7e7576] mt-0.5">views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Visitor Activity Logs Table (horizontal scroll on mobile + pagination) ─── */}
      <section className="bg-white p-5 lg:p-8 border border-[#e2e2e2] shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-serif text-xl uppercase tracking-tight text-black">
              Recent Visitor Log
            </h3>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] font-medium mt-1">
              Individual view events and active customer sessions
            </p>
          </div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold whitespace-nowrap">
            Showing {Math.min(visibleLogCount, views.length)} of {views.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : views.length === 0 ? (
          <div className="text-center py-12 text-[#7e7576] uppercase tracking-[0.1em] text-xs">
            <span className="material-symbols-outlined text-[36px] text-[#cfc4c5] block mb-2">
              receipt_long
            </span>
            No visitor events found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 px-5 lg:-mx-8 lg:px-8">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#e2e2e2] text-[10px] uppercase tracking-[0.15em] text-[#7e7576] font-semibold">
                    <th className="py-3 px-3 w-[160px] min-w-[160px]">Timestamp</th>
                    <th className="py-3 px-3 min-w-[240px]">Page Viewed</th>
                    <th className="py-3 px-3 w-[130px] min-w-[130px]">Product ID</th>
                    <th className="py-3 px-3 w-[150px] min-w-[150px]">Visitor Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3f3] text-[11px] font-sans">
                  {views.slice(0, visibleLogCount).map((v) => {
                    const isProduct = v.page_type === 'product'
                    const timestampStr = new Date(v.viewed_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <tr key={v.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="py-3 px-3 text-black font-medium whitespace-nowrap">
                          {timestampStr}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold max-w-[260px] sm:max-w-[340px] ${
                              isProduct
                                ? 'bg-[#f0f4ff] text-[#1e40af] border border-[#dbeabe]'
                                : 'bg-[#f3f3f3] text-black border border-[#e2e2e2]'
                            }`}
                            title={
                              isProduct
                                ? `Product: ${v.product_name || v.product_display_id}`
                                : 'Storefront Catalogue'
                            }
                          >
                            <span className="material-symbols-outlined text-[12px] shrink-0">
                              {isProduct ? 'inventory_2' : 'storefront'}
                            </span>
                            <span className="truncate">
                              {isProduct
                                ? `Product: ${v.product_name || v.product_display_id}`
                                : 'Storefront Catalogue'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#7e7576] whitespace-nowrap">
                          {v.product_display_id || '—'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-[#7e7576] whitespace-nowrap">
                          {v.visitor_ip_hash
                            ? `Session #${v.visitor_ip_hash.slice(0, 8)}`
                            : `ID #${v.id.slice(0, 8)}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination / Load More Controls */}
            {views.length > visibleLogCount && (
              <div className="mt-5 pt-4 border-t border-[#f3f3f3] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-wider text-[#7e7576] font-semibold">
                  Showing {visibleLogCount} of {views.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVisibleLogCount((prev) => prev + LOGS_PER_PAGE)}
                    className="px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold border border-[#e2e2e2] bg-white text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    Load {Math.min(LOGS_PER_PAGE, views.length - visibleLogCount)} More
                  </button>
                  {views.length > visibleLogCount + LOGS_PER_PAGE && (
                    <button
                      onClick={() => setVisibleLogCount(views.length)}
                      className="px-3 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-[#7e7576] hover:text-black transition-colors cursor-pointer"
                    >
                      Show All ({views.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
