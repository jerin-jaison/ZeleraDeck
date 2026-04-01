import { useQuery } from '@tanstack/react-query'
import { adminApi } from './AdminDashboard'

export default function AdminSettings() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.get('admin/stats/').then((r) => r.data),
  })

  return (
    <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="mb-6">
        <p className="text-xs text-[#737373]">Admin / Settings</p>
        <h1 className="text-xl font-bold text-[#0A0A0A]">Settings</h1>
        <p className="text-xs text-[#737373]">Platform configuration</p>
      </div>

      {/* Admin Password Info */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] max-w-lg mb-4">
        <div className="bg-[#FEF3C7] rounded-xl p-3 text-xs text-[#92400E] mb-4">
          ⚠ Admin authentication is session-based for MVP.<br />
          Upgrade to server-side auth before going to production with real data.
        </div>
        <p className="text-sm font-semibold mb-3">Admin Access</p>
        <p className="text-xs text-[#737373]">
          Admin password is set via <code className="bg-[#F0F0F0] px-1.5 py-0.5 rounded text-[10px]">VITE_ADMIN_PASSWORD</code> in the <code className="bg-[#F0F0F0] px-1.5 py-0.5 rounded text-[10px]">.env</code> file. Session expires when the browser tab is closed.
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] max-w-lg">
        <p className="text-sm font-semibold mb-3">Platform Info</p>
        <div className="space-y-0">
          {[
            { l: 'Frontend URL', v: 'www.zeleradeck.com' },
            { l: 'Backend URL', v: 'zeleradeck.onrender.com' },
            { l: 'Version', v: '1.0.0 — Phase 3' },
            { l: 'Total Shops', v: stats?.total_shops ?? '—' },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between py-2.5 border-b border-[#F8F8F8] last:border-0">
              <span className="text-xs text-[#737373]">{l}</span>
              <span className="text-xs font-medium text-[#0A0A0A] text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
