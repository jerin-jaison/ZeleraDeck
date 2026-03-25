import { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Search, Trash2, Pencil, ChevronDown, Copy, CheckCircle, ImagePlus } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import imageCompression from 'browser-image-compression'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'
let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
if (!base.endsWith('/api/') && !base.endsWith('/api')) {
  base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
}
if (!base.endsWith('/')) base += '/'
const API = base
const FRONTEND = 'https://zelera-deck.vercel.app'

const adminApi = axios.create({ baseURL: API, timeout: 15000, headers: { 'X-Admin-Key': ADMIN_PASSWORD } })

function timeAgo(d) {
  if (!d) return 'Never'
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ────────────────── SHOP CARD ────────────────── */
function ShopCard({ shop, onRefresh }) {
  const showToast = useToast()
  const [showEdit, setShowEdit] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteName, setDeleteName] = useState('')
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit state
  const [editName, setEditName] = useState(shop.name)
  const [editPhone, setEditPhone] = useState(shop.phone)
  const [editExpiry, setEditExpiry] = useState(shop.expires_at ? shop.expires_at.slice(0, 10) : '')
  const [editNotes, setEditNotes] = useState(shop.admin_notes || '')
  const [editPw, setEditPw] = useState('')
  const [editLogo, setEditLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(shop.logo_url || '')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const logoInputRef = useRef()

  // Products fetch
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products', shop.id],
    queryFn: () => adminApi.get(`admin/shops/${shop.id}/products/`).then(r => r.data),
    enabled: showProducts,
  })

  const handleToggle = async () => {
    if (shop.is_active) { setConfirmDisable(true); return }
    setToggling(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      onRefresh(); showToast('Store enabled')
    } catch { showToast('Failed', 'error') }
    finally { setToggling(false) }
  }

  const doDisable = async () => {
    setToggling(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      onRefresh(); showToast('Store disabled — owner logged out')
    } catch { showToast('Failed', 'error') }
    finally { setToggling(false); setConfirmDisable(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await adminApi.delete(`admin/shops/${shop.id}/`); onRefresh(); showToast('Shop permanently deleted') }
    catch { showToast('Failed to delete', 'error') }
    finally { setDeleting(false); setConfirmDelete(false) }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', editName)
      fd.append('phone', editPhone)
      fd.append('admin_notes', editNotes)
      fd.append('expires_at', editExpiry ? new Date(editExpiry).toISOString() : '')
      if (editLogo) fd.append('logo', editLogo)
      await adminApi.patch(`admin/shops/${shop.id}/edit/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onRefresh(); setShowEdit(false); showToast('Shop updated')
    } catch (err) { showToast(err?.response?.data?.error || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const handleResetPw = async () => {
    if (!editPw || editPw.length < 6) { showToast('Min 6 characters', 'error'); return }
    setResetting(true)
    try {
      await adminApi.post(`admin/shops/${shop.id}/reset-password/`, { new_password: editPw })
      setEditPw(''); showToast('Password updated. Owner logged out.')
    } catch { showToast('Failed to reset', 'error') }
    finally { setResetting(false) }
  }

  const handleLogoPick = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    try { const c = await imageCompression(f, { maxSizeMB: 0.3, maxWidthOrHeight: 400, useWebWorker: true }); setEditLogo(c); setLogoPreview(URL.createObjectURL(c)) }
    catch { setEditLogo(f); setLogoPreview(URL.createObjectURL(f)) }
  }

  const isExpired = shop.expires_at && new Date(shop.expires_at) < new Date()
  const initial = shop.name?.charAt(0)?.toUpperCase() || 'S'

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover mr-3 flex-shrink-0 bg-[#F8F8F8]" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#F0F0F0] flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm font-bold text-[#737373]">{initial}</span>
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-[#0A0A0A]">{shop.name}</p>
              <p className="text-xs text-[#737373] mt-0.5">{shop.phone}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
            shop.is_expiring_soon && shop.is_active ? 'bg-[#FEF3C7] text-[#92400E]' :
            shop.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
          }`}>
            {shop.is_expiring_soon && shop.is_active ? 'Expiring' : shop.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Info */}
        <p className="text-[10px] text-[#A3A3A3] mt-2">
          {shop.product_count} products · Joined {fmtDate(shop.created_at)} · {shop.last_login ? `Last login: ${timeAgo(shop.last_login)}` : 'Never logged in'}
        </p>
        <p className="text-[10px] text-[#A3A3A3] mt-0.5 truncate">zelera-deck.vercel.app/store/{shop.slug}</p>
        {shop.expires_at && (
          <p className={`text-[10px] mt-0.5 font-medium ${isExpired ? 'text-[#EF4444]' : shop.is_expiring_soon ? 'text-[#D97706]' : 'text-[#A3A3A3]'}`}>
            {isExpired ? 'Expired' : 'Expires'}: {fmtDate(shop.expires_at)}
          </p>
        )}

        {/* View Products link */}
        <button onClick={() => setShowProducts(v => !v)} className="text-[10px] text-[#737373] underline mt-1">
          {showProducts ? 'Hide products' : 'View products →'}
        </button>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap mt-3">
          <button onClick={handleToggle} disabled={toggling}
            className={`text-xs rounded-xl px-3 py-2 font-medium disabled:opacity-50 ${
              shop.is_active ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#166534]'
            }`}>{toggling ? '…' : shop.is_active ? 'Disable' : 'Enable'}</button>
          <a href={`${FRONTEND}/store/${shop.slug}`} target="_blank" rel="noopener noreferrer"
            className="text-xs rounded-xl px-3 py-2 font-medium bg-[#F8F8F8] text-[#0A0A0A]">View Store ↗</a>
          <button onClick={() => setShowEdit(v => !v)}
            className="text-xs rounded-xl px-3 py-2 font-medium bg-[#F8F8F8] text-[#0A0A0A] flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit</button>
          <button onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-[#EF4444]" /></button>
        </div>

        {/* Products section */}
        {showProducts && (
          <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
            {productsLoading ? <p className="text-xs text-[#A3A3A3] py-4 text-center">Loading...</p> :
             !productsData?.products?.length ? <p className="text-xs text-[#A3A3A3] py-4 text-center">No products added yet</p> :
             <div className="space-y-2 max-h-60 overflow-y-auto">{productsData.products.map(p => (
               <div key={p.id} className="flex items-center gap-2">
                 <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#F8F8F8]" />
                 <div className="flex-1 min-w-0">
                   <p className="text-xs text-[#737373] font-mono">{p.display_id}</p>
                   <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                 </div>
                 <p className="text-xs font-bold">₹{p.price}</p>
                 <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.is_in_stock ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                   {p.is_in_stock ? 'In' : 'Out'}
                 </span>
               </div>
             ))}</div>}
          </div>
        )}

        {/* Edit panel */}
        {showEdit && (
          <div className="mt-3 pt-3 border-t border-[#F0F0F0] bg-[#F8F8F8] rounded-xl p-4 space-y-3">
            {/* Logo */}
            <div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoPick} className="hidden" />
              <div className="flex items-center gap-3">
                {logoPreview ? <img src={logoPreview} alt="" className="w-14 h-14 rounded-xl object-cover" /> :
                  <div className="w-14 h-14 rounded-xl bg-[#F0F0F0] flex items-center justify-center"><ImagePlus className="w-5 h-5 text-[#A3A3A3]" /></div>}
                <button type="button" onClick={() => logoInputRef.current?.click()} className="text-xs text-[#737373] underline">Change logo</button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Shop Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Phone (login + WhatsApp)</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Subscription Expiry</label>
              <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Admin Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111111]" placeholder="Internal only" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)} className="flex-1 border border-[#E5E5E5] text-[#111111] font-medium py-2 rounded-xl text-xs">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 bg-[#111111] text-white font-medium py-2 rounded-xl text-xs disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}</button>
            </div>
            {/* Reset Password */}
            <div className="pt-3 border-t border-[#E5E5E5]">
              <p className="text-xs font-medium text-[#737373] mb-2">Reset Password</p>
              <div className="flex gap-2">
                <input type="text" value={editPw} onChange={e => setEditPw(e.target.value)} placeholder="New password"
                  className="flex-1 border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                <button type="button" onClick={() => setEditPw(Math.random().toString(36).slice(-8))} className="text-xs text-[#737373] underline">Generate</button>
              </div>
              <button onClick={handleResetPw} disabled={resetting}
                className="mt-2 w-full border border-[#E5E5E5] text-[#111111] text-xs font-medium py-2 rounded-xl disabled:opacity-50">
                {resetting ? '…' : 'Set Password'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Disable confirm */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDisable(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto" style={{ animation: 'slideUp 0.25s ease-out' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold">Disable {shop.name}?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-5">The shop owner will be logged out immediately and their store will go offline for customers.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDisable(false)} className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={doDisable} disabled={toggling} className="flex-1 bg-[#FEE2E2] text-[#991B1B] rounded-xl py-3 text-sm font-semibold disabled:opacity-60">{toggling ? 'Disabling…' : 'Disable'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto" style={{ animation: 'slideUp 0.25s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-5 h-5 text-[#991B1B]" /></div>
            <h3 className="text-base font-semibold text-center">Permanently delete {shop.name}?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-3 text-center">Deletes shop and ALL {shop.product_count} products. Cannot be undone.</p>
            <input type="text" value={deleteName} onChange={e => setDeleteName(e.target.value)} placeholder="Type shop name to confirm"
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#EF4444]" />
            <div className="flex gap-3">
              <button onClick={() => { setConfirmDelete(false); setDeleteName('') }} className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting || deleteName !== shop.name}
                className="flex-1 bg-[#EF4444] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40">{deleting ? 'Deleting…' : 'Delete Forever'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ────────────────── MAIN ADMIN PANEL ────────────────── */
export default function AdminPanel() {
  const showToast = useToast()
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  // Create
  const [showCreate, setShowCreate] = useState(false)
  const [newShop, setNewShop] = useState({ name: '', phone: '', password: '' })
  const [autoPassword, setAutoPassword] = useState(false)
  const [newLogo, setNewLogo] = useState(null)
  const [newLogoPreview, setNewLogoPreview] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null)
  const logoRef = useRef()

  // Search
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t) }, [search])
  useEffect(() => { if (autoPassword) setNewShop(s => ({ ...s, password: Math.random().toString(36).slice(-8) })) }, [autoPassword])

  const qc = useQueryClient()
  const refresh = () => { qc.invalidateQueries(['admin-shops']); qc.invalidateQueries(['admin-stats']) }

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.get('admin/stats/').then(r => r.data), enabled: authed })
  const { data: shops, isFetching: shopsLoading } = useQuery({
    queryKey: ['admin-shops', debouncedSearch, statusFilter],
    queryFn: () => { const p = new URLSearchParams(); if (debouncedSearch) p.set('search', debouncedSearch); if (statusFilter !== 'all' && statusFilter !== 'expiring') p.set('status', statusFilter); return adminApi.get(`admin/shops/?${p}`).then(r => r.data) },
    enabled: authed,
    placeholderData: [],
  })
  const filteredShops = useMemo(() => {
    const safeShops = Array.isArray(shops) ? shops : []
    if (statusFilter === 'expiring') return safeShops.filter(s => s.is_expiring_soon)
    return safeShops
  }, [shops, statusFilter])

  const handleLogoPick = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    try { const c = await imageCompression(f, { maxSizeMB: 0.3, maxWidthOrHeight: 400, useWebWorker: true }); setNewLogo(c); setNewLogoPreview(URL.createObjectURL(c)) }
    catch { setNewLogo(f); setNewLogoPreview(URL.createObjectURL(f)) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true)
    try {
      const fd = new FormData()
      fd.append('name', newShop.name); fd.append('phone', newShop.phone); fd.append('password', newShop.password)
      if (newLogo) fd.append('logo', newLogo)
      if (newExpiry) fd.append('expires_at', new Date(newExpiry).toISOString())
      if (newNotes) fd.append('admin_notes', newNotes)
      const { data } = await adminApi.post('admin/shops/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCreated({ ...data, password: newShop.password })
      setNewShop({ name: '', phone: '', password: '' }); setNewLogo(null); setNewLogoPreview(''); setNewExpiry(''); setNewNotes(''); setAutoPassword(false); setShowCreate(false); refresh()
    } catch (err) {
      const d = err?.response?.data
      showToast(d ? (typeof d === 'string' ? d : Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')) : 'Failed to create shop.', 'error')
    } finally { setCreating(false) }
  }

  const shareOnWhatsApp = () => {
    if (!created) return
    const msg = `Hi! Your ZeleraDeck store is ready.\n\n🔗 Store: ${FRONTEND}/store/${created.slug}\n📱 Login: ${FRONTEND}/login\nPhone: ${created.phone}\nPassword: ${created.password}\n\nLog in to add your products!`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const copyText = (text) => { navigator.clipboard.writeText(text); showToast('Copied!') }

  // Auth gate
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center"><span className="text-white text-sm font-bold">Z</span></div>
            <span className="font-bold text-[#0A0A0A]">Admin Access</span>
          </div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Incorrect password'))}
            placeholder="Admin password"
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] mb-3" />
          {pwError && <p className="text-xs text-[#EF4444] mb-3">{pwError}</p>}
          <button onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Incorrect password')}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3 rounded-xl text-sm transition-colors">Enter</button>
        </div>
      </div>
    )
  }

  const pillCls = (a) => `text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${a ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#737373]'}`

  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div><p className="text-lg font-bold text-[#0A0A0A]">ZeleraDeck Admin</p><p className="text-xs text-[#737373]">Platform management</p></div>
          <button onClick={() => setAuthed(false)} className="text-xs text-[#737373] border border-[#E5E5E5] px-3 py-1.5 rounded-lg">Logout</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Shops', value: stats?.total_shops ?? '—' },
            { label: 'Active', value: stats?.active_shops ?? '—', color: 'text-[#166534]' },
            { label: 'Inactive', value: stats?.inactive_shops ?? '—', color: 'text-[#991B1B]' },
            { label: 'Expiring Soon', value: stats?.shops_expiring_soon ?? 0, color: stats?.shops_expiring_soon > 0 ? 'text-[#92400E]' : 'text-[#A3A3A3]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-[#F0F0F0]">
              <p className={`text-2xl font-black ${color || 'text-[#0A0A0A]'}`}>{value}</p>
              <p className="text-xs text-[#737373] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Created success */}
        {created && (
          <div className="bg-[#F0FDF4] rounded-xl p-4 mt-6 border border-[#DCFCE7]">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#166534]" /><p className="text-sm font-semibold text-[#166534]">Shop Created Successfully!</p></div>
            <div className="bg-white rounded-xl p-3 mt-3 space-y-1">
              {created.logo_url && <img src={created.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <p className="font-semibold text-sm">{created.name}</p>
              <p className="text-sm text-[#737373]">{created.phone}</p>
            </div>
            <div className="mt-3">
              <p className="text-xs text-[#737373]">Store link</p>
              <p className="text-sm font-mono text-[#0A0A0A] break-all">zelera-deck.vercel.app/store/{created.slug}</p>
              <button onClick={() => copyText(`${FRONTEND}/store/${created.slug}`)} className="text-xs text-[#737373] underline mt-1">Copy link</button>
            </div>
            <div className="mt-3 bg-[#F8F8F8] rounded-xl p-3">
              <p className="text-xs text-[#737373] mb-2">Share these login details with the shop owner:</p>
              <div className="flex justify-between items-center"><p className="text-xs">Phone: {created.phone}</p><button onClick={() => copyText(created.phone)}><Copy className="w-3 h-3 text-[#A3A3A3]" /></button></div>
              <div className="flex justify-between items-center mt-1"><p className="text-xs">Password: {created.password}</p><button onClick={() => copyText(created.password)}><Copy className="w-3 h-3 text-[#A3A3A3]" /></button></div>
            </div>
            <button onClick={shareOnWhatsApp} className="w-full mt-3 bg-[#25D366] text-white rounded-xl py-3 text-xs font-medium flex items-center justify-center gap-1.5">Share on WhatsApp</button>
            <button onClick={() => { setCreated(null); setShowCreate(true) }} className="w-full mt-2 border border-[#E5E5E5] rounded-xl py-2.5 text-xs font-medium text-[#0A0A0A]">Create Another Shop</button>
          </div>
        )}

        {/* Create */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden mt-6">
          <button onClick={() => setShowCreate(v => !v)} className="w-full p-4 flex justify-between items-center">
            <p className="text-sm font-semibold text-[#0A0A0A]">Create New Shop</p>
            <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform ${showCreate ? 'rotate-180' : ''}`} />
          </button>
          {showCreate && (
            <form onSubmit={handleCreate} className="p-4 pt-0 space-y-4">
              {/* Logo */}
              <div>
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoPick} className="hidden" />
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="w-full h-32 bg-[#F8F8F8] rounded-xl border-2 border-dashed border-[#D4D4D4] flex items-center justify-center overflow-hidden">
                  {newLogoPreview ? <img src={newLogoPreview} alt="" className="w-full h-full object-contain" /> :
                    <div className="text-center"><ImagePlus className="w-6 h-6 text-[#A3A3A3] mx-auto" /><p className="text-xs text-[#737373] mt-1">Add shop logo (optional)</p></div>}
                </button>
              </div>
              <input type="text" placeholder="Shop Name *" value={newShop.name} onChange={e => setNewShop({...newShop, name: e.target.value})} required className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              <div>
                <input type="tel" placeholder="Phone Number *" value={newShop.phone} onChange={e => setNewShop({...newShop, phone: e.target.value})} required className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                <p className="text-xs text-[#A3A3A3] mt-0.5 ml-1">Used for login and WhatsApp. Include country code if needed.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#737373]">Password</label>
                  <button type="button" onClick={() => setAutoPassword(v => !v)}
                    className={`text-xs px-3 py-1 rounded-full ${autoPassword ? 'bg-[#0A0A0A] text-white' : 'bg-[#F8F8F8] text-[#737373]'}`}>{autoPassword ? 'Auto ✓' : 'Auto-generate'}</button>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Password *" value={newShop.password} onChange={e => setNewShop({...newShop, password: e.target.value})} readOnly={autoPassword} required
                    className={`flex-1 border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] ${autoPassword ? 'bg-[#F8F8F8] font-mono' : ''}`} />
                  {autoPassword && <button type="button" onClick={() => copyText(newShop.password)} className="px-3 border border-[#E5E5E5] rounded-xl"><Copy className="w-4 h-4 text-[#737373]" /></button>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#737373] mb-1.5 block">Subscription Expiry <span className="text-[#A3A3A3]">(optional)</span></label>
                <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              </div>
              <textarea placeholder="Admin Notes — never shown to shop owner" value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={2}
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              <button type="submit" disabled={creating}
                className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : 'Create Shop'}
              </button>
            </form>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..."
            className="w-full border border-[#E5E5E5] rounded-xl pl-9 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3" style={{ scrollbarWidth: 'none' }}>
          {['all','active','inactive','expiring'].map(k => (
            <button key={k} onClick={() => setStatusFilter(k)} className={pillCls(statusFilter === k)}>
              {k === 'all' ? 'All' : k === 'expiring' ? 'Expiring Soon' : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {/* Shops */}
        <div className="mt-4 space-y-3">
          {shopsLoading ? Array.from({length:3}).map((_,i) => <div key={i} className="h-36 skeleton rounded-2xl" />) :
           filteredShops.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-10 text-center">
              <p className="text-sm font-semibold text-[#737373]">No shops found</p>
              <p className="text-xs text-[#A3A3A3] mt-1">{search ? 'Try a different search' : 'Create your first shop above'}</p>
            </div>
           ) : filteredShops.map(s => <ShopCard key={s.id} shop={s} onRefresh={refresh} />)}
        </div>
      </div>
    </div>
  )
}
