import { useState } from 'react'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Toast, { toast } from '../components/Toast'
import SkeletonCard from '../components/SkeletonCard'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'
const API = 'https://zeleradeck.onrender.com/api/'

const adminApi = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { 'X-Admin-Key': ADMIN_PASSWORD },
})

function ShopRow({ shop, onRefresh }) {
  const [showReset, setShowReset] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [toggling, setToggling] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
      onRefresh()
      toast(`Store ${shop.is_active ? 'disabled' : 'enabled'}`)
    } catch { toast('Failed to toggle store', 'error') }
    finally { setToggling(false) }
  }

  const handleReset = async () => {
    if (!newPw || newPw.length < 6) { toast('Minimum 6 characters', 'error'); return }
    setResetting(true)
    try {
      await adminApi.post(`admin/shops/${shop.id}/reset-password/`, { new_password: newPw })
      setShowReset(false)
      setNewPw('')
      toast('Password updated ✓')
    } catch { toast('Failed to reset password', 'error') }
    finally { setResetting(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-[#0A0A0A]">{shop.name}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          shop.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
        }`}>
          {shop.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-xs text-[#737373]">
        {shop.phone} · {shop.product_count} products
      </p>
      <p className="text-xs text-[#A3A3A3] mt-0.5 truncate">
        zelera-deck.vercel.app/store/{shop.slug}
      </p>

      <div className="flex gap-2 mt-3 flex-wrap">
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
        <button
          onClick={() => setShowReset((v) => !v)}
          className="text-xs rounded-xl px-3 py-2 font-medium border border-[#E5E5E5] bg-white text-[#111111]"
        >
          Reset Password
        </button>
        <a
          href={`https://zelera-deck.vercel.app/store/${shop.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs rounded-xl px-3 py-2 font-medium border border-[#E5E5E5] bg-white text-[#111111]"
        >
          View Store ↗
        </a>
      </div>

      {showReset && (
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password (min 6)"
            className="flex-1 border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]"
          />
          <button
            onClick={handleReset}
            disabled={resetting}
            className="bg-[#111111] text-white text-xs font-medium px-4 rounded-xl disabled:opacity-50"
          >
            {resetting ? '…' : 'Set'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newShop, setNewShop] = useState({ name: '', phone: '', whatsapp_number: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null)

  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries(['admin-shops'])

  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => adminApi.get('admin/shops/').then((r) => r.data),
    enabled: authed,
  })

  const totalShops = shops?.length ?? 0
  const activeShops = shops?.filter((s) => s.is_active).length ?? 0
  const inactiveShops = shops?.filter((s) => !s.is_active).length ?? 0

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await adminApi.post('admin/shops/', newShop)
      setCreated(data)
      setNewShop({ name: '', phone: '', whatsapp_number: '', password: '' })
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
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Shops', value: totalShops },
            { label: 'Active', value: activeShops, color: 'text-[#166534]' },
            { label: 'Inactive', value: inactiveShops, color: 'text-[#991B1B]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-[#F0F0F0]">
              <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
              <p className="text-xs text-[#737373] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Created success card */}
        {created && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-[#166534] mb-2">Shop Created ✓</p>
            <p className="text-xs text-[#166534]">
              Link: <span className="font-mono">zelera-deck.vercel.app/store/{created.slug}</span>
            </p>
            <p className="text-xs text-[#166534] mt-0.5">Phone: {created.phone || newShop.phone}</p>
            <p className="text-xs text-[#737373] mt-1">Share these details with the shop owner</p>
            <button onClick={() => setCreated(null)} className="text-xs text-[#166534] underline mt-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Create shop */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mb-4">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              + Create New Shop
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <p className="text-sm font-semibold text-[#0A0A0A] mb-2">Create New Shop</p>
              {[
                { key: 'name',             placeholder: 'Shop Name',        type: 'text' },
                { key: 'phone',            placeholder: 'Phone Number',     type: 'tel' },
                { key: 'whatsapp_number',  placeholder: 'WhatsApp Number',  type: 'tel' },
                { key: 'password',         placeholder: 'Password',         type: 'password' },
              ].map(({ key, placeholder, type }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={placeholder}
                  value={newShop[key]}
                  onChange={(e) => setNewShop({ ...newShop, [key]: e.target.value })}
                  required
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]"
                />
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={creating} className="flex-1 bg-[#111111] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50">
                  {creating ? 'Creating…' : 'Create Shop'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-[#E5E5E5] text-[#111111] font-semibold py-3 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Shops list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {shops?.map((shop) => (
              <ShopRow key={shop.id} shop={shop} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
