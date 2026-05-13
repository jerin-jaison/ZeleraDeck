import {
  CheckCircle, MessageCircle, Mail, ArrowRight,
  Link2, QrCode, Package, BarChart2, ShieldCheck, Zap,
  MapPin, Users, Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const HOW_IT_WORKS = [
  { step: '01', title: 'WhatsApp Us', desc: 'Message our team at +91 70127 83442. We reply fast and guide you through every step — in English or Malayalam.' },
  { step: '02', title: 'We Set You Up', desc: 'Our team creates your personalised ZeleraDeck shop and sends login details. Zero tech work on your end.' },
  { step: '03', title: 'Add Your Products', desc: 'Upload products with photos, prices, and categories from your phone. Takes under 30 minutes.' },
  { step: '04', title: 'Share & Sell', desc: 'Share your unique catalogue link or QR code on WhatsApp, Instagram, or print it in-store. Orders start flowing.' },
]

const FEATURES = [
  { icon: Link2,      color: '#2563EB', bg: 'rgba(37,99,235,0.1)',   title: 'One Shareable Catalogue Link',  desc: 'Every shop gets a unique URL. Share on WhatsApp, Instagram, Facebook, or print on a flyer.' },
  { icon: MessageCircle, color: '#25D366', bg: 'rgba(37,211,102,0.1)', title: 'WhatsApp-First Ordering',     desc: 'Customers browse and place orders directly on WhatsApp — no payment gateway needed.' },
  { icon: QrCode,     color: '#EA580C', bg: 'rgba(234,88,12,0.1)',   title: 'Auto QR Code',                  desc: 'Auto-generated QR for your shop. Print it in-store and let walk-ins browse digitally.' },
  { icon: Package,    color: '#059669', bg: 'rgba(5,150,105,0.1)',   title: 'Easy Product Management',       desc: 'Add products with photos, prices, and categories in minutes. Mark in/out of stock instantly.' },
  { icon: BarChart2,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', title: 'Analytics Dashboard',           desc: 'Track views, orders, and growth from your dashboard in real time.' },
  { icon: Zap,        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', title: 'Set Up in Minutes',              desc: 'No developer needed. If you can send a WhatsApp message, you can manage ZeleraDeck.' },
]

const WHO_FOR = [
  'Kirana stores and grocery shops',
  'Mobile phone dealers and electronics',
  'Clothing boutiques and textile shops',
  'Hardware and building material stores',
  'Restaurants and home-based food businesses',
  'Cottage industries and local craft sellers',
  'Any Kerala shop owner wanting to go digital',
]

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ZeleraDeck',
  url: 'https://zeleradeck.com',
  logo: 'https://zeleradeck.com/logo2.png',
  description: 'ZeleraDeck is a mobile-first digital product catalogue SaaS for small shop owners in Kerala, India.',
  email: 'teamzelera@gmail.com',
  telephone: '+917012783442',
  address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressCountry: 'IN' },
  areaServed: { '@type': 'State', name: 'Kerala' },
}

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About ZeleraDeck — Digital Catalogue for Kerala Shops"
        description="Learn about ZeleraDeck — the mobile-first digital product catalogue built for small shop owners in Kerala. Create your catalogue in minutes, share one link, grow your business."
        url="https://zeleradeck.com/about"
        keywords="about zeleradeck, digital catalogue Kerala, online catalogue for shops, zeleradeck features, shop catalogue app Kerala"
        schema={aboutSchema}
      />
      <div className="zdeck-page min-h-screen" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <PublicNavbar />

        <main>

          {/* ── Page Hero ── */}
          <section className="relative overflow-hidden bg-white pt-20 pb-16 px-4 text-center" aria-labelledby="about-hero-heading">
            <div className="zdeck-orb zdeck-orb-1" aria-hidden="true" style={{ opacity: 0.5 }} />
            <div className="zdeck-grid-overlay" aria-hidden="true" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="zdeck-section-badge">About Us</span>
              <h1 id="about-hero-heading" className="text-4xl sm:text-5xl font-black text-[#1E293B] mt-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Built for Kerala's<br />
                <span className="zdeck-gradient-text">Local Shop Owners</span>
              </h1>
              <p className="mt-5 text-[#94A3B8] text-lg max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                ZeleraDeck is a mobile-first digital product catalogue SaaS. Create your catalogue in minutes, share one link everywhere, and let customers browse and order on WhatsApp.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                {[
                  { icon: MapPin, label: 'Based in Kerala' },
                  { icon: Users, label: '500+ Active Shops' },
                  { icon: Clock, label: 'Setup in Under 30 min' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white/50 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    <Icon className="w-4 h-4 text-[#2563EB]" strokeWidth={1.75} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
          </section>

          {/* ── What is ZeleraDeck ── */}
          <section className="px-4 py-16 max-w-4xl mx-auto" aria-labelledby="what-heading">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="zdeck-section-badge">What We Do</span>
                <h2 id="what-heading" className="zdeck-section-title mt-3">What is ZeleraDeck?</h2>
                <div className="mt-5 space-y-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  <p className="text-[#64748B] leading-relaxed">
                    ZeleraDeck is a <strong className="text-[#1E293B]">SaaS platform</strong> that gives local shop owners in Kerala their own professional digital product catalogue — without needing a website, developer, or technical knowledge.
                  </p>
                  <p className="text-[#64748B] leading-relaxed">
                    Think of it as a <strong className="text-[#1E293B]">simple, affordable alternative to Shopify</strong> — designed specifically for Kerala's small business community. Kirana stores, boutiques, electronics shops, hardware stores, and more.
                  </p>
                  <p className="text-[#64748B] leading-relaxed">
                    Shop owners sign up, upload products with photos and prices, and instantly get a shareable link and QR code. Customers browse and order directly on WhatsApp.
                  </p>
                </div>
                <a href={WA} target="_blank" rel="noopener noreferrer" id="about-wa-cta" className="zdeck-btn-primary mt-8 inline-flex">
                  <MessageCircle className="w-5 h-5" />
                  Get Started on WhatsApp
                </a>
              </div>
              <div className="zdeck-about-card-grid">
                {[
                  { label: 'No website needed', color: '#2563EB' },
                  { label: 'WhatsApp ordering', color: '#25D366' },
                  { label: 'Instant QR code', color: '#EA580C' },
                  { label: 'Zero commission', color: '#059669' },
                ].map(({ label, color }) => (
                  <div key={label} className="zdeck-about-pill" style={{ '--pill-color': color }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section className="bg-[#F8FAFC] px-4 py-16" aria-labelledby="features-heading">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="zdeck-section-badge">Platform Features</span>
                <h2 id="features-heading" className="zdeck-section-title mt-3">Everything your shop needs</h2>
                <p className="zdeck-section-sub mt-4">Simple, powerful tools built specifically for local businesses in Kerala.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f) => {
                  const Icon = f.icon
                  return (
                    <article key={f.title} className="zdeck-feature-card group bg-white border-[#E2E8F0]" style={{ '--glow-color': f.color + '4D' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: f.bg }}>
                        <Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={1.75} />
                      </div>
                      <h3 className="zdeck-card-title">{f.title}</h3>
                      <p className="zdeck-card-desc mt-2">{f.desc}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── Who is it for ── */}
          <section className="px-4 py-16 max-w-4xl mx-auto" aria-labelledby="for-heading">
            <div className="text-center mb-10">
              <span className="zdeck-section-badge">Who It's For</span>
              <h2 id="for-heading" className="zdeck-section-title mt-3">Made for Kerala businesses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHO_FOR.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-[#2563EB]/30 hover:shadow-sm transition-all duration-200">
                  <CheckCircle className="w-5 h-5 text-[#059669] flex-shrink-0" />
                  <span className="text-sm text-[#475569]" style={{ fontFamily: "'Open Sans', sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── How It Works ── */}
          <section className="bg-white border-y border-[#E2E8F0] px-4 py-16" aria-labelledby="how-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="zdeck-section-badge">Process</span>
                <h2 id="how-heading" className="text-3xl font-black text-[#1E293B] mt-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  How it works
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {HOW_IT_WORKS.map(({ step, title, desc }) => (
                  <div key={step} className="zdeck-step-card">
                    <span className="zdeck-step-number">{step}</span>
                    <h3 className="text-[#1E293B] font-bold text-lg mt-3 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
                    <p className="text-[#64748B] text-sm leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Our Story ── */}
          <section className="px-4 py-16 max-w-3xl mx-auto" aria-labelledby="story-heading">
            <span className="zdeck-section-badge">Our Story</span>
            <h2 id="story-heading" className="zdeck-section-title mt-3 mb-6">A Kerala startup, for Kerala shops</h2>
            <div className="space-y-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              <p className="text-[#64748B] leading-relaxed">
                ZeleraDeck was born from a simple observation: Kerala has thousands of talented shop owners with amazing products, but no easy way to show them off online. Paper catalogues get lost. Expensive websites need developers. Instagram is great, but not built for catalogues.
              </p>
              <p className="text-[#64748B] leading-relaxed">
                We're a young Kerala startup that believes every local shop deserves a digital presence — without complexity or high cost. ZeleraDeck is our answer: a simple, WhatsApp-native catalogue any shop owner can set up and share in under 30 minutes.
              </p>
              <p className="text-[#64748B] leading-relaxed">
                We started with a handful of shops and we're growing every week. Our mission: help local businesses grow by making digital tools as easy as sending a WhatsApp message.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href={WA} target="_blank" rel="noopener noreferrer" id="story-wa-cta" className="zdeck-btn-primary">
                <MessageCircle className="w-5 h-5" />
                Get Started on WhatsApp
              </a>
              <Link to="/contact" className="zdeck-btn-ghost-dark">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* ── Contact Strip ── */}
          <section className="bg-[#F8FAFC] py-16 relative overflow-hidden" aria-labelledby="about-cta-heading">
            <div className="zdeck-cta-orb" aria-hidden="true" />
            <div className="relative z-10 text-center px-4">
              <ShieldCheck className="w-10 h-10 text-[#2563EB] mx-auto mb-4" strokeWidth={1.5} />
              <h2 id="about-cta-heading" className="text-3xl font-black text-[#1E293B] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Any questions? We're here.
              </h2>
              <p className="text-[#64748B] mb-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Reach us on WhatsApp or email — in English or Malayalam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/917012783442" target="_blank" rel="noopener noreferrer" id="about-contact-wa" className="zdeck-btn-primary">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp: +91 70127 83442
                </a>
                <a href="mailto:teamzelera@gmail.com" className="zdeck-btn-ghost-dark">
                  <Mail className="w-5 h-5" />
                  teamzelera@gmail.com
                </a>
              </div>
            </div>
          </section>

        </main>

        <footer className="bg-white border-t border-[#E2E8F0] px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo-zd-nobg.png" alt="ZeleraDeck" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-sm font-bold text-[#1E293B] block" style={{ fontFamily: "'Poppins', sans-serif" }}>ZeleraDeck</span>
                <span className="text-xs text-[#475569]">Where we grow together</span>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
              {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Contact', '/contact']].map(([l, t]) => (
                <Link key={t} to={t} className="text-xs text-[#475569] hover:text-white transition-colors">{l}</Link>
              ))}
            </nav>
            <p className="text-xs text-[#334155]">© {new Date().getFullYear()} ZeleraDeck</p>
          </div>
        </footer>
      </div>
    </>
  )
}
