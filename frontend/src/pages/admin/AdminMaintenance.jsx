import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { adminApi } from './AdminDashboard'
import { useToast } from '../../context/ToastContext'
import Logo from '../../components/Logo'

export default function AdminMaintenance() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [maintenance, setMaintenance] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    adminApi.get('admin/maintenance/')
      .then((r) => {
        if (!cancelled) {
          setMaintenance(r.data.maintenance)
          setMessage(r.data.message)
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load status', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleToggle = async () => {
    const newState = !maintenance
    setMaintenance(newState) // optimistic
    try {
      const r = await adminApi.post('admin/maintenance/', { maintenance: newState })
      // Sync from server response to guarantee consistency
      setMaintenance(r.data.maintenance)
      showToast(r.data.maintenance ? 'Maintenance mode enabled' : 'Site is back online')
    } catch {
      setMaintenance(!newState) // revert
      showToast('Failed to toggle', 'error')
    }
  }

  const handleSaveMessage = async () => {
    setSaving(true)
    try {
      await adminApi.post('admin/maintenance/', { maintenance, message })
      showToast('Message saved')
    } catch {
      showToast('Failed to save message', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-0px)] flex flex-col items-center justify-center px-4 py-8" style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-[#0A0A0A]">Maintenance Mode</h1>
            <p className="text-xs text-[#737373] mt-1">Control site-wide availability</p>
          </div>
          <div className="space-y-4">
            <div className="h-32 skeleton rounded-2xl" />
            <div className="h-48 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-0px)] flex flex-col items-center justify-center px-4 py-8" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="w-full max-w-lg">

        {/* Page heading — inside the centered block */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-[#0A0A0A]">Maintenance Mode</h1>
          <p className="text-xs text-[#737373] mt-1">Control site-wide availability</p>
        </div>

        {/* ── Status Card ── */}
        <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Site Status</p>
              <div className="flex items-center gap-2 mt-1">
                {maintenance ? (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"
                      style={{ animation: 'statusPulse 1.5s ease-in-out infinite' }}
                    />
                    <span className="text-xs text-[#92400E] font-medium">Maintenance mode is active</span>
                  </>
                ) : (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#25D366]"
                      style={{ animation: 'statusPulse 1.5s ease-in-out infinite' }}
                    />
                    <span className="text-xs text-[#166534]">Live — site is online</span>
                  </>
                )}
              </div>
            </div>

            {/* Toggle switch */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleToggle}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  maintenance ? 'bg-[#F59E0B]' : 'bg-[#E5E5E5]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow transition-transform duration-300 ${
                    maintenance ? 'translate-x-8' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className={`text-[10px] ${maintenance ? 'text-[#92400E]' : 'text-[#A3A3A3]'}`}>
                {maintenance ? 'Click to disable' : 'Click to enable'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Impact Warning ── */}
        {maintenance && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 mt-4 flex gap-3 items-start" style={{ animation: 'slidein 0.3s ease-out' }}>
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#92400E]">Maintenance mode is ON</p>
              <div className="text-xs text-[#92400E] mt-1 space-y-1">
                <p>● All shop owner dashboards are inaccessible</p>
                <p>● All customer store pages show the maintenance screen</p>
                <p>● WhatsApp links to products show maintenance page</p>
                <p>● Only this admin panel remains accessible</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Custom Message ── */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] mt-4">
          <p className="text-sm font-semibold mb-1">Maintenance Message</p>
          <p className="text-xs text-[#737373] mb-3">This message is shown to visitors on the maintenance page.</p>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSaveMessage}
              disabled={saving}
              className="bg-[#0A0A0A] text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Message'}
            </button>
          </div>
        </div>

        {/* ── Mini Preview ── */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] mt-4">
          <p className="text-sm font-semibold mb-3">Preview</p>
          <div className="bg-[#0A0A0A] rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div
                className="w-8 h-8 bg-[#0A0A0A] border border-[#25D366] rounded-lg flex items-center justify-center"
                style={{ animation: 'mPulse 2.5s ease-in-out infinite' }}
              >
                <Logo size={16} theme="light" />
              </div>
              <div
                className="absolute w-1.5 h-1.5 rounded-full bg-[#25D366]"
                style={{ animation: 'orbit 3s linear infinite', transformOrigin: 'center' }}
              />
            </div>
            <p className="text-sm font-bold text-white mt-2">We'll be back soon</p>
            <p className="text-[10px] mt-1 max-w-[200px] line-clamp-2" style={{ color: '#FF6B6B' }}>{message}</p>
            <div className="w-32 h-1 bg-[#1a1a1a] rounded-full overflow-hidden mt-3">
              <div className="h-full bg-[#25D366] rounded-full" style={{ animation: 'barfill 3s ease-in-out infinite' }} />
            </div>
          </div>
          <a
            href="/maintenance-preview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#737373] underline mt-3 inline-block"
          >
            View full page →
          </a>
        </div>
      </div>
    </div>
  )
}
