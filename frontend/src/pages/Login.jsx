import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Sparkles, MessageSquare, ShoppingBag, ShieldCheck } from 'lucide-react'
import gsap from 'gsap'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import SEOHead from '../components/SEOHead'

// ── Structured Data schemas ─────────────────────────────────────────────────
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

  const canvasRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const formBoxRef = useRef(null)
  const eyeIconRef = useRef(null)
  const submitBtnRef = useRef(null)

  // 1. Ambient Background Particle Drift (Light-field Canvas)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate floating ambient light orbs
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.35 ? '240, 74, 42' : '200, 200, 210', // Red accent & soft cool white
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Ambient gradient backdrop glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.4,
        height * 0.3,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.7
      )
      radialGlow.addColorStop(0, 'rgba(240, 74, 42, 0.12)')
      radialGlow.addColorStop(0.5, 'rgba(20, 20, 26, 0.4)')
      radialGlow.addColorStop(1, 'rgba(6, 6, 8, 1)')
      ctx.fillStyle = radialGlow
      ctx.fillRect(0, 0, width, height)

      // Render floating light particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.1, Math.min(0.8, p.alpha))})`
        ctx.shadowColor = `rgba(${p.color}, 0.8)`
        ctx.shadowBlur = 10
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 2. High-Precision Load-In GSAP Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Left panel elements stagger
      if (leftPanelRef.current) {
        tl.from(leftPanelRef.current.querySelectorAll('.gsap-left-item'), {
          opacity: 0,
          y: 28,
          filter: 'blur(8px)',
          duration: 0.75,
          stagger: 0.1,
        })
      }

      // Right panel & Form stagger
      if (rightPanelRef.current) {
        tl.from(
          rightPanelRef.current.querySelectorAll('.gsap-right-item'),
          {
            opacity: 0,
            x: 24,
            filter: 'blur(6px)',
            duration: 0.7,
            stagger: 0.08,
          },
          '-=0.55'
        )
      }
    })

    return () => ctx.revert()
  }, [])

  // 3. Password Show/Hide GSAP Icon Morph & Scale Transition
  useEffect(() => {
    if (eyeIconRef.current) {
      gsap.fromTo(
        eyeIconRef.current,
        { scale: 0.7, rotate: showPw ? -45 : 45 },
        { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }
      )
    }
  }, [showPw])

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.hydrated && auth.isAuthenticated) {
      if (auth.isPro && auth.shop?.slug) {
        navigate(`/pro-admin/${auth.shop.slug}/dashboard`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [auth.hydrated, auth.isAuthenticated, auth.isPro, auth.shop, navigate])

  // Process session reason toast notifications
  useEffect(() => {
    if (reason === 'expired') {
      showToast('Your session has expired. Please sign in again.', 'error')
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    } else if (reason === 'deactivated') {
      showToast('Your store has been deactivated. Contact ZeleraDeck support.', 'error')
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    }
  }, [reason, searchParams, navigate, showToast])

  if (!auth.hydrated) return null

  // 4. Form Submit Handler with Failed-Login GSAP Shake Animation
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Interactive button press feedback
    if (submitBtnRef.current) {
      gsap.to(submitBtnRef.current, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })
    }

    try {
      const { data } = await api.post('auth/login/', { phone, password })
      const isProUser = Boolean(data.is_pro)
      auth.login(data.access, data.refresh, data.shop_name, data.slug, isProUser)

      // Surface success toast notification before redirecting
      showToast('Signed in successfully. Redirecting to dashboard...', 'success')

      setTimeout(() => {
        if (isProUser && data.slug) {
          navigate(`/pro-admin/${data.slug}/dashboard`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }, 600)
    } catch (err) {
      // Trigger GSAP error shake animation on failed attempt
      if (formBoxRef.current) {
        gsap.fromTo(
          formBoxRef.current,
          { x: -14, borderColor: '#F04A2A' },
          {
            x: 14,
            duration: 0.06,
            repeat: 5,
            yoyo: true,
            ease: 'sine.inOut',
            onComplete: () => {
              gsap.to(formBoxRef.current, { x: 0, duration: 0.2 })
            },
          }
        )
      }

      // Extract exact backend error reason
      const data = err?.response?.data
      let errorMessage = ''

      if (data) {
        if (typeof data === 'string') {
          errorMessage = data
        } else if (data.error) {
          errorMessage = data.error
        } else if (data.detail) {
          errorMessage = data.detail
        } else if (data.message) {
          errorMessage = data.message
        } else if (data.phone && Array.isArray(data.phone)) {
          errorMessage = data.phone[0]
        } else if (data.password && Array.isArray(data.password)) {
          errorMessage = data.password[0]
        } else {
          const firstVal = Object.values(data)[0]
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            errorMessage = firstVal[0]
          } else if (typeof firstVal === 'string') {
            errorMessage = firstVal
          }
        }
      }

      if (!errorMessage) {
        if (err?.message === 'Network Error' || !err?.response) {
          errorMessage = 'Network error. Unable to connect to ZeleraDeck servers.'
        } else {
          errorMessage = 'Invalid phone or password'
        }
      }

      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Login — Manage Your Digital Shop Catalogue"
        description="Sign in to your ZeleraDeck account and manage your digital product catalogue for your local shop in Kerala. Where We Grow Together."
        url="https://zeleradeck.com/login"
        keywords="zeleradeck login, digital catalogue login, shop catalogue Kerala, online shop management Kerala"
        schema={[softwareAppSchema, localBusinessSchema, faqSchema]}
        noindex={false}
      />

      {/* Full-bleed, 2-panel immersive container */}
      <div className="min-h-[100dvh] w-full bg-[#060608] flex flex-col lg:flex-row relative overflow-hidden text-[#F0EFEA] font-sans">
        
        {/* =========================================================================
            LEFT PANEL: Brand Identity & Interactive Light-Field Canvas (Desktop 55-60%)
           ========================================================================= */}
        <div
          ref={leftPanelRef}
          className="relative lg:w-[55%] xl:w-[60%] min-h-[40dvh] lg:min-h-[100dvh] flex flex-col justify-between p-6 sm:p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden"
        >
          {/* Background Ambient Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* Film Grain Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            }}
          />

          {/* Top Header: Back to site button */}
          <div className="relative z-10 gsap-left-item">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-[#F04A2A] transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#F04A2A]" />
              <span>RETURN TO LANDING PAGE</span>
            </Link>
          </div>

          {/* Center Brand & Value Proposition Hero Content */}
          <div className="relative z-10 my-auto py-8 lg:py-0 max-w-xl">
            <div className="gsap-left-item">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F04A2A]/10 border border-[#F04A2A]/25 text-[#F04A2A] text-xs font-mono mb-6">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>ZELERADECK SAAS PLATFORM</span>
              </div>
            </div>

            <h1 className="gsap-left-item text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-4">
              ZELERA<span className="font-serif italic text-[#F04A2A] ml-1">DECK.</span>
            </h1>

            <p className="gsap-left-item text-sm sm:text-base font-mono text-[#A0A0A5] tracking-wider uppercase mb-8">
              // WHERE WE GROW TOGETHER
            </p>

            <p className="gsap-left-item text-base sm:text-lg text-[#CCCCCC] leading-relaxed mb-8">
              Empowering shop owners across Kerala with instant WhatsApp catalogues, real-time inventory control, and zero app installs for your customers.
            </p>

            {/* Feature Pills */}
            <div className="gsap-left-item flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs text-[#E0E0E5]">
                <MessageSquare className="w-4 h-4 text-[#F04A2A]" />
                <span>WhatsApp Instant Orders</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs text-[#E0E0E5]">
                <ShoppingBag className="w-4 h-4 text-[#F04A2A]" />
                <span>Digital Catalogue Suite</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs text-[#E0E0E5]">
                <ShieldCheck className="w-4 h-4 text-[#F04A2A]" />
                <span>Fast & Secure Merchant Portal</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 hidden sm:flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono text-[#777777] gsap-left-item">
            <div>© {new Date().getFullYear()} ZELERADECK INC.</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F04A2A] animate-ping inline-block" />
              <span className="text-[#BBBBBB]">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: Full-Screen Form Container (Desktop 40-45%)
           ========================================================================= */}
        <div
          ref={rightPanelRef}
          className="lg:w-[45%] xl:w-[40%] min-h-[60dvh] lg:min-h-[100dvh] flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 bg-[#0B0B0E] relative z-10"
        >
          {/* Subtle top edge glow */}
          <div
            className="absolute top-0 right-0 w-72 h-72 bg-[#F04A2A]/5 rounded-full filter blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Mobile Brand Bar (visible on < lg) */}
          <div className="lg:hidden flex items-center justify-between pb-6 border-b border-white/10 gsap-right-item">
            <Link to="/" className="text-xl font-bold text-white tracking-tight">
              ZELERA<span className="font-serif italic text-[#F04A2A] ml-0.5">DECK.</span>
            </Link>
            <span className="text-[10px] font-mono text-[#F04A2A] bg-[#F04A2A]/10 px-2.5 py-1 rounded-full border border-[#F04A2A]/30">
              MERCHANT LOGIN
            </span>
          </div>

          {/* Main Form Center Box */}
          <div className="my-auto py-6 sm:py-10">
            <div
              ref={formBoxRef}
              className="w-full bg-[#121216]/90 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300"
            >
              {/* Form Title */}
              <div className="mb-8 gsap-right-item">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs font-mono text-[#888890] mt-1.5 uppercase tracking-wider">
                  // SIGN IN TO MANAGE YOUR STOREFRONT
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Input */}
                <div className="gsap-right-item">
                  <label className="block text-[11px] font-mono text-[#AAAAAA] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your registered phone number"
                      disabled={loading}
                      required
                      className="w-full bg-[#060608] border border-[#25252C] rounded-xl px-4 py-3.5 text-sm text-[#F0EFEA] placeholder:text-[#55555C] focus:outline-none focus:border-[#F04A2A] focus:ring-1 focus:ring-[#F04A2A]/40 focus:shadow-[0_0_20px_rgba(240,74,42,0.2)] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Input with Dynamic Focus Glow & Morphing Toggle */}
                <div className="gsap-right-item">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-mono text-[#AAAAAA] uppercase tracking-wider">
                      Password
                    </label>
                    <a
                      href="/contact"
                      className="text-xs font-mono text-[#888890] hover:text-[#F04A2A] transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      disabled={loading}
                      required
                      className="w-full bg-[#060608] border border-[#25252C] rounded-xl px-4 py-3.5 pr-12 text-sm text-[#F0EFEA] placeholder:text-[#55555C] focus:outline-none focus:border-[#F04A2A] focus:ring-1 focus:ring-[#F04A2A]/40 focus:shadow-[0_0_20px_rgba(240,74,42,0.2)] transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#888890] hover:text-[#F04A2A] transition-colors focus:outline-none"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      <div ref={eyeIconRef}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Interactive Red Accent Submit Button */}
                <div className="gsap-right-item pt-2">
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F04A2A] hover:bg-[#FF5533] text-white font-bold rounded-xl py-4 text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(240,74,42,0.35)] hover:shadow-[0_0_35px_rgba(240,74,42,0.55)] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Sign In to Dashboard ↗</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Support Contact Footer */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center gsap-right-item">
                <p className="text-xs text-[#888890]">
                  Need assistance or haven't set up your store?{' '}
                  <a
                    href="/contact"
                    className="text-[#F04A2A] hover:underline font-semibold transition-all ml-1"
                  >
                    Contact Zelera Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer (Mobile / Desktop align) */}
          <div className="text-center lg:text-left text-xs font-mono text-[#666670] gsap-right-item">
            ZeleraDeck SaaS Merchant Authentication Portal
          </div>
        </div>

      </div>
    </>
  )
}
