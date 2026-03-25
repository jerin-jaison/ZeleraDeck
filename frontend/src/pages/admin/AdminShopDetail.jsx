import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Search, X, Trash2, ExternalLink, Package, Eye, EyeOff, Pencil } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { adminApi, timeAgo } from './AdminDashboard'
import Pagination from '../../components/Pagination'
import imageCompression from 'browser-image-compression'

const FRONTEND = 'https://zelera-deck.vercel.app'
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function AdminShopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const qc = useQueryClient()

  // Fetch all shops and find this one
  const { data: shopsData, isLoading: shopLoading } = useQuery({
    queryKey: ['admin-shops-all'],
    queryFn: () => adminApi.get('admin/shops/?page_size=50').then((r) => r.data),
  })
  const shops = shopsData?.shops ?? (Array.isArray(shopsData) ? shopsData : [])
  const shop = shops.find((s) => s.id === id)

  // Products
  const [prodSearch, setProdSearch] = useState('')
  const [prodPage, setProdPage] = useState(1)
  const { data: prodData, isLoading: prodLoading, isFetching: prodFetching } = useQuery({
    queryKey: ['admin-shop-products', id, prodPage],
    queryFn: () => adminApi.get(`admin/shops/${id}/products/?page=${prodPage}&page_size=12`).then((r) => r.data),
    enabled: !!id,
  })
  const products = prodData?.products ?? (Array.isArray(prodData) ? prodData : [])
  const prodPagination = prodData?.pagination

  // Filter products client-side for search
  const filteredProducts = prodSearch.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.display_id.toLowerCase().includes(prodSearch.toLowerCase()))
    : products

  // Actions
  const [toggling, setToggling] = useState(false)
  const [showResetPw, setShowResetPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesVal, setNotesVal] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting] = useState(false)

  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-shops'] }); qc.invalidateQueries({ queryKey: ['admin-shops-all'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }) }

  const handleToggle = async () => {
    setToggling(true)
    try { await adminApi.patch(`admin/shops/${id}/toggle/`); refresh(); showToast(shop?.is_active ? 'Store disabled' : 'Store enabled') }
    catch { showToast('Failed', 'error') }
    finally { setToggling(false) }
  }
  const handleResetPw = async () => {
    if (!newPw || newPw.length < 6) { showToast('Min 6 characters', 'error'); return }
    setResetting(true)
    try { await adminApi.patch(`admin/shops/${id}/reset-password/`, { new_password: newPw }); showToast('Password reset'); setShowResetPw(false); setNewPw('') }
    catch { showToast('Failed', 'error') }
    finally { setResetting(false) }
  }
  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try { await adminApi.patch(`admin/shops/${id}/edit/`, { admin_notes: notesVal }); refresh(); setEditingNotes(false); showToast('Notes saved') }
    catch { showToast('Failed', 'error') }
    finally { setSavingNotes(false) }
  }
  const handleDelete = async () => {
    setDeleting(true)
    try { await adminApi.delete(`admin/shops/${id}/`); refresh(); showToast('Shop deleted'); navigate('/admin-panel/shops') }
    catch { showToast('Failed', 'error') }
    finally { setDeleting(false) }
  }

  if (shopLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
  }
  if (!shop) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-bold text-[#0A0A0A]">Shop not found</p>
        <button onClick={() => navigate('/admin-panel/shops')} className="text-sm text-[#737373] underline mt-2">Back to shops</button>
      </div>
    )
  }

  const initial = shop.name?.charAt(0)?.toUpperCase() || 'S'
  const isExpired = shop.expires_at && new Date(shop.expires_at) < new Date()

  const infoRows = [
    { l: 'Phone', v: shop.phone },
    { l: 'WhatsApp', v: shop.whatsapp_number },
    { l: 'Joined', v: fmtDate(shop.created_at) },
    { l: 'Last Login', v: shop.last_login ? timeAgo(shop.last_login) : 'Never' },
    { l: 'Expires', v: shop.expires_at ? fmtDate(shop.expires_at) : 'No expiry' },
    { l: 'Products', v: shop.product_count },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <button onClick={() => navigate('/admin-panel/shops')} className="flex items-center gap-1 text-xs text-[#737373] mb-4 hover:text-[#0A0A0A]">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Shops
      </button>

      <div className="mb-6">
        <p className="text-xs text-[#737373]">Admin / Shops / {shop.name}</p>
        <h1 className="text-xl font-bold text-[#0A0A0A]">{shop.name}</h1>
        <p className="text-xs text-[#737373]">Shop details</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-4 mb-6 lg:mb-0">
          {/* Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
            <div className="text-center">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#F0F0F0] flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-[#737373]">{initial}</span>
                </div>
              )}
              <p className="text-lg font-bold mt-3">{shop.name}</p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${shop.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                {shop.is_active ? 'Active' : 'Inactive'}
              </span>
              <p className="text-xs text-[#737373] mt-2 truncate">zelera-deck.vercel.app/store/{shop.slug}</p>
            </div>

            <div className="mt-4 space-y-0">
              {infoRows.map(({ l, v }) => (
                <div key={l} className="flex justify-between py-2 border-b border-[#F8F8F8] last:border-0">
                  <span className="text-xs text-[#737373]">{l}</span>
                  <span className="text-xs font-medium text-[#0A0A0A] text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
            <p className="text-sm font-semibold mb-3">Actions</p>

            <button onClick={handleToggle} disabled={toggling}
              className={`w-full mb-2 rounded-xl py-3 text-sm font-medium disabled:opacity-50 ${shop.is_active ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#166534]'}`}>
              {toggling ? '...' : shop.is_active ? 'Disable Store' : 'Enable Store'}
            </button>

            <button onClick={() => { setShowResetPw(!showResetPw); setNewPw('') }}
              className="w-full mb-2 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">
              Reset Password
            </button>
            {showResetPw && (
              <div className="mb-2 p-3 bg-[#F8F8F8] rounded-xl">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 6)"
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2">
                    {showPw ? <EyeOff className="w-3.5 h-3.5 text-[#A3A3A3]" /> : <Eye className="w-3.5 h-3.5 text-[#A3A3A3]" />}
                  </button>
                </div>
                <button onClick={handleResetPw} disabled={resetting}
                  className="w-full mt-2 bg-[#111111] text-white rounded-lg py-2 text-xs font-medium disabled:opacity-50">
                  {resetting ? 'Saving...' : 'Set Password'}
                </button>
              </div>
            )}

            <a href={`${FRONTEND}/store/${shop.slug}`} target="_blank" rel="noopener noreferrer"
              className="w-full mb-2 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> View Store
            </a>

            <button onClick={() => setDeleteModal(true)}
              className="w-full bg-[#FEE2E2] text-[#991B1B] rounded-xl py-3 text-sm font-medium">
              Delete Shop
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* Products */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
            <p className="text-sm font-semibold mb-4">Products ({shop.product_count})</p>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input type="text" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Search products..."
                className="w-full border border-[#E5E5E5] rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              {prodSearch && <button onClick={() => setProdSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[#A3A3A3]" /></button>}
            </div>

            {prodLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl mb-2" />)
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-[#D4D4D4] mx-auto" />
                <p className="text-xs text-[#737373] mt-2">{prodSearch ? 'No matching products' : 'No products added yet'}</p>
              </div>
            ) : (
              <>
                <div className={`divide-y divide-[#F8F8F8] ${prodFetching ? 'opacity-60' : ''}`}>
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-[#F8F8F8] flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[#D4D4D4]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-[#A3A3A3]">{p.display_id}</p>
                        <p className="text-sm font-medium truncate">{p.name}</p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${p.is_in_stock ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                        {p.is_in_stock ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  ))}
                </div>
                {prodPagination && !prodSearch && (
                  <Pagination currentPage={prodPagination.page} totalPages={prodPagination.total_pages}
                    totalItems={prodPagination.total} pageSize={prodPagination.page_size}
                    onPageChange={(p) => setProdPage(p)} isLoading={prodFetching} />
                )}
              </>
            )}
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold">Internal Notes</p>
              {!editingNotes && (
                <button onClick={() => { setEditingNotes(true); setNotesVal(shop.admin_notes || '') }}>
                  <Pencil className="w-3.5 h-3.5 text-[#A3A3A3] hover:text-[#0A0A0A]" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <>
                <textarea value={notesVal} onChange={(e) => setNotesVal(e.target.value)} rows={3}
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] resize-none" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditingNotes(false)} className="text-xs text-[#737373]">Cancel</button>
                  <button onClick={handleSaveNotes} disabled={savingNotes}
                    className="text-xs font-medium bg-[#111111] text-white px-4 py-1.5 rounded-lg disabled:opacity-50">
                    {savingNotes ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            ) : shop.admin_notes ? (
              <p className="text-sm text-[#737373]">{shop.admin_notes}</p>
            ) : (
              <div>
                <p className="text-xs text-[#737373]">No notes yet</p>
                <button onClick={() => { setEditingNotes(true); setNotesVal('') }} className="text-xs underline text-[#0A0A0A] mt-1">Add note</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setDeleteModal(false); setDeleteName('') }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#991B1B]" />
            </div>
            <h3 className="text-base font-semibold text-center">Delete {shop.name}?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-3 text-center">This deletes the shop and all products permanently.</p>
            <label className="text-xs text-[#737373] mb-1 block">Type shop name to confirm:</label>
            <input type="text" value={deleteName} onChange={(e) => setDeleteName(e.target.value)}
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#EF4444]" />
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(false); setDeleteName('') }}
                className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting || deleteName !== shop.name}
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
