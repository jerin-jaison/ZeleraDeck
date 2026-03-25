import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'

// Dedicated plain axios for admin — bypasses the JWT interceptor entirely
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  timeout: 15000,
  headers: { 'X-Admin-Key': ADMIN_PASSWORD },
})



export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [createForm, setCreateForm] = useState(false)
  const [newShop, setNewShop] = useState({ name: '', phone: '', whatsapp_number: '', password: '' })
  const [created, setCreated] = useState(null)

  const qc = useQueryClient()

  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => adminApi.get('admin/shops/').then((r) => r.data),
    enabled: authed,
  })

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Admin Access</h1>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
          />
          {pwError && <p className="text-red-500 text-xs mb-3">{pwError}</p>}
          <button
            onClick={() => {
              if (pw === ADMIN_PASSWORD) setAuthed(true)
              else setPwError('Incorrect password')
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  const toggle = async (shop) => {
    await adminApi.patch(`admin/shops/${shop.id}/toggle/`)
    qc.invalidateQueries(['admin-shops'])
  }

  const resetPassword = async () => {
    if (!newPw || newPw.length < 6) return alert('Min 6 characters')
    await adminApi.post(`admin/shops/${resetTarget.id}/reset-password/`, { new_password: newPw })
    setResetTarget(null)
    setNewPw('')
    alert('Password updated.')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await adminApi.post('admin/shops/', newShop)
      setCreated(data)
      setCreateForm(false)
      setNewShop({ name: '', phone: '', whatsapp_number: '', password: '' })
      qc.invalidateQueries(['admin-shops'])
    } catch (err) {
      const d = err?.response?.data
      const msg = d
        ? typeof d === 'string' ? d
          : Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
        : 'Failed to create shop.'
      alert(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-900">ZeleraDeck Admin</h1>
          <button
            onClick={() => setCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            + Create Shop
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {created && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
            <strong>Shop created!</strong> Slug: <code>{created.slug}</code> | Link: <code>{created.public_url}</code>
            <button className="ml-4 text-green-600 underline" onClick={() => setCreated(null)}>Dismiss</button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading shops...</div>
        ) : (
          <div className="space-y-3">
            {shops?.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
                  <p className="text-xs text-gray-400">{shop.phone} · {shop.slug} · {shop.product_count} products</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${shop.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {shop.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => toggle(shop)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  {shop.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setResetTarget(shop)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                >
                  Reset PW
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-800 mb-4">Reset password for {resetTarget.name}</h2>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none"
            />
            <div className="flex gap-3">
              <button onClick={resetPassword} className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-xl text-sm">Update</button>
              <button onClick={() => setResetTarget(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create shop modal */}
      {createForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-800 mb-4">Create New Shop</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {['name', 'phone', 'whatsapp_number', 'password'].map((field) => (
                <input
                  key={field}
                  type={field === 'password' ? 'password' : 'text'}
                  placeholder={field.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  value={newShop[field]}
                  onChange={(e) => setNewShop({ ...newShop, [field]: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              ))}
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-xl text-sm">Create</button>
                <button type="button" onClick={() => setCreateForm(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
