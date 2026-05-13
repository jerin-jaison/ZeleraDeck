import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  // Gold/charcoal brand colours
  const textColor    = transparent ? 'text-[#F5F0E8]' : 'text-[#F5F0E8]'
  const mutedColor   = transparent
    ? 'text-[#B0A898] hover:text-[#C9A84C]'
    : 'text-[#B0A898] hover:text-[#C9A84C]'
  const activeColor  = 'text-[#C9A84C]'
  const headerBg     = transparent
    ? 'bg-transparent border-transparent'
    : 'bg-[#0F0F0F] border-[rgba(201,168,76,0.15)]'
  const drawerBg     = 'bg-[#0F0F0F] border-[rgba(201,168,76,0.15)]'
  const drawerLink   = 'text-[#B0A898] border-[rgba(201,168,76,0.1)]'
  const drawerActive = 'text-[#C9A84C]'

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
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to lighter mode' : 'Switch to deeper dark'}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer
              transition-all duration-200 hover:scale-110
              text-[#C9A84C]/60 hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)]"
          >
            {isDark
              ? <Sun  className="w-4.5 h-4.5" strokeWidth={1.75} />
              : <Moon className="w-4.5 h-4.5" strokeWidth={1.75} />
            }
          </button>

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

          {/* Mobile theme toggle row */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 py-3 text-sm font-medium w-full border-b cursor-pointer transition-colors ${drawerLink}`}
          >
            {isDark
              ? <><Sun  className="w-4 h-4" /> Switch to Light Mode</>
              : <><Moon className="w-4 h-4" /> Switch to Dark Mode</>
            }
          </button>

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
