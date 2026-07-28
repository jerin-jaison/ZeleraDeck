/**
 * ProAdminLayout
 * Shared sidebar + top bar for all Pro admin pages.
 *
 * Desktop (lg+):
 *   - Fixed left sidebar (w-64), always visible
 *   - Main content offset: ml-64
 *
 * Mobile (< lg):
 *   - Sidebar hidden, slides in as overlay drawer on hamburger tap
 *   - Black semi-transparent backdrop closes drawer
 *   - Hamburger button in top-left corner of header
 *   - Auto-closes on nav item click
 */
import { useState } from 'react'
import { NavLink, useNavigate, useParams, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: 'homepage', label: 'Homepage', icon: 'home' },
  { to: 'products', label: 'Products', icon: 'inventory_2' },
  { to: 'about', label: 'About Page', icon: 'info' },
  { to: 'contact', label: 'Contact Info', icon: 'contact_page' },
]

export default function ProAdminLayout() {
  const { shop, logout } = useAuth()
  const navigate = useNavigate()
  const { slug } = useParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentSlug = slug || shop?.slug || ''
  const storeUrl = `/${currentSlug}`

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-4 py-3 pl-4 border-l-4 border-black text-black font-semibold text-[12px] uppercase tracking-[0.1em] transition-all'
      : 'flex items-center gap-4 py-3 pl-5 text-[#4c4546] hover:text-black text-[12px] uppercase tracking-[0.1em] transition-all'

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 mb-6">
        <h1 className="font-serif text-xl font-normal tracking-widest text-black uppercase truncate">
          {shop?.name || 'Admin'}
        </h1>
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#7e7576] mt-1">
          Pro Management
        </p>
      </div>

      {/* View My Store */}
      {currentSlug && (
        <div className="px-4 mb-4">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg border border-[#e2e2e2] bg-[#fafafa] hover:bg-black hover:text-white text-[#111111] text-[11px] font-medium uppercase tracking-[0.1em] transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>View My Store</span>
            </div>
            <span className="material-symbols-outlined text-[14px] opacity-60 group-hover:opacity-100">open_in_new</span>
          </a>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={navLinkClass}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 pt-6 border-t border-[#e2e2e2]">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-[20px] text-[#4c4546]">account_circle</span>
          <div className="overflow-hidden">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-black leading-tight truncate">
              {shop?.name}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#7e7576]">Pro Shop Owner</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#7e7576] hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-sans flex">
      {/* ── Desktop Sidebar (lg+) ──────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-[#e2e2e2] flex-col py-8 z-50">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Backdrop ──────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Sidebar ────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-[#e2e2e2] flex flex-col py-8 z-[70] transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#4c4546] hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-16 h-14 lg:h-16 bg-[#0f0f0f] border-b border-white/10 text-white">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 text-white hover:bg-white/10 transition-colors rounded"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <span className="font-serif text-base lg:text-lg tracking-tight text-white uppercase truncate max-w-[160px] sm:max-w-none">
              {shop?.name} · Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentSlug && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 lg:gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-[10px] lg:text-[11px] font-semibold tracking-[0.1em] uppercase transition-all shadow-sm"
              >
                <span className="hidden sm:inline">View My Store</span>
                <span className="sm:hidden">Store</span>
                <span className="material-symbols-outlined text-[13px] lg:text-[14px]">open_in_new</span>
              </a>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
