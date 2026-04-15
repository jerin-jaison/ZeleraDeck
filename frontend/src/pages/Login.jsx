import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import api from '../api/axios'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import SEOHead from '../components/SEOHead'

// ── Structured Data schemas for the homepage ─────────────────────────────────
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ZeleraDeck',
  url: 'https://zeleradeck.com',
  description: 'Digital product catalogue SaaS for small shop owners in Kerala, India.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '799',
    highPrice: '2499',
    priceCurrency: 'INR',
  },
  areaServed: {
    '@type': 'State',
    name: 'Kerala, India',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ZeleraDeck',
  url: 'https://zeleradeck.com',
  logo: 'https://zeleradeck.com/logo2.png',
  image: 'https://zeleradeck.com/logo2.png',
  description:
    'ZeleraDeck is a mobile-first digital product catalogue SaaS for small shop owners in Kerala, India.',
  telephone: '+917012783442',
  email: 'teamzelera@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Kerala',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'State',
    name: 'Kerala',
  },
  priceRange: '₹799 - ₹2499/month',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ZeleraDeck?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ZeleraDeck is a digital product catalogue SaaS platform designed for small shop owners in Kerala, India. It lets you create a beautiful online catalogue, share it via a single link or QR code, and let customers order directly on WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does ZeleraDeck cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ZeleraDeck offers three pricing plans: Starter at ₹799/month, Growth at ₹1499/month, and Premium at ₹2499/month. All plans include a shareable catalogue link, QR code, and WhatsApp ordering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a website to use ZeleraDeck?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No! ZeleraDeck gives you a ready-made digital catalogue with a shareable link. No website, no coding required. Just sign up, add your products, and share your catalogue link anywhere.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use ZeleraDeck on my phone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, ZeleraDeck is fully mobile-first. You can manage your products, view your catalogue, and share it — all from your smartphone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is ZeleraDeck available for shops in Kerala?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, ZeleraDeck is built specifically for small shop owners in Kerala, India. Our support team communicates in both English and Malayalam via WhatsApp.',
      },
    },
  ],
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const showToast = useToast()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (auth.hydrated && auth.isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.hydrated, auth.isAuthenticated])

  // Process reason parameters via Toast instead of inline banners where required
  useEffect(() => {
    if (reason === 'expired') {
      showToast('Your subscription has expired. Contact ZeleraDeck to renew.', 'error')
      // Remove query param to clean the URL
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    } else if (reason === 'deactivated') {
      showToast('Your store has been deactivated. Contact ZeleraDeck support.', 'error')
      // Remove query param to clean the URL
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    }
  }, [reason, searchParams, navigate, showToast])

  if (!auth.hydrated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('auth/login/', { phone, password })
      auth.login(data.access, data.refresh, data.shop_name, data.slug)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      showToast(err?.response?.data?.error || 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Login — Manage Your Digital Shop Catalogue"
        description="Sign in to your ZeleraDeck account and manage your digital product catalogue for your local shop in Kerala. Where Growth Begins."
        url="https://zeleradeck.com/login"
        keywords="zeleradeck login, digital catalogue login, shop catalogue Kerala, online shop management Kerala"
        schema={[softwareAppSchema, localBusinessSchema, faqSchema]}
        noindex={false}
      />
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Brand top */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-16 pb-10">
        <img src="/logo-new.png" alt="ZeleraDeck" className="w-16 h-16 rounded-2xl object-cover" />
        <h1 className="text-2xl font-bold text-white mt-4">ZeleraDeck</h1>
        <p className="text-xs tracking-[0.2em] text-white/60 mt-2 font-semibold">WHERE GROWTH BEGINS</p>
      </div>

      {/* White bottom sheet */}
      <div className="flex-1 bg-white rounded-t-3xl p-6 pt-8" style={{ animation: 'slideUp 0.25s ease-out' }}>
        <h2 className="text-xl font-bold text-[#0A0A0A]">Welcome back</h2>
        <p className="text-sm text-[#737373] mt-1 mb-6">Sign in to manage your store</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={loading}
              required
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#737373]">Password</label>
              <a href="/contact" className="text-xs text-[#737373] underline">Forgot?</a>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 pr-12 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              >
                {showPw ? <EyeOff className="w-4 h-4 text-[#A3A3A3]" /> : <Eye className="w-4 h-4 text-[#A3A3A3]" />}
              </button>
            </div>
          </div>



          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white rounded-xl py-4 font-semibold text-sm hover:bg-[#2A2A2A] active:scale-[0.98] transition-all disabled:opacity-70 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-xs text-[#A3A3A3] text-center mt-6">
          Having trouble?{' '}
          <a href="/contact" className="underline text-[#737373]">Contact support</a>
        </p>
      </div>
    </div>
    </>
  )
}
