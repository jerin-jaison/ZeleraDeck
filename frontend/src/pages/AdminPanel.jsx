import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Search, Trash2, ExternalLink, Copy } from 'lucide-react'
import Toast, { toast } from '../components/Toast'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api/'
  : 'https://zeleradeck.onrender.com/api/'
const FRONTEND = 'https://zelera-deck.vercel.app'

const adminApi = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { 'X-Admin-Key': ADMIN_PASSWORD },
})

// ── Utility: relative time ──
function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Shop Card ──
function ShopCard({ shop, onRefresh }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteName, setDeleteName] = useState('')
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Inline edit state
  const [editName, setEditName] = useState(shop.name)
  const [editWA, setEditWA] = useState(shop.whatsapp_number)
  const [editExpiry, setEditExpiry] = useState(shop.expires_at ? shop.expires_at.slice(0, 10) : '')
  const [editNotes, setEditNotes] = useState(shop.admin_notes || '')
  const [editPw, setEditPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleToggle = async () => {
    if (shop.is_active) {
      setConfirmDisable(true)
      return
    }
    setToggling(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      onRefresh()
      toast('Store enabled')
    } catch { toast('Failed', 'error') }
    finally { setToggling(false) }
  }

  const doDisable = async () => {
    setToggling(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      onRefresh()
      toast('Store disabled — shop owner logged out')
    } catch { toast('Failed to disable', 'error') }
    finally { setToggling(false); setConfirmDisable(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminApi.delete(`admin/shops/${shop.id}/`)
      onRefresh()
      toast('Shop permanently deleted')
    } catch { toast('Failed to delete', 'error') }
    finally { setDeleting(false); setConfirmDelete(false) }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/edit/`, {
        name: editName,
        whatsapp_number: editWA,
        admin_notes: editNotes,
        expires_at: editExpiry ? new Date(editExpiry).toISOString() : null,
      })
      onRefresh()
      setShowEdit(false)
      toast('Shop updated')
    } catch (err) {
      toast(err?.response?.data?.error || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  const handleResetPw = async () => {
    if (!editPw || editPw.length < 6) { toast('Min 6 characters', 'error'); return }
    setResetting(true)
    try {
      await adminApi.post(`admin/shops/${shop.id}/reset-password/`, { new_password: editPw })
      setEditPw('')
      toast('Password updated. Shop owner has been logged out.')
    } catch { toast('Failed to reset', 'error') }
    finally { setResetting(false) }
  }

  const isExpired = shop.expires_at && new Date(shop.expires_at) < new Date()

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-base font-semibold text-[#0A0A0A] truncate flex-1 mr-2">{shop.name}</p>
          <div className="flex gap-1.5">
            {shop.is_expiring_soon && shop.is_active && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                Expiring
              </span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              shop.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}>
              {shop.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Info row */}
        <p className="text-xs text-[#737373]">
          {shop.phone} · {shop.product_count} products · Joined {formatDate(shop.created_at)}
        </p>

        {/* Expiry row */}
        {shop.expires_at && (
          <p className={`text-xs mt-0.5 ${
            isExpired ? 'text-[#EF4444]' : shop.is_expiring_soon ? 'text-[#92400E]' : 'text-[#A3A3A3]'
          }`}>
            {isExpired ? 'Expired' : 'Expires'}: {formatDate(shop.expires_at)}
          </p>
        )}

        {/* Store link */}
        <p className="text-xs text-[#A3A3A3] mt-0.5 truncate">
          zelera-deck.vercel.app/store/{shop.slug}
        </p>

        {/* Action buttons 2×2 grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`text-xs rounded-xl px-3 py-2 font-medium disabled:opacity-50 ${
              shop.is_active
                ? 'bg-[#FEE2E2] text-[#991B1B]'
                : 'bg-[#DCFCE7] text-[#166534]'
            }`}
          >
            {toggling ? '…' : shop.is_active ? 'Disable' : 'Enable'}
          </button>

          <a
            href={`${FRONTEND}/store/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs rounded-xl px-3 py-2 font-medium border border-[#E5E5E5] bg-white text-[#111111] text-center"
          >
            View Store ↗
          </a>

          <button
            onClick={() => setShowEdit((v) => !v)}
            className="text-xs rounded-xl px-3 py-2 font-medium border border-[#E5E5E5] bg-white text-[#111111]"
          >
            {showEdit ? 'Close Edit' : 'Edit Shop'}
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs rounded-xl px-3 py-2 font-medium bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center gap-1"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>

        {/* Inline edit panel */}
        {showEdit && (
          <div className="mt-3 pt-3 border-t border-[#F0F0F0] space-y-3">
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Shop Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Phone (read-only)</label>
              <input value={shop.phone} readOnly disabled
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm bg-[#F8F8F8] text-[#A3A3A3]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">WhatsApp Number</label>
              <input value={editWA} onChange={(e) => setEditWA(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Subscription Expiry</label>
              <input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Leave blank for no expiry</p>
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#737373] mb-0.5 block">Admin Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2}
                className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111111]"
                placeholder="Internal only — shop owner never sees this" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 border border-[#E5E5E5] text-[#111111] font-medium py-2 rounded-xl text-xs">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 bg-[#111111] text-white font-medium py-2 rounded-xl text-xs disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {/* Reset password inside edit panel */}
            <div className="pt-3 border-t border-[#F0F0F0]">
              <p className="text-[10px] font-medium text-[#737373] mb-1.5">Reset Password</p>
              <div className="flex gap-2">
                <input type="text" value={editPw} onChange={(e) => setEditPw(e.target.value)}
                  placeholder="New password (min 6)"
                  className="flex-1 border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                <button onClick={handleResetPw} disabled={resetting}
                  className="bg-[#111111] text-white text-xs font-medium px-4 rounded-xl disabled:opacity-50">
                  {resetting ? '…' : 'Set'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin notes toggle */}
        {shop.admin_notes && !showEdit && (
          <div className="mt-2">
            <button onClick={() => setShowNotes((v) => !v)}
              className="text-[10px] text-[#A3A3A3]">
              Notes {showNotes ? '▴' : '▾'}
            </button>
            {showNotes && (
              <div className="bg-[#F8F8F8] rounded-lg p-2 mt-1">
                <p className="text-xs text-[#737373] whitespace-pre-wrap">{shop.admin_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Last login */}
        <p className="text-[10px] text-[#A3A3A3] mt-2">
          {shop.last_login ? `Last login: ${timeAgo(shop.last_login)}` : 'Never logged in'}
        </p>
      </div>

      {/* Disable confirmation bottom sheet */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDisable(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 pb-safe max-w-md mx-auto"
            style={{ animation: 'slideUp 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[#0A0A0A]">Disable {shop.name}?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-5">
              The shop owner will be logged out immediately and their store will go offline.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDisable(false)}
                className="flex-1 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={doDisable} disabled={toggling}
                className="flex-1 bg-[#FEE2E2] text-[#991B1B] rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
                {toggling ? 'Disabling…' : 'Disable Shop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation bottom sheet */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 pb-safe max-w-md mx-auto"
            style={{ animation: 'slideUp 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={18} className="text-[#991B1B]" />
            </div>
            <h3 className="text-base font-semibold text-[#0A0A0A] text-center">
              Permanently delete {shop.name}?
            </h3>
            <p className="text-sm text-[#737373] mt-1 mb-3 text-center">
              This will delete the shop and ALL {shop.product_count} products. This cannot be undone.
            </p>
            <input
              type="text"
              value={deleteName}
              onChange={(e) => setDeleteName(e.target.value)}
              placeholder="Type shop name to confirm"
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
            />
            <div className="flex gap-3">
              <button onClick={() => { setConfirmDelete(false); setDeleteName('') }}
                className="flex-1 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl py-3 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteName !== shop.name}
                className="flex-1 bg-[#EF4444] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  // Create shop
  const [showCreate, setShowCreate] = useState(false)
  const [newShop, setNewShop] = useState({ name: '', phone: '', whatsapp_number: '', password: '' })
  const [newExpiry, setNewExpiry] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null)

  // Search / filter
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const qc = useQueryClient()
  const refresh = () => { qc.invalidateQueries(['admin-shops']); qc.invalidateQueries(['admin-stats']) }

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.get('admin/stats/').then((r) => r.data),
    enabled: authed,
  })

  // Shops
  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin-shops', debouncedSearch, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      return adminApi.get(`admin/shops/?${params}`).then((r) => r.data)
    },
    enabled: authed,
  })

  // Filter expiring soon client-side
  const filteredShops = useMemo(() => {
    if (!shops) return []
    if (statusFilter === 'expiring') return shops.filter((s) => s.is_expiring_soon)
    return shops
  }, [shops, statusFilter])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const body = { ...newShop }
      if (newExpiry) body.expires_at = new Date(newExpiry).toISOString()
      if (newNotes) body.admin_notes = newNotes
      const { data } = await adminApi.post('admin/shops/', body)
      setCreated({ ...data, password: newShop.password })
      setNewShop({ name: '', phone: '', whatsapp_number: '', password: '' })
      setNewExpiry('')
      setNewNotes('')
      setShowCreate(false)
      refresh()
    } catch (err) {
      const d = err?.response?.data
      const msg = d
        ? typeof d === 'string' ? d
          : Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
        : 'Failed to create shop.'
      toast(msg, 'error')
    } finally {
      setCreating(false)
    }
  }

  const shareOnWhatsApp = () => {
    if (!created) return
    const msg =
      `Hi! Your ZeleraDeck store is ready.\n\n` +
      `Login: ${FRONTEND}/login\n` +
      `Phone: ${created.phone}\n` +
      `Password: ${created.password}\n` +
      `Your store link: ${FRONTEND}/store/${created.slug}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const copyStoreLink = () => {
    if (!created) return
    navigator.clipboard.writeText(`${FRONTEND}/store/${created.slug}`)
    toast('Link copied!')
  }

  // ── Auth gate ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <Toast />
        <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <span className="font-bold text-[#0A0A0A]">Admin Access</span>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Incorrect password'))}
            placeholder="Admin password"
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] mb-3"
          />
          {pwError && <p className="text-xs text-[#EF4444] mb-3">{pwError}</p>}
          <button
            onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Incorrect password')}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  const pillCls = (active) =>
    `text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
      active ? 'bg-[#111111] text-white' : 'bg-white border border-[#E5E5E5] text-[#737373]'
    }`

  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <Toast />

      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="text-base font-bold text-[#0A0A0A]">ZeleraDeck Admin</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-[#737373] hover:text-[#0A0A0A]">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ── SECTION A: Stats Bar ── */}
        <div className="flex gap-3 overflow-x-auto pb-1 mb-6">
          {[
            { label: 'Total Shops', value: stats?.total_shops ?? '—' },
            { label: 'Active', value: stats?.active_shops ?? '—', color: 'text-[#166534]' },
            { label: 'Inactive', value: stats?.inactive_shops ?? '—', color: 'text-[#991B1B]' },
            stats?.shops_expiring_soon > 0 && {
              label: 'Expiring Soon', value: stats.shops_expiring_soon, color: 'text-[#92400E]',
            },
          ]
            .filter(Boolean)
            .map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-3 border border-[#F0F0F0] min-w-[100px] flex-shrink-0">
                <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
                <p className="text-xs text-[#737373] mt-0.5">{label}</p>
              </div>
            ))}
        </div>

        {/* ── SECTION B: Created success ── */}
        {created && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-[#166534] mb-2">✓ Shop Created</p>
            <p className="text-xs text-[#166534]">
              Store: <span className="font-mono">zelera-deck.vercel.app/store/{created.slug}</span>
            </p>
            <p className="text-xs text-[#166534] mt-0.5">Login phone: {created.phone}</p>
            <p className="text-xs text-[#166534] mt-0.5">Password: <span className="font-mono">{created.password}</span></p>
            <p className="text-[10px] text-[#737373] mt-2">Share these details with the shop owner</p>
            <div className="flex gap-2 mt-3">
              <button onClick={copyStoreLink}
                className="flex-1 flex items-center justify-center gap-1 border border-[#BBF7D0] text-[#166534] text-xs font-medium px-3 py-2 rounded-xl">
                <Copy size={12} /> Copy Link
              </button>
              <button onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] text-white text-xs font-medium px-3 py-2 rounded-xl">
                Share on WhatsApp
              </button>
            </div>
            <button onClick={() => setCreated(null)} className="text-[10px] text-[#166534] underline mt-2 block">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Create Shop ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0A0A0A]">Create New Shop</p>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="w-7 h-7 rounded-lg bg-[#F8F8F8] flex items-center justify-center transition-transform"
              style={{ transform: showCreate ? 'rotate(45deg)' : 'none' }}
            >
              {showCreate ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="mt-3 space-y-3">
              {[
                { key: 'name',            placeholder: 'Shop Name *',        type: 'text' },
                { key: 'phone',           placeholder: 'Phone Number *',     type: 'tel' },
                { key: 'whatsapp_number', placeholder: 'WhatsApp Number *',  type: 'tel', note: 'Include country code: 919876543210' },
                { key: 'password',        placeholder: 'Password *',         type: 'text' },
              ].map(({ key, placeholder, type, note }) => (
                <div key={key}>
                  <input type={type} placeholder={placeholder}
                    value={newShop[key]}
                    onChange={(e) => setNewShop({ ...newShop, [key]: e.target.value })}
                    required
                    className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                  {note && <p className="text-[10px] text-[#A3A3A3] mt-0.5 ml-1">{note}</p>}
                </div>
              ))}
              <div>
                <input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
                <p className="text-[10px] text-[#A3A3A3] mt-0.5 ml-1">Subscription Expiry · Leave blank for no expiry</p>
              </div>
              <div>
                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2}
                  placeholder="Admin Notes (internal only)"
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111111]" />
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Shop'}
              </button>
            </form>
          )}
        </div>

        {/* ── SECTION C: Search Bar ── */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shop name or phone..."
            className="w-full border border-[#E5E5E5] rounded-xl pl-9 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'expiring', label: 'Expiring Soon' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)} className={pillCls(statusFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SECTION D: Shops List ── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-10 text-center">
            <p className="text-sm font-semibold text-[#737373]">No shops found</p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              {search ? 'Try a different search term' : 'Create your first shop above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
