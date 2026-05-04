import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle } from 'lucide-react'

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

  return (
    <header className={`${transparent ? 'absolute' : 'sticky'} top-0 w-full z-40 ${transparent ? 'bg-transparent border-transparent' : 'bg-white border-b border-[#F0F0F0]'}`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-new.png"
            alt="ZeleraDeck"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className={`text-sm font-bold tracking-tight ${transparent ? 'text-white' : 'text-[#0A0A0A]'}`}>
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
                pathname === link.to
                  ? (transparent ? 'text-white' : 'text-[#0A0A0A]')
                  : (transparent ? 'text-white/70 hover:text-white' : 'text-[#737373] hover:text-[#0A0A0A]')
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="navbar-wa-cta"
            className="hidden sm:flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#1ebe5d] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Get Started
          </a>
          <button
            className={`md:hidden p-1.5 ${transparent ? 'text-white' : 'text-[#0A0A0A]'}`}
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
          className="md:hidden bg-white border-t border-[#F0F0F0] px-4 pt-2 pb-4"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-[#F8F8F8] last:border-0 ${
                pathname === link.to ? 'text-[#0A0A0A]' : 'text-[#737373]'
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
