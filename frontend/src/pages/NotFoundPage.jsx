import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Compass } from 'lucide-react'
import gsap from 'gsap'
import SEOHead from '../components/SEOHead'

const WHATSAPP_BUILD_URL =
  'https://wa.me/917012783442?text=Hi%2C+I+want+to+build+my+website+with+Zelera+Deck'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const num4A = useRef(null)
  const num0 = useRef(null)
  const num4B = useRef(null)
  const cursorRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.notfound-anim-item', { opacity: 1, y: 0 })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Technical badge & Eyebrow reveal
      tl.from('.notfound-eyebrow', {
        opacity: 0,
        y: 15,
        duration: 0.6,
      })

      // 404 Numbers character-by-character slow upward reveal
      tl.from(
        [num4A.current, num0.current, num4B.current],
        {
          opacity: 0,
          y: 45,
          scale: 0.9,
          duration: 0.9,
          stagger: 0.15,
          ease: 'back.out(1.4)',
        },
        '-=0.3'
      )

      // Supporting headlines & CTAs stagger in
      tl.from(
        '.notfound-stagger',
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
          stagger: 0.1,
        },
        '-=0.4'
      )
    }, containerRef)

    // Subtle mouse drift parallax on the numbers 4  0  4
    const handleMouseMove = (e) => {
      if (prefersReducedMotion || window.innerWidth < 768) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const deltaX = (e.clientX - centerX) / centerX
      const deltaY = (e.clientY - centerY) / centerY

      // Drift numbers subtly in opposite directions
      if (num4A.current) {
        gsap.to(num4A.current, { x: deltaX * -6, y: deltaY * -4, duration: 0.5, ease: 'power2.out' })
      }
      if (num0.current) {
        gsap.to(num0.current, { x: deltaX * 2, y: deltaY * 5, duration: 0.5, ease: 'power2.out' })
      }
      if (num4B.current) {
        gsap.to(num4B.current, { x: deltaX * 6, y: deltaY * -4, duration: 0.5, ease: 'power2.out' })
      }

      // Smooth custom cursor follower
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const containerEl = containerRef.current
    if (containerEl) {
      containerEl.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      ctx.revert()
      if (containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <SEOHead
        title="404 — You Wandered Off The Deck | Zelera Deck"
        description="The page you are looking for does not exist on Zelera Deck. Let us get you back home."
        url="https://zeleradeck.com/404"
        noindex={true}
      />

      <div
        ref={containerRef}
        className="min-h-[100dvh] w-full bg-[#060608] flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-hidden text-[#F0EFEA] font-sans selection:bg-[#C5D36B] selection:text-[#060608]"
      >
        {/* Subtle Ambient Radial Backdrop Glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_40%,rgba(182,106,69,0.08),rgba(6,6,8,1))]"
          aria-hidden="true"
        />

        {/* Floating Custom "YOU ARE HERE" Cursor Follower (Desktop only) */}
        <div
          ref={cursorRef}
          className="hidden md:flex items-center gap-2 fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 bg-[#C5D36B] text-[#060608] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(197,211,107,0.4)]"
        >
          <Compass className="w-3 h-3 animate-spin" />
          <span>YOU ARE HERE</span>
        </div>

        {/* Top Header Identity */}
        <header className="relative z-10 flex items-center justify-between notfound-eyebrow">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#F0EFEA] hover:text-[#C5D36B] transition-colors"
          >
            ZELERA DECK<span className="text-[#B66A45]">.</span>
          </Link>

          {/* Technical Coordinate Badges */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-[#888890] tracking-widest uppercase">
            <span>DECK / 04</span>
            <span className="text-[#B66A45]">•</span>
            <span>ROUTE / NOT FOUND</span>
            <span className="text-[#B66A45]">•</span>
            <span className="text-[#B66A45]">STATUS / LOST</span>
          </div>
        </header>

        {/* Center Main Hero Narrative */}
        <main className="relative z-10 my-auto py-12 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div className="notfound-eyebrow text-xs sm:text-sm font-mono text-[#C5D36B] tracking-widest uppercase mb-4">
            // LOST IN THE DECK
          </div>

          {/* Enormous Kinetic Editorial 404 Numbers */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 font-serif font-bold text-[clamp(6rem,18vw,16rem)] leading-none text-[#F0EFEA] tracking-tighter my-2 select-none">
            <span ref={num4A} className="inline-block hover:text-[#C5D36B] transition-colors">
              4
            </span>
            <span ref={num0} className="inline-block text-[#B66A45] hover:text-[#F0EFEA] transition-colors">
              0
            </span>
            <span ref={num4B} className="inline-block hover:text-[#C5D36B] transition-colors">
              4
            </span>
          </div>

          {/* Headline Statement */}
          <h1 className="notfound-stagger text-3xl sm:text-5xl font-serif text-[#F0EFEA] leading-tight tracking-tight mt-2 mb-4">
            You wandered <span className="italic text-[#C5D36B]">off the Deck.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="notfound-stagger font-serif italic text-base sm:text-xl text-[#A0A0A8] max-w-lg mx-auto leading-relaxed mb-10">
            “The page you're looking for isn't here.<br />
            Let's get you somewhere useful.”
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="notfound-stagger flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Primary Action: FIND HOME */}
            <Link
              to="/"
              style={{ minHeight: '48px' }}
              className="w-full sm:w-auto bg-[#C5D36B] hover:bg-[#d2e078] text-[#060608] font-bold rounded-xl px-8 py-3.5 text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_4px_25px_rgba(197,211,107,0.25)] hover:shadow-[0_0_35px_rgba(197,211,107,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>FIND HOME →</span>
            </Link>

            {/* Secondary Action: GO BACK */}
            <button
              type="button"
              onClick={handleGoBack}
              style={{ minHeight: '48px' }}
              className="w-full sm:w-auto bg-[#121216] hover:bg-[#1a1a20] border border-[#F3F0E8]/15 hover:border-[#F3F0E8]/30 text-[#F0EFEA] font-mono text-xs tracking-wider uppercase rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#B66A45]" />
              <span>GO BACK</span>
            </button>
          </div>

          {/* Subtle Business CTA Link */}
          <div className="notfound-stagger mt-12 pt-8 border-t border-[#F3F0E8]/10 text-xs text-[#888890]">
            Looking for your business?{' '}
            <a
              href={WHATSAPP_BUILD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B66A45] hover:text-[#C5D36B] font-mono font-semibold transition-colors ml-1 inline-flex items-center gap-1"
            >
              <span>Build your Deck →</span>
            </a>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#F3F0E8]/10 text-xs font-mono text-[#666670] gap-2 text-center sm:text-left">
          <div>ZELERA DECK.</div>
          <div className="text-[#A0A0A8]">WHERE WE GROW TOGETHER.</div>
        </footer>
      </div>
    </>
  )
}
