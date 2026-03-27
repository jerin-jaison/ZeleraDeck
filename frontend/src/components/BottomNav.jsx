import { LayoutGrid, PlusCircle, Link2, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { icon: LayoutGrid, label: 'Products', path: '/dashboard' },
  { icon: PlusCircle, label: 'Add', path: '/dashboard/add-product' },
  { icon: Link2, label: 'Store', path: '/dashboard/store-info' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard/edit')
    return pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F0F0F0]">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {tabs.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] transition-colors duration-150 ${
              isActive(path) ? 'text-[#0A0A0A] font-medium' : 'text-[#A3A3A3]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-[#A3A3A3] transition-colors duration-150"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </div>
    </div>
  )
}
