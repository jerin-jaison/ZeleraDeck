import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, X, Eye, EyeOff, CheckCircle, Copy } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { adminApi } from './AdminDashboard'
import imageCompression from 'browser-image-compression'
import { useQueryClient } from '@tanstack/react-query'

const FRONTEND = 'https://zelera-deck.vercel.app'

function genPassword(len = 8) {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminCreateShop() {
  const navigate = useNavigate()
  const showToast = useToast()
  const qc = useQueryClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState(genPassword())
  const [autoGen, setAutoGen] = useState(true)
  const [showPw, setShowPw] = useState(true)
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const logoRef = useRef()

  const handleLogoChange = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const compressed = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 512, useWebWorker: true })
      setLogo(compressed)
      setLogoPreview(URL.createObjectURL(compressed))
    } catch {
      showToast('Failed to compress image', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !password) { showToast('Name, phone, and password are required', 'error'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('phone', phone.trim())
      fd.append('password', password)
      if (logo) fd.append('logo', logo, 'logo.jpg')
      if (expiresAt) fd.append('expires_at', new Date(expiresAt).toISOString())
      if (notes.trim()) fd.append('admin_notes', notes.trim())

      const { data } = await adminApi.post('admin/shops/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      qc.invalidateQueries({ queryKey: ['admin-shops'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      showToast('Shop created!')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create shop', 'error')
    } finally { setSaving(false) }
  }

  const resetForm = () => {
    setName(''); setPhone(''); setPassword(genPassword()); setAutoGen(true)
    setShowPw(true); setLogo(null); setLogoPreview(''); setExpiresAt('')
    setNotes(''); setResult(null)
  }

  const copyText = (t) => { navigator.clipboard.writeText(t); showToast('Copied!') }

  // Success panel
  if (result) {
    const storeUrl = `${FRONTEND}/store/${result.slug}`
    const shareText = `Your ZeleraDeck store:\n🔗 ${storeUrl}\n📱 Login: ${phone}\n🔑 Password: ${password}`
    return (
      <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <div className="mb-6">
          <p className="text-xs text-[#737373]">Admin / Create Shop</p>
          <h1 className="text-xl font-bold text-[#0A0A0A]">Shop Created!</h1>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <p className="text-base font-semibold">{result.name}</p>
              <p className="text-xs text-[#737373]">{storeUrl}</p>
            </div>
          </div>

          <div className="space-y-3 bg-[#F8F8F8] rounded-xl p-4">
            {[
              { l: 'Store URL', v: storeUrl },
              { l: 'Phone (Login)', v: phone },
              { l: 'Password', v: password },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between items-center">
                <div><p className="text-[10px] text-[#737373]">{l}</p><p className="text-sm font-mono">{v}</p></div>
                <button onClick={() => copyText(v)} className="p-1.5 rounded-lg hover:bg-white"><Copy className="w-3.5 h-3.5 text-[#737373]" /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={resetForm} className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">
              Create Another
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] text-white rounded-xl py-3 text-sm font-semibold text-center">
              Share on WhatsApp
            </a>
          </div>
          <button onClick={() => navigate('/admin-panel/shops')}
            className="w-full mt-2 text-xs text-[#737373] underline">View in shops list</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="mb-6">
        <p className="text-xs text-[#737373]">Admin / Create Shop</p>
        <h1 className="text-xl font-bold text-[#0A0A0A]">Create Shop</h1>
        <p className="text-xs text-[#737373]">Add a new shop account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#F0F0F0] p-6 max-w-lg">
        {/* Logo */}
        <div className="mb-5">
          <p className="text-xs text-[#737373] mb-2">Shop Logo <span className="text-[#A3A3A3]">(optional)</span></p>
          {logoPreview ? (
            <div className="relative w-20 h-20">
              <img src={logoPreview} alt="" className="w-20 h-20 rounded-2xl object-cover border border-[#F0F0F0]" />
              <button type="button" onClick={() => { setLogo(null); setLogoPreview('') }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => logoRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center">
              <ImagePlus className="w-5 h-5 text-[#A3A3A3]" />
              <span className="text-[10px] text-[#A3A3A3] mt-1">Upload</span>
            </button>
          )}
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs text-[#737373] block mb-1.5">Shop Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="text-xs text-[#737373] block mb-1.5">Phone Number * <span className="text-[#A3A3A3]">(login + WhatsApp)</span></label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-[#737373]">Password *</label>
            <button type="button" onClick={() => {
              const next = !autoGen
              setAutoGen(next)
              if (next) { setPassword(genPassword()); setShowPw(true) }
            }} className="text-[10px] text-[#737373] underline">
              {autoGen ? 'Set manually' : 'Auto-generate'}
            </button>
          </div>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} readOnly={autoGen}
              onChange={(e) => !autoGen && setPassword(e.target.value)}
              className={`w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-[#111111] ${autoGen ? 'bg-[#F8F8F8]' : 'bg-white'}`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-[#A3A3A3]" /> : <Eye className="w-4 h-4 text-[#A3A3A3]" />}
            </button>
          </div>
        </div>

        {/* Expiry */}
        <div className="mb-4">
          <label className="text-xs text-[#737373] block mb-1.5">Subscription Expiry <span className="text-[#A3A3A3]">(optional)</span></label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs text-[#737373] block mb-1.5">Admin Notes <span className="text-[#A3A3A3]">(optional)</span></label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] resize-none" />
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50">
          {saving ? 'Creating…' : 'Create Shop'}
        </button>
      </form>
    </div>
  )
}
