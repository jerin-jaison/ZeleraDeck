import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle, BarChart2, Package, Zap, Users, Globe, CheckCircle,
  ArrowRight, Star, ShieldCheck, TrendingUp, Smartphone
} from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'
const WA_MONTHLY = `${WA}&plan=Monthly`
const WA_QUARTERLY = `${WA}&plan=Quarterly`

const FEATURES = [
  {
    icon: Zap,
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.12)',
    title: 'Easy Onboarding',
    desc: 'Set up your shop in minutes. No coding, no complexity — just your products, live.',
  },
  {
    icon: MessageCircle,
    color: '#25D366',
    bg: 'rgba(37,211,102,0.12)',
    title: 'WhatsApp Integrated',
    desc: 'Sell directly on WhatsApp. Orders flow in automatically from your catalogue link.',
  },
  {
    icon: BarChart2,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Real-time Analytics',
    desc: 'See your sales, inventory, and customers in one beautifully simple dashboard.',
  },
  {
    icon: Globe,
    color: '#EA580C',
    bg: 'rgba(234,88,12,0.12)',
    title: 'Multi-channel Reach',
    desc: 'Reach customers on Instagram, Facebook, and the Web — all from one place.',
  },
  {
    icon: Package,
    color: '#059669',
    bg: 'rgba(5,150,105,0.12)',
    title: 'Inventory Magic',
    desc: 'Smart stock management. Never oversell again — update in seconds from your phone.',
  },
  {
    icon: Users,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Growing Community',
    desc: 'Join 500+ successful shops across Kerala already growing with ZeleraDeck.',
  },
]

const MONTHLY_FEATURES = [
  'WhatsApp Catalogue',
  'Order Management',
  'Basic Analytics',
  '1 user seat',
  'Email support',
  'QR Code for shop',
]
const QUARTERLY_FEATURES = [
  'WhatsApp Catalogue',
  'Order Management',
  'Advanced Analytics',
  '3 user seats',
  'Priority support',
  'QR Code for shop',
  'Custom branding',
]

const STATS = [
  { value: '500+', label: 'Active Shops', icon: ShieldCheck },
  { value: '₹12L+', label: 'Orders Processed', icon: TrendingUp },
  { value: '4.9★', label: 'Shop Rating', icon: Star },
  { value: '3 min', label: 'Avg. Setup Time', icon: Smartphone },
]

export default function HomePage() {
  const [billing, setBilling] = useState('quarterly')

  return (
    <>
      <SEOHead
        title="ZeleraDeck — Where We Grow Together"
        description="ZeleraDeck gives Kerala shop owners a beautiful digital catalogue with a shareable link and WhatsApp ordering. No website needed. Set up in minutes."
        url="https://zeleradeck.com"
        keywords="digital catalogue Kerala, WhatsApp catalogue shop, ZeleraDeck, shop catalogue app India, Kerala SMB platform"
      />

      {/* ── Google Fonts ── */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="zdeck-page bg-[#F8FAFC] min-h-screen" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <PublicNavbar transparent={true} />

        <main>
          {/* ══════════════════════════════════════════════
              HERO — Dark navy, animated orb, editorial type
          ══════════════════════════════════════════════ */}
          <section className="zdeck-hero relative overflow-hidden min-h-screen flex flex-col justify-center bg-[#0F172A]">
            {/* Animated orb background */}
            <div className="zdeck-orb zdeck-orb-1" aria-hidden="true" />
            <div className="zdeck-orb zdeck-orb-2" aria-hidden="true" />
            <div className="zdeck-orb zdeck-orb-3" aria-hidden="true" />

            {/* Subtle grid overlay */}
            <div className="zdeck-grid-overlay" aria-hidden="true" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 mb-8" style={{ backdropFilter: 'blur(12px)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] zdeck-pulse-dot" />
                <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">Shop Management Platform for Kerala</span>
              </div>

              {/* Main headline */}
              <h1 className="zdeck-hero-headline text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Your Shop.{' '}
                <span className="zdeck-gradient-text">Online.</span>
                <br />
                In Minutes.
              </h1>

              {/* Cyan accent line */}
              <div className="zdeck-accent-line mx-auto mt-6" aria-hidden="true" />

              <p className="mt-8 text-[#94A3B8] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                ZeleraDeck gives Kerala shop owners a beautiful digital storefront with WhatsApp ordering — no website, no app, no hassle.
                <span className="text-white/60"> Where we grow together.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-wa-cta"
                  className="zdeck-btn-primary"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  Get Started on WhatsApp
                </a>
                <Link
                  to="/why-us"
                  id="hero-learn-more"
                  className="zdeck-btn-ghost"
                >
                  See How It Works
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap items-center justify-center gap-5 mt-12">
                {['Free setup assistance', 'No coding needed', 'WhatsApp support'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-white/50 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8FAFC] to-transparent" aria-hidden="true" />
          </section>

          {/* ══════════════════════════════════════════════
              STATS BAR
          ══════════════════════════════════════════════ */}
          <section className="zdeck-stats-bar bg-white border-y border-[#E2E8F0] px-4 py-6" aria-label="Key statistics">
            <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#2563EB]" strokeWidth={1.75} />
                  </div>
                  <p className="zdeck-stat-value">{value}</p>
                  <p className="zdeck-stat-label">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FEATURES — 3-col grid, glow-hover cards
          ══════════════════════════════════════════════ */}
          <section aria-labelledby="features-heading" className="px-4 py-20 max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="zdeck-section-badge">Platform Features</span>
              <h2 id="features-heading" className="zdeck-section-title mt-3">
                Everything your shop needs
              </h2>
              <p className="zdeck-section-sub mt-4">
                Simple, powerful tools built specifically for local businesses in Kerala.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <article
                    key={f.title}
                    className="zdeck-feature-card group"
                    style={{ '--glow-color': f.color + '4D' }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: f.bg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: f.color }} strokeWidth={1.75} />
                    </div>
                    <h3 className="zdeck-card-title">{f.title}</h3>
                    <p className="zdeck-card-desc mt-2">{f.desc}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              HOW IT WORKS — 3-step timeline
          ══════════════════════════════════════════════ */}
          <section className="bg-[#0F172A] px-4 py-20" aria-labelledby="how-heading">
            <div className="max-w-4xl mx-auto text-center mb-14">
              <span className="zdeck-section-badge-dark">Getting Started</span>
              <h2 id="how-heading" className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                From chaos to clarity<br />
                <span className="zdeck-gradient-text">in three steps</span>
              </h2>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'WhatsApp Us', desc: 'Message our team. We set everything up for you — no forms, no waiting.' },
                { step: '02', title: 'Add Your Products', desc: 'Upload photos and prices. Your beautiful digital catalogue goes live instantly.' },
                { step: '03', title: 'Share & Sell', desc: 'Share your unique link on WhatsApp, Instagram, or print a QR code for your store.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="zdeck-step-card">
                  <span className="zdeck-step-number">{step}</span>
                  <h3 className="text-white font-bold text-xl mt-4 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              PRICING — Two tiers with toggle
          ══════════════════════════════════════════════ */}
          <section aria-labelledby="pricing-heading" className="px-4 py-20 bg-[#F8FAFC]">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10">
                <span className="zdeck-section-badge">Pricing</span>
                <h2 id="pricing-heading" className="zdeck-section-title mt-3">
                  Simple, transparent pricing
                </h2>
                <p className="zdeck-section-sub mt-4">
                  No hidden fees. No online payment needed. Just WhatsApp us.
                </p>
              </div>

              {/* Founding member banner 
              <div className="zdeck-founding-banner mb-8">
                <Star className="w-5 h-5 text-[#EA580C] flex-shrink-0 fill-[#EA580C]" />
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Founding Member Offer — First 15 shops only</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Locked in for life at <strong className="text-[#EA580C]">₹499/month</strong>. WhatsApp us to claim your spot before it's gone.</p>
                </div>
              </div>
              */}

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3 mb-10">
                <button
                  id="billing-monthly"
                  onClick={() => setBilling('monthly')}
                  className={`zdeck-toggle-btn ${billing === 'monthly' ? 'zdeck-toggle-active' : 'zdeck-toggle-inactive'}`}
                >
                  Monthly
                </button>
                <button
                  id="billing-quarterly"
                  onClick={() => setBilling('quarterly')}
                  className={`zdeck-toggle-btn ${billing === 'quarterly' ? 'zdeck-toggle-active' : 'zdeck-toggle-inactive'}`}
                >
                  Quarterly
                  <span className="zdeck-save-badge">Save ₹600</span>
                </button>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Monthly */}
                <article className={`zdeck-pricing-card ${billing === 'monthly' ? 'zdeck-pricing-selected' : ''}`} id="plan-monthly">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="zdeck-pricing-plan-name">Monthly</h3>
                      <p className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Open Sans', sans-serif" }}>Flexible, cancel anytime</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="zdeck-pricing-price">₹699</span>
                    <span className="text-sm text-[#64748B]">/month</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mb-6" style={{ fontFamily: "'Open Sans', sans-serif" }}>₹23/day — less than a cup of chai</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {MONTHLY_FEATURES.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-[#475569]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        <CheckCircle className="w-4 h-4 text-[#059669] flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={WA_MONTHLY}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="pricing-cta-monthly"
                    className="zdeck-pricing-btn-secondary"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Get Monthly Plan
                  </a>
                </article>

                {/* Quarterly — Highlighted */}
                <article className="zdeck-pricing-card zdeck-pricing-highlight" id="plan-quarterly">
                  {/* Best Value badge */}
                  <div className="zdeck-best-value-badge">Best Value</div>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="zdeck-pricing-plan-name text-white">Quarterly</h3>
                      <p className="text-xs text-white/60 mt-0.5" style={{ fontFamily: "'Open Sans', sans-serif" }}>3-month plan, billed once</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="zdeck-pricing-price text-white">₹1,499</span>
                    <span className="text-sm text-white/60">/ 3 months</span>
                  </div>
                  <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "'Open Sans', sans-serif" }}>₹16/day — <span className="text-[#25D366] font-semibold">Save ₹600</span> vs monthly</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {QUARTERLY_FEATURES.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-white/80" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={WA_QUARTERLY}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="pricing-cta-quarterly"
                    className="zdeck-pricing-btn-primary"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Get Quarterly Plan
                  </a>
                  <a
                    href={WA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-white/40 hover:text-white/60 mt-3 transition-colors"
                  >
                    Talk to sales first
                  </a>
                </article>
              </div>

              <p className="text-center text-xs text-[#94A3B8] mt-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                No online payment needed. Just WhatsApp or call us — we set everything up for you.
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              BOTTOM CTA — Full-width dark gradient block
          ══════════════════════════════════════════════ */}
          <section className="zdeck-cta-section" aria-labelledby="cta-heading">
            <div className="zdeck-cta-orb" aria-hidden="true" />
            <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
              <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Ready to Transform<br />
                <span className="zdeck-gradient-text">Your Shop?</span>
              </h2>
              <p className="text-[#94A3B8] text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                From chaos to clarity. Join 500+ shops already growing with ZeleraDeck.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="bottom-wa-cta"
                  className="zdeck-btn-primary"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  Get Started on WhatsApp
                </a>
                <Link
                  to="/contact"
                  id="bottom-contact-cta"
                  className="zdeck-btn-ghost"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer className="bg-[#0F172A] border-t border-white/8 px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <img src="/logo-zd-nobg.png" alt="ZeleraDeck" className="w-10 h-10 object-contain" />
                <div>
                  <span className="text-sm font-bold text-white block" style={{ fontFamily: "'Poppins', sans-serif" }}>ZeleraDeck</span>
                  <span className="text-xs text-[#475569]">Where we grow together</span>
                </div>
              </div>
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
                {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Contact', '/contact']].map(([l, t]) => (
                  <Link key={t} to={t} className="text-xs text-[#475569] hover:text-white transition-colors">
                    {l}
                  </Link>
                ))}
              </nav>
              <div className="text-right">
                <p className="text-xs text-[#334155]">© {new Date().getFullYear()} ZeleraDeck</p>
                <p className="text-xs text-[#334155] mt-0.5">teamzelera@gmail.com</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
