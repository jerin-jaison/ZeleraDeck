import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, PlusCircle, Link2, LogOut } from 'lucide-react'

const tabs = [
  { label: 'Products', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Add',      icon: PlusCircle, path: '/dashboard/add-product' },
  { label: 'Store',    icon: Link2,       path: '/dashboard/store-info' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F0F0F0] h-16 pb-safe">
      <div className="max-w-md mx-auto h-full flex items-center justify-around px-2">
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] transition-colors ${
                active ? 'text-[#0A0A0A]' : 'text-[#A3A3A3]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-normal'}`}>
                {label}
              </span>
            </button>
          )
        })}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] text-[#A3A3A3] transition-colors"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[10px] font-normal">Logout</span>
        </button>
      </div>
    </nav>
  )
}
