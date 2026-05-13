import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle, Sun, Moon } from 'lucide-react'

const WA_URL =
  'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Why Choose Us', to: '/why-us' },
  { label: 'Contact', to: '/contact' },
  { label: 'Login', to: '/login' },
]

export default function PublicNavbar({ transparent = false }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isDark = false

  // Clean light theme colours
  const textColor    = transparent ? 'text-[#1E293B]' : 'text-[#1E293B]'
  const mutedColor   = transparent
    ? 'text-[#64748B] hover:text-[#2563EB]'
    : 'text-[#64748B] hover:text-[#2563EB]'
  const activeColor  = 'text-[#2563EB]'
  const headerBg     = transparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-[#E2E8F0]'
  const drawerBg     = 'bg-white border-[#E2E8F0]'
  const drawerLink   = 'text-[#64748B] border-[#F1F5F9]'
  const drawerActive = 'text-[#2563EB]'

  return (
    <header className={`${transparent ? 'absolute' : 'sticky'} top-0 w-full z-40 ${headerBg} ${!transparent ? 'border-b' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          id="navbar-logo"
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-zd-nobg.png"
            alt="ZeleraDeck"
            className="w-10 h-10 object-contain transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(201,168,76,0.7)]"
          />
          <span
            className={`text-sm font-bold tracking-widest ${textColor}`}
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.12em' }}>
            ZeleraDeck
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                pathname === link.to ? activeColor : mutedColor
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: theme toggle + CTA + hamburger */}
        <div className="flex items-center gap-2">

          {/* WhatsApp CTA */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="navbar-wa-cta"
            className="hidden sm:flex items-center gap-1.5 bg-[#C9A84C] text-[#0F0F0F] text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#E2C06A] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#C9A84C]/30"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Get Started
          </a>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-1.5 ${transparent ? 'text-white' : (isDark ? 'text-white' : 'text-[#0A0A0A]')} cursor-pointer`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className={`md:hidden ${drawerBg} border-t px-4 pt-2 pb-4`}
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b last:border-0 ${
                pathname === link.to ? drawerActive : drawerLink
              }`}
            >
              {link.label}
            </Link>
          ))}


          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold py-3 rounded-xl mt-3"
          >
            <MessageCircle className="w-4 h-4" />
            Get Started on WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
