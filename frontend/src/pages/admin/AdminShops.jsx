import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, X, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { adminApi, timeAgo } from './AdminDashboard'
import Pagination from '../../components/Pagination'
import imageCompression from 'browser-image-compression'

const FRONTEND = 'https://www.zeleradeck.com'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminShops() {
  const navigate = useNavigate()
  const showToast = useToast()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1) }, 300); return () => clearTimeout(t) }, [search])
  useEffect(() => { setCurrentPage(1) }, [statusFilter])

  // Read filter from URL
  useEffect(() => {
    const f = searchParams.get('filter')
    if (f) setStatusFilter(f)
  }, [searchParams])

  const buildParams = () => {
    const p = new URLSearchParams()
    if (debouncedSearch) p.set('search', debouncedSearch)
    if (statusFilter === 'active') p.set('status', 'active')
    else if (statusFilter === 'inactive') p.set('status', 'inactive')
    p.set('page', String(currentPage))
    p.set('page_size', '10')
    return p.toString()
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-shops', debouncedSearch, statusFilter, currentPage],
    queryFn: () => adminApi.get(`admin/shops/?${buildParams()}`).then((r) => r.data),
    placeholderData: (prev) => prev,
  })

  const shops = data?.shops ?? (Array.isArray(data) ? data : [])
  const pagination = data?.pagination

  // Filter expiring client-side if needed
  const filteredShops = statusFilter === 'expiring' ? shops.filter((s) => s.is_expiring_soon) : shops
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-shops'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }) }

  const pillCls = (a) => `text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${a ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#737373]'}`

  // Toggle
  const handleToggle = async (shop) => {
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      refresh()
      showToast(shop.is_active ? 'Store disabled' : 'Store enabled')
    } catch { showToast('Failed', 'error') }
  }

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminApi.delete(`admin/shops/${deleteTarget.id}/`)
      refresh()
      showToast('Shop deleted')
    } catch { showToast('Failed', 'error') }
    finally { setDeleting(false); setDeleteTarget(null); setDeleteName('') }
  }

  return (
    <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="mb-6">
        <p className="text-xs text-[#737373]">Admin / Shops</p>
        <h1 className="text-xl font-bold text-[#0A0A0A]">Shops</h1>
        <p className="text-xs text-[#737373]">{pagination?.total ?? filteredShops.length} registered shops</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..."
          className="w-full border border-[#E5E5E5] rounded-xl pl-9 pr-9 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[#A3A3A3]" /></button>}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
        {['all', 'active', 'inactive', 'expiring'].map((k) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={pillCls(statusFilter === k)}>
            {k === 'all' ? 'All' : k === 'expiring' ? 'Expiring Soon' : k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* Shops list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-10 text-center">
            <p className="text-sm font-semibold text-[#737373]">No shops found</p>
            <p className="text-xs text-[#A3A3A3] mt-1">{search ? 'Try a different search' : 'Create your first shop'}</p>
          </div>
        ) : (
          filteredShops.map((shop) => {
            const isExpired = shop.expires_at && new Date(shop.expires_at) < new Date()
            const initial = shop.name?.charAt(0)?.toUpperCase() || 'S'
            return (
              <div key={shop.id} className={`bg-white rounded-2xl border border-[#F0F0F0] p-4 ${isFetching ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between">
                  <button onClick={() => navigate(`/admin-panel/shops/${shop.id}`)} className="flex items-center text-left">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover mr-3 flex-shrink-0 bg-[#F8F8F8]" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#F0F0F0] flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-bold text-[#737373]">{initial}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-base font-semibold text-[#0A0A0A] hover:underline">{shop.name}</p>
                      <p className="text-xs text-[#737373] mt-0.5">{shop.phone}</p>
                    </div>
                  </button>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    shop.is_expiring_soon && shop.is_active ? 'bg-[#FEF3C7] text-[#92400E]' :
                    shop.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}>
                    {shop.is_expiring_soon && shop.is_active ? 'Expiring' : shop.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-[10px] text-[#A3A3A3] mt-2">
                  {shop.product_count} products · Joined {fmtDate(shop.created_at)} · {shop.last_login ? `Last login: ${timeAgo(shop.last_login)}` : 'Never logged in'}
                </p>
                <p className="text-[10px] text-[#A3A3A3] mt-0.5 truncate">www.zeleradeck.com/{shop.slug}</p>
                {shop.expires_at && (
                  <p className={`text-[10px] mt-0.5 font-medium ${isExpired ? 'text-[#EF4444]' : shop.is_expiring_soon ? 'text-[#D97706]' : 'text-[#A3A3A3]'}`}>
                    {isExpired ? 'Expired' : 'Expires'}: {fmtDate(shop.expires_at)}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap mt-3">
                  <button onClick={() => handleToggle(shop)}
                    className={`text-xs rounded-xl px-3 py-2 font-medium ${shop.is_active ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#166534]'}`}>
                    {shop.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <a href={`${FRONTEND}/${shop.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs rounded-xl px-3 py-2 font-medium bg-[#F8F8F8] text-[#0A0A0A] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View Store
                  </a>
                  <button onClick={() => navigate(`/admin-panel/shops/${shop.id}`)}
                    className="text-xs rounded-xl px-3 py-2 font-medium bg-[#F8F8F8] text-[#0A0A0A] flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Detail
                  </button>
                  <button onClick={() => setDeleteTarget(shop)}
                    className="w-8 h-8 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total}
          pageSize={pagination.page_size}
          onPageChange={(p) => setCurrentPage(p)}
          isLoading={isFetching}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setDeleteTarget(null); setDeleteName('') }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#991B1B]" />
            </div>
            <h3 className="text-base font-semibold text-center">Delete {deleteTarget.name}?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-3 text-center">
              Deletes shop and ALL {deleteTarget.product_count} products. Cannot be undone.
            </p>
            <input type="text" value={deleteName} onChange={(e) => setDeleteName(e.target.value)} placeholder="Type shop name to confirm"
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#EF4444]" />
            <div className="flex gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteName('') }}
                className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting || deleteName !== deleteTarget.name}
                className="flex-1 bg-[#EF4444] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40">
                {deleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
