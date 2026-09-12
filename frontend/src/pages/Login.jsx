import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Smartphone, Lock, ShieldCheck, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react'
import gsap from 'gsap'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import SEOHead from '../components/SEOHead'

const WHATSAPP_DEMO_URL =
  'https://wa.me/917012783442?text=Hi%2C+I+want+to+get+a+test+demo+of+Zelera+Deck+for+my+business'

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
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const containerRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const formBoxRef = useRef(null)
  const eyeIconRef = useRef(null)
  const submitBtnRef = useRef(null)

  // 1. GSAP Load-In & Mouse Tilt Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.login-anim-item', { opacity: 1, y: 0, scale: 1 })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Left panel reveal (desktop)
      if (leftPanelRef.current) {
        tl.from(leftPanelRef.current.querySelectorAll('.login-left-anim'), {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.12,
        })
      }

      // Main form card reveal
      if (rightPanelRef.current) {
        tl.from(
          rightPanelRef.current.querySelectorAll('.login-right-anim'),
          {
            opacity: 0,
            y: 25,
            scale: 0.98,
            duration: 0.85,
            stagger: 0.08,
          },
          '-=0.6'
        )
      }
    }, containerRef)

    // Desktop Mouse Pointer 1–3px Tilt on Smoked Glass Box
    const handleMouseMove = (e) => {
      if (prefersReducedMotion || window.innerWidth < 1024 || !formBoxRef.current) return
      const rect = formBoxRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2)
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2)

      gsap.to(formBoxRef.current, {
        x: deltaX * 3,
        y: deltaY * 3,
        rotationY: deltaX * 1.5,
        rotationX: -deltaY * 1.5,
        duration: 0.4,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      if (!formBoxRef.current) return
      gsap.to(formBoxRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    const containerEl = containerRef.current
    if (containerEl) {
      containerEl.addEventListener('mousemove', handleMouseMove)
      containerEl.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      ctx.revert()
      if (containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove)
        containerEl.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  // 2. Eye Icon Morph Animation
  useEffect(() => {
    if (eyeIconRef.current) {
      gsap.fromTo(
        eyeIconRef.current,
        { scale: 0.7, rotate: showPw ? -30 : 30 },
        { scale: 1, rotate: 0, duration: 0.3, ease: 'back.out(1.7)' }
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

  // Handle session reason toast notifications
  useEffect(() => {
    if (reason === 'expired') {
      showToast('Your session has expired. Please sign in again.', 'error')
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    } else if (reason === 'deactivated') {
      showToast('Your store has been deactivated. Contact Zelera Deck support.', 'error')
      const params = new URLSearchParams(searchParams)
      params.delete('reason')
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      navigate(`/login${queryStr}`, { replace: true })
    }
  }, [reason, searchParams, navigate, showToast])

  if (!auth.hydrated) return null

  // 3. Form Submission & Graceful Inline Error Handling
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!phone.trim() || !password.trim()) {
      setErrorMsg('Please enter both your phone number and password.')
      setLoading(false)
      return
    }

    if (submitBtnRef.current) {
      gsap.to(submitBtnRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 })
    }

    try {
      const { data } = await api.post('auth/login/', { phone, password })
      const isProUser = Boolean(data.is_pro)
      auth.login(data.access, data.refresh, data.shop_name, data.slug, isProUser)

      setSuccessMsg('Signed in successfully! Redirecting to your Deck...')
      showToast('Signed in successfully. Welcome back to your Deck.', 'success')

      setTimeout(() => {
        if (isProUser && data.slug) {
          navigate(`/pro-admin/${data.slug}/dashboard`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }, 700)
    } catch (err) {
      // GSAP Shake effect on login card for feedback
      if (formBoxRef.current) {
        gsap.fromTo(
          formBoxRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'sine.inOut',
            onComplete: () => {
              gsap.to(formBoxRef.current, { x: 0, duration: 0.15 })
            },
          }
        )
      }

      const data = err?.response?.data
      let errText = ''

      if (data) {
        if (typeof data === 'string') {
          errText = data
        } else if (data.error) {
          errText = data.error
        } else if (data.detail) {
          errText = data.detail
        } else if (data.message) {
          errText = data.message
        } else if (data.phone && Array.isArray(data.phone)) {
          errText = data.phone[0]
        } else if (data.password && Array.isArray(data.password)) {
          errText = data.password[0]
        } else {
          const firstVal = Object.values(data)[0]
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            errText = firstVal[0]
          } else if (typeof firstVal === 'string') {
            errText = firstVal
          }
        }
      }

      if (!errText) {
        if (err?.message === 'Network Error' || !err?.response) {
          errText = 'Unable to connect to Zelera Deck servers. Please check your network connection.'
        } else {
          errText = 'Invalid phone number or password. Please verify your credentials.'
        }
      }

      setErrorMsg(errText)
      showToast(errText, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Sign In — Zelera Deck Workspace"
        description="Sign in to your Zelera Deck workspace to manage your digital storefront and customer orders."
        url="https://zeleradeck.com/login"
        keywords="Zelera Deck login, merchant login, website manager, storefront dashboard"
      />

      <div
        ref={containerRef}
        className="min-h-[100dvh] w-full bg-[#060608] font-sans selection:bg-[#b66a45] selection:text-white"
      >
        {/* =========================================================================
            MOBILE VIEW (< 1024px): Light Glassmorphic Mobile Design (Matching login.html)
           ========================================================================= */}
        <div className="block lg:hidden w-full max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 relative pb-6 sm:shadow-2xl sm:my-4 sm:rounded-3xl sm:overflow-hidden text-slate-800 border-slate-200/80 sm:border">
          {/* Header Illustration Section */}
          <header className="relative w-full bg-slate-900 overflow-hidden wave-mask shadow-md">
            {/* Top Back to Website Link */}
            <div className="absolute top-4 left-4 z-20">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-white hover:text-amber-400 transition-colors border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>

            {/* Ambient Decorative Blurs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-10 right-0 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Fluid Workspace Illustration */}
            <div className="relative w-full aspect-[4/3] max-h-72 overflow-hidden flex items-center justify-center">
              <img
                alt="Zelera Deck dynamic creative workspace illustration"
                className="w-full h-full object-cover object-center transform scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADnGANMZLuRUPAyBfarod3CtqTtBBx3zeDs7YFlKqlB-bLko5PwRLICYnLsZwyJW479Q42p6Ak4epz3y79C52SVYH0aL31-0jQFmOMw_zuoLYsYLKwKJpHq77whbAT8VouuOtREO6IbTaRlUpoiexAOmRjQlLjSZ3EBo_CdKsSkrdD_Oh3IyhfZiorIf3uw_bscctl7ALdXe2Yv8q43-OKKi2xAR_MuuF4wBlaSRkd33t19trexOb1"
              />
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>

            {/* Brand Badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 tracking-wide">Zelera Deck</span>
            </div>
          </header>

          {/* Main Auth Content */}
          <main className="flex-1 px-5 pt-5 pb-2 -mt-4 relative z-10">
            <section className="bg-white rounded-2xl shadow-card p-6 border border-slate-100">
              {/* Amber Keyhole Icon & Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-50 mb-2 border border-amber-200/60 shadow-sm">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Zelera Deck</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Sign in to manage your storefront &amp; digital channels
                </p>
              </div>

              {/* Graceful Inline Error & Success States (Mobile) */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PHONE NUMBER
                  </label>
                  <div className="input-field flex items-center rounded-xl border border-slate-200 bg-slate-50 transition overflow-hidden">
                    <div className="flex items-center pl-3.5 pr-2 py-3 border-r border-slate-200 bg-slate-100/70 text-slate-700 cursor-pointer select-none">
                      <span class="text-sm font-semibold mr-1">+91</span>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 70127 83442"
                      disabled={loading}
                      required
                      style={{ minHeight: '48px' }}
                      className="w-full bg-transparent border-0 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PASSWORD
                  </label>
                  <div className="input-field relative flex items-center rounded-xl border border-slate-200 bg-slate-50 transition overflow-hidden">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={loading}
                      required
                      style={{ minHeight: '48px' }}
                      className="w-full bg-transparent border-0 pl-3.5 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Aux Actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                    <span className="text-slate-600 font-medium">Remember me</span>
                  </label>
                  <a
                    href={WHATSAPP_DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={loading}
                    style={{ minHeight: '48px' }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] shadow-btn transition duration-150 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to My Deck</span>
                        <span className="text-amber-400 font-bold">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  or continue with
                </span>
              </div>

              {/* WhatsApp Concierge Fast Connect */}
              <a
                href={WHATSAPP_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center min-h-[48px] px-4 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50 hover:bg-emerald-100/60 text-emerald-800 text-sm font-medium transition active:scale-[0.99]"
              >
                <MessageSquare className="w-5 h-5 mr-2.5 text-emerald-600" />
                <span>WhatsApp Concierge Login</span>
              </a>
            </section>
          </main>
        </div>

        {/* =========================================================================
            LAPTOP & DESKTOP VIEW (≥ 1024px): 2-Column Obsidian Editorial Workspace
           ========================================================================= */}
        <div className="hidden lg:flex min-h-screen w-full flex-row relative text-[#F0EFEA]">
          {/* Ambient Top Right Golden/Copper Curved Arc */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0 opacity-70"
            aria-hidden="true"
          >
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M 500 0 C 300 0 100 200 100 500"
                stroke="url(#warmGlowGradReact)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                opacity="0.3"
              />
              <path
                d="M 500 0 C 350 50 150 250 150 500"
                stroke="url(#warmGlowGradReact)"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx="500" cy="0" r="300" fill="url(#radialGoldenReact)" />
              <defs>
                <linearGradient id="warmGlowGradReact" x1="500" y1="0" x2="100" y2="500" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#B66A45" stopOpacity="0.8" />
                  <stop offset="0.6" stopColor="#D48C46" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#B66A45" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="radialGoldenReact" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(500 0) rotate(135) scale(350)">
                  <stop stopColor="#B66A45" stopOpacity="0.22" />
                  <stop offset="0.6" stopColor="#8A4626" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#060608" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* LEFT PANEL: Editorial Statement (Desktop Only) */}
          <div
            ref={leftPanelRef}
            className="relative w-[50%] min-h-[100dvh] flex flex-col justify-between p-12 lg:p-16 border-r border-[#F3F0E8]/10 z-10"
          >
            <div className="login-left-anim">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#B66A45] hover:text-[#F0EFEA] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>RETURN TO LANDING PAGE</span>
              </Link>
            </div>

            <div className="my-auto max-w-lg">
              <div className="login-left-anim text-xs font-mono text-[#B66A45] tracking-widest uppercase mb-4">
                // YOUR DECK
              </div>
              <h1 className="login-left-anim text-5xl lg:text-6xl font-serif font-bold text-[#F0EFEA] leading-[1.08] tracking-tight mb-6">
                YOUR BUSINESS.<br />
                <span className="italic text-[#B66A45]">YOUR DECK.</span>
              </h1>
              <p className="login-left-anim font-serif italic text-xl text-[#A0A0A8] leading-relaxed mb-10">
                “Everything your customers see.<br />
                One place to manage it.”
              </p>
              <div className="login-left-anim flex items-center gap-3 font-mono text-xs text-[#888890] tracking-widest uppercase pt-6 border-t border-[#F3F0E8]/10">
                <span>WEBSITE</span><span className="text-[#B66A45]">•</span>
                <span>WHATSAPP</span><span className="text-[#B66A45]">•</span>
                <span>CUSTOMERS</span><span className="text-[#B66A45]">•</span>
                <span>STOREFRONT</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#F3F0E8]/10 text-xs font-mono text-[#666670] login-left-anim">
              <div>ZELERA DECK.</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B66A45]" />
                <span className="text-[#A0A0A8]">SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Dark Smoked Glass Laptop Interface */}
          <div
            ref={rightPanelRef}
            className="w-[50%] min-h-[100dvh] flex flex-col justify-between p-12 lg:p-16 relative z-20"
          >
            <div className="pt-4 space-y-5 login-right-anim">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-[#A0A0A8] hover:text-[#F0EFEA] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#A0A0A8]" />
                  <span>Back to website</span>
                </Link>
              </div>
              <div>
                <Link to="/" className="text-2xl font-bold font-brand text-[#F0EFEA] tracking-tight">
                  ZELERA DECK<span className="text-[#B66A45]">.</span>
                </Link>
              </div>
            </div>

            <div className="my-auto py-6 w-full max-w-md mx-auto">
              <div className="mb-6 login-right-anim">
                <div className="text-xs font-mono text-[#B66A45] tracking-widest uppercase mb-2">
                  // SIGN IN
                </div>
                <h2 className="text-5xl font-serif font-normal text-[#F0EFEA] tracking-tight mb-2">
                  Welcome back.
                </h2>
                <p className="text-base text-[#A0A0A8]">
                  Sign in to manage your Zelera Deck.
                </p>
              </div>

              <div
                ref={formBoxRef}
                className="bg-[#121216]/75 border border-[#F3F0E8]/10 rounded-3xl p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-md relative"
              >
                {errorMsg && (
                  <div className="mb-5 p-3.5 rounded-xl bg-[#B66A45]/15 border border-[#B66A45]/30 text-xs text-[#E68A5C] flex items-start gap-2.5 login-right-anim">
                    <ShieldCheck className="w-4 h-4 text-[#B66A45] shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-5 p-3.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-xs font-mono text-[#25D366] flex items-start gap-2.5 login-right-anim">
                    <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="login-right-anim">
                    <label className="block text-[11px] font-mono text-[#888890] uppercase tracking-wider mb-2">
                      PHONE NUMBER
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-[#777780] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your registered phone number"
                        disabled={loading}
                        required
                        style={{ minHeight: '48px' }}
                        className="w-full bg-[#0B0B0D]/90 border border-[#F3F0E8]/15 rounded-xl pl-10 pr-4 text-sm text-[#F0EFEA] placeholder:text-[#555560] focus:outline-none focus:border-[#B66A45] focus:ring-1 focus:ring-[#B66A45]/40 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="login-right-anim">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-mono text-[#888890] uppercase tracking-wider">
                        PASSWORD
                      </label>
                      <a
                        href={WHATSAPP_DEMO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#B66A45] hover:underline transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#777780] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        required
                        style={{ minHeight: '48px' }}
                        className="w-full bg-[#0B0B0D]/90 border border-[#F3F0E8]/15 rounded-xl pl-10 pr-12 text-sm text-[#F0EFEA] placeholder:text-[#555560] focus:outline-none focus:border-[#B66A45] focus:ring-1 focus:ring-[#B66A45]/40 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-[#777780] hover:text-[#F0EFEA] transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 login-right-anim">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ minHeight: '48px' }}
                      className="w-full bg-[#B66A45] hover:bg-[#a35b38] text-[#FFFFFF] font-mono text-sm tracking-wider uppercase font-bold rounded-xl transition-all duration-300 shadow-[0_4px_25px_rgba(182,106,69,0.35)] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />
                          <span>AUTHENTICATING...</span>
                        </>
                      ) : (
                        <span>ENTER MY DECK →</span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-[#F3F0E8]/10 login-right-anim">

                  <p className="text-xs text-[#A0A0A8] leading-relaxed mb-3">
                    Need a website or storefront for your business? Chat with us on WhatsApp for instant demo access.
                  </p>
                  <a
                    href={WHATSAPP_DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-mono tracking-wider uppercase rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>CHAT WITH US ON WHATSAPP →</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pb-2 text-center text-xs font-mono text-[#555560] login-right-anim">
              ZELERA DECK WORKSPACE AUTHENTICATION
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

