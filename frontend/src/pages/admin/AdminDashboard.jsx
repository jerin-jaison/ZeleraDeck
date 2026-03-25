import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Store, PlusCircle, AlertCircle, Clock } from 'lucide-react'
import axios from 'axios'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'
let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
if (!base.endsWith('/api/') && !base.endsWith('/api')) base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
if (!base.endsWith('/')) base += '/'
const API = base
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

export { adminApi, API, ADMIN_PASSWORD, timeAgo }

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.get('admin/stats/').then((r) => r.data),
  })

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['admin-shops-recent'],
    queryFn: () => adminApi.get('admin/shops/?page=1&page_size=5').then((r) => r.data),
  })

  const recentShops = recentData?.shops ?? (Array.isArray(recentData) ? recentData.slice(0, 5) : [])

  const statCards = [
    { label: 'Total Shops', value: stats?.total_shops ?? '—', icon: Store, color: '', sub: 'All registered shops' },
    { label: 'Active', value: stats?.active_shops ?? '—', icon: Store, color: 'text-[#166534]', badge: '● Live', badgeCls: 'bg-[#DCFCE7] text-[#166534]' },
    { label: 'Inactive', value: stats?.inactive_shops ?? '—', icon: Store, color: 'text-[#991B1B]', badge: '● Offline', badgeCls: 'bg-[#FEE2E2] text-[#991B1B]' },
    { label: 'Expiring Soon', value: stats?.shops_expiring_soon ?? 0, icon: Clock, color: 'text-[#92400E]', badge: stats?.shops_expiring_soon > 0 ? '⚠ Review needed' : '✓ None', badgeCls: stats?.shops_expiring_soon > 0 ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#F0F0F0] text-[#737373]' },
  ]

  const quickActions = [
    { label: 'Create New Shop', sub: 'Add a shop account', icon: PlusCircle, to: '/admin-panel/create-shop' },
    { label: 'View All Shops', sub: 'Manage accounts', icon: Store, to: '/admin-panel/shops' },
    { label: 'Inactive Shops', sub: `${stats?.inactive_shops ?? 0} offline`, icon: AlertCircle, to: '/admin-panel/shops?filter=inactive', accent: stats?.inactive_shops > 0 },
    { label: 'Expiring Soon', sub: `${stats?.shops_expiring_soon ?? 0} shops`, icon: Clock, to: '/admin-panel/shops?filter=expiring', accent: stats?.shops_expiring_soon > 0 },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="mb-6">
        <p className="text-xs text-[#737373]">Admin / Dashboard</p>
        <h1 className="text-xl font-bold text-[#0A0A0A]">Dashboard</h1>
        <p className="text-xs text-[#737373]">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)
          : statCards.map(({ label, value, icon: Icon, color, badge, badgeCls, sub }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-[#F0F0F0]">
                <div className="flex justify-between items-start">
                  <p className="text-xs text-[#737373]">{label}</p>
                  <Icon className="w-4 h-4 text-[#A3A3A3]" />
                </div>
                <p className={`text-3xl font-black mt-3 ${color || 'text-[#0A0A0A]'}`}>{value}</p>
                {badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block ${badgeCls}`}>{badge}</span>
                ) : (
                  <p className="text-xs text-[#737373] mt-1">{sub}</p>
                )}
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, sub, icon: Icon, to, accent }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="bg-white rounded-2xl p-4 border border-[#F0F0F0] flex items-center gap-3 text-left hover:bg-[#F8F8F8] transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? 'bg-[#FEE2E2]' : 'bg-[#F0F0F0]'}`}>
                <Icon className={`w-4 h-4 ${accent ? 'text-[#EF4444]' : 'text-[#0A0A0A]'}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[#737373]">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Shops */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold">Recent Shops</p>
          <button onClick={() => navigate('/admin-panel/shops')} className="text-xs text-[#737373] underline">
            View all →
          </button>
        </div>
        {recentLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl mb-2" />)
        ) : recentShops.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-[#F0F0F0] text-center">
            <p className="text-xs text-[#737373]">No shops created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentShops.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/admin-panel/shops/${s.id}`)}
                className="w-full bg-white rounded-xl p-3 border border-[#F0F0F0] flex items-center gap-3 hover:bg-[#F8F8F8] transition-colors"
              >
                {s.logo_url ? (
                  <img src={s.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#737373]">{s.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-[#737373]">{s.phone}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <p className="text-[10px] text-[#A3A3A3] mt-0.5">{timeAgo(s.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
