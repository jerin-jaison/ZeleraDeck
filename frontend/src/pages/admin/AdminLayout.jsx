import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, PlusCircle, LogOut, Menu, X, Shield, AlertTriangle } from 'lucide-react'
import Logo from '../../components/Logo'
import axios from 'axios'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zeleraadmin2025'

const NAV_ITEMS = [
  { to: '/admin-panel/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin-panel/shops', icon: Store, label: 'Shops' },
  { to: '/admin-panel/create-shop', icon: PlusCircle, label: 'Create Shop' },
  { to: '/admin-panel/maintenance', icon: AlertTriangle, label: 'Maintenance', hasBadge: true },
]

function SidebarContent({ onClose, maintenanceOn }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed')
    navigate('/admin-panel')
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
        <div className="flex items-center">
          <Logo variant="full" size={28} />
          <span className="text-[10px] text-[#737373] bg-[#F0F0F0] px-2 py-0.5 rounded-full ml-2">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5 text-[#737373]" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, hasBadge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              isActive(to) ? 'bg-[#0A0A0A] text-white' : 'text-[#737373] hover:bg-[#F8F8F8] hover:text-[#0A0A0A]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive(to) ? 'text-white' : 'text-[#A3A3A3]'}`} />
            <span className="text-sm font-medium">{label}</span>
            {hasBadge && maintenanceOn && (
              <span
                className="ml-auto w-2 h-2 rounded-full bg-[#F59E0B]"
                style={{ animation: 'statusPulse 1.5s ease-in-out infinite' }}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#F0F0F0]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <span className="text-sm font-medium">Admin</span>
          <Shield className="w-4 h-4 text-[#A3A3A3] ml-auto" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-[#FEE2E2] text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === 'true')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [maintenanceOn, setMaintenanceOn] = useState(false)
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location])

  // Check maintenance status for sidebar badge
  useEffect(() => {
    let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
    if (!base.endsWith('/api/') && !base.endsWith('/api')) base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
    if (!base.endsWith('/')) base += '/'
    axios.get(`${base}status/`)
      .then(r => setMaintenanceOn(r.data.maintenance))
      .catch(() => {})
  }, [location.pathname])

  const handleAuth = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', 'true')
      setAuthed(true)
    } else {
      setPwError('Incorrect password')
    }
  }

  // Password gate
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Logo size={32} />
            <span className="font-bold text-[#0A0A0A]">Admin Access</span>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Admin password"
            className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] mb-3"
          />
          {pwError && <p className="text-xs text-[#EF4444] mb-3">{pwError}</p>}
          <button
            onClick={handleAuth}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#F0F0F0] flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent maintenanceOn={maintenanceOn} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#F0F0F0] h-14 px-4 flex items-center">
        <button onClick={() => setDrawerOpen(true)}>
          <Menu className="w-5 h-5 text-[#0A0A0A]" />
        </button>
        <p className="text-sm font-bold text-[#0A0A0A] flex-1 text-center">ZeleraDeck Admin</p>
        <div className="w-5" />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div
            className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg"
            style={{ animation: 'fadeIn 0.15s ease-out' }}
          >
            <SidebarContent onClose={() => setDrawerOpen(false)} maintenanceOn={maintenanceOn} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:p-6 p-4 pt-18 lg:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
