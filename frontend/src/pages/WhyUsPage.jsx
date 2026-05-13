import {
  MessageCircle, CheckCircle, X, Star, ArrowRight,
  Zap, Globe, HeartHandshake, IndianRupee, Headphones, Clock
} from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'
import { Link } from 'react-router-dom'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const COMPARISON = [
  { feature: 'Works on WhatsApp',           zelera: true,  paper: false, others: false },
  { feature: 'No technical skills needed',  zelera: true,  paper: true,  others: false },
  { feature: 'Update products anytime',     zelera: true,  paper: false, others: true  },
  { feature: 'Share via link or QR code',   zelera: true,  paper: false, others: true  },
  { feature: 'Local support in Malayalam',  zelera: true,  paper: false, others: false },
  { feature: 'Affordable — from ₹699/mo',   zelera: true,  paper: false, others: false },
  { feature: 'No commission on sales',      zelera: true,  paper: true,  others: false },
  { feature: 'Set up in under 30 minutes',  zelera: true,  paper: false, others: false },
]

const REASONS = [
  { icon: Globe,          color: '#2563EB', bg: 'rgba(37,99,235,0.1)',   title: 'Made for Kerala Shops',       desc: 'Built by a Kerala team, for Kerala shop owners. We understand how local businesses work — from kirana stores to boutiques.' },
  { icon: MessageCircle,  color: '#25D366', bg: 'rgba(37,211,102,0.1)', title: 'WhatsApp-First',              desc: 'Your customers already use WhatsApp every day. ZeleraDeck fits right into their routine — no new app to download.' },
  { icon: Zap,            color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', title: 'No Tech Knowledge Needed',   desc: 'If you can send a WhatsApp message, you can manage your ZeleraDeck catalogue. Simple as that.' },
  { icon: IndianRupee,    color: '#059669', bg: 'rgba(5,150,105,0.1)',  title: 'Truly Affordable',           desc: 'Starting at just ₹699/month — less than the cost of printing paper catalogues. No hidden fees, no commissions.' },
  { icon: Headphones,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', title: 'Local Support',              desc: 'Our support team responds in English and Malayalam. We\'re just a WhatsApp message away — always.' },
  { icon: Clock,          color: '#EA580C', bg: 'rgba(234,88,12,0.1)',  title: 'Live in 30 Minutes',         desc: 'From sign-up to your first product live takes under 30 minutes. We guide you every step of the way.' },
]

const TESTIMONIALS = [
  { shop: 'Mia Fashion Hub',  owner: 'Mia Thomas',   location: 'Thrissur',  initial: 'MT', color: '#EC4899', text: 'Our customers keep sharing our catalogue link with their friends. Orders have gone up a lot since we joined ZeleraDeck.', amount: '₹8,400/mo' },
  { shop: 'Krishna Textiles', owner: 'Krishnan P.',  location: 'Kozhikode', initial: 'KP', color: '#3B82F6', text: 'Setting up was so easy. The team helped us on WhatsApp. Now all our sarees are online!', amount: '₹12,200/mo' },
  { shop: 'Beena Sarees',     owner: 'Beena Nair',   location: 'Kochi',     initial: 'BN', color: '#F97316', text: 'I used to hand out paper lists to customers. Now I just send one link on WhatsApp. Game changer for my shop.', amount: '₹6,800/mo' },
]

export default function WhyUsPage() {
  return (
    <>
      <SEOHead
        title="Why Choose ZeleraDeck — Digital Catalogue for Kerala Shops"
        description="See why Kerala shop owners choose ZeleraDeck over paper catalogues and other tools. WhatsApp-first, affordable, local support, no tech skills needed."
        url="https://zeleradeck.com/why-us"
        keywords="why zeleradeck, digital catalogue Kerala, WhatsApp shop Kerala, best catalogue app India, ZeleraDeck vs others"
      />
      <div className="zdeck-page min-h-screen" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <PublicNavbar />

        <main>

          {/* ── Page Hero ── */}
          <section className="relative overflow-hidden bg-[#0F172A] pt-20 pb-16 px-4 text-center" aria-labelledby="whyus-heading">
            <div className="zdeck-orb zdeck-orb-1" aria-hidden="true" style={{ opacity: 0.5 }} />
            <div className="zdeck-orb zdeck-orb-2" aria-hidden="true" style={{ opacity: 0.3 }} />
            <div className="zdeck-grid-overlay" aria-hidden="true" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="zdeck-section-badge-dark">Why ZeleraDeck</span>
              <h1 id="whyus-heading" className="text-4xl sm:text-5xl font-black text-white mt-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Why Kerala Shops<br />
                <span className="zdeck-gradient-text">Choose Us</span>
              </h1>
              <p className="mt-5 text-[#94A3B8] text-lg max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                We're not just another app. We're built for Kerala's local shop owners — affordable, simple, and WhatsApp-native.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F8FAFC] to-transparent" aria-hidden="true" />
          </section>

          {/* ── 6 Reasons ── */}
          <section className="px-4 py-16 max-w-5xl mx-auto" aria-labelledby="reasons-heading">
            <div className="text-center mb-12">
              <span className="zdeck-section-badge">Our Advantages</span>
              <h2 id="reasons-heading" className="zdeck-section-title mt-3">6 reasons Kerala shops love us</h2>
              <p className="zdeck-section-sub mt-4">From setup to support, we make going digital effortless.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {REASONS.map((r) => {
                const Icon = r.icon
                return (
                  <article key={r.title} className="zdeck-feature-card group" style={{ '--glow-color': r.color + '4D' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: r.bg }}>
                      <Icon className="w-5 h-5" style={{ color: r.color }} strokeWidth={1.75} />
                    </div>
                    <h3 className="zdeck-card-title">{r.title}</h3>
                    <p className="zdeck-card-desc mt-2">{r.desc}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ── Comparison Table ── */}
          <section className="bg-[#F8FAFC] px-4 py-16" aria-labelledby="compare-heading">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="zdeck-section-badge">Comparison</span>
                <h2 id="compare-heading" className="zdeck-section-title mt-3">How we compare</h2>
                <p className="zdeck-section-sub mt-4">See exactly what ZeleraDeck offers versus alternatives.</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="grid grid-cols-4 bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-4">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide col-span-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Feature</span>
                  <span className="text-xs font-bold text-[#2563EB] text-center uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>ZeleraDeck</span>
                  <span className="text-xs font-semibold text-[#64748B] text-center uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>Paper</span>
                  <span className="text-xs font-semibold text-[#64748B] text-center uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>Others</span>
                </div>
                {COMPARISON.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-4 px-5 py-3.5 items-center hover:bg-[#F8FAFC] transition-colors ${i < COMPARISON.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                  >
                    <span className="text-sm text-[#475569] pr-3 leading-snug" style={{ fontFamily: "'Open Sans', sans-serif" }}>{row.feature}</span>
                    <div className="flex justify-center">
                      {row.zelera
                        ? <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-[#059669]" /></div>
                        : <div className="w-6 h-6 rounded-full bg-[#FEE2E2] flex items-center justify-center"><X className="w-3.5 h-3.5 text-[#EF4444]" /></div>
                      }
                    </div>
                    <div className="flex justify-center">
                      {row.paper
                        ? <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-[#059669]" /></div>
                        : <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center"><X className="w-3.5 h-3.5 text-[#CBD5E1]" /></div>
                      }
                    </div>
                    <div className="flex justify-center">
                      {row.others
                        ? <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-[#059669]" /></div>
                        : <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center"><X className="w-3.5 h-3.5 text-[#CBD5E1]" /></div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="px-4 py-16 max-w-5xl mx-auto" aria-labelledby="testimonials-heading">
            <div className="text-center mb-12">
              <span className="zdeck-section-badge">Social Proof</span>
              <h2 id="testimonials-heading" className="zdeck-section-title mt-3">What shop owners say</h2>
              <p className="zdeck-section-sub mt-4">Real shops. Real results.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <article key={t.shop} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />)}
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    "{t.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                        {t.initial}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.owner}</p>
                        <p className="text-xs text-[#94A3B8]" style={{ fontFamily: "'Open Sans', sans-serif" }}>{t.shop} · {t.location}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#059669] bg-[#DCFCE7] px-2 py-0.5 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.amount}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="zdeck-cta-section" aria-labelledby="whyus-cta-heading">
            <div className="zdeck-cta-orb" aria-hidden="true" />
            <div className="relative z-10 text-center px-4">
              <h2 id="whyus-cta-heading" className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Ready to go digital?
              </h2>
              <p className="text-[#64748B] mb-8 text-lg" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Join Kerala shops already growing with ZeleraDeck.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={WA} target="_blank" rel="noopener noreferrer" id="whyus-wa-cta" className="zdeck-btn-primary">
                  <MessageCircle className="w-5 h-5" />
                  Get Started on WhatsApp
                </a>
                <Link to="/contact" className="zdeck-btn-ghost">
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-xs text-white/30 mt-6" style={{ fontFamily: "'Open Sans', sans-serif" }}>No online payment needed. Just WhatsApp or call us.</p>
            </div>
          </section>

        </main>

        <footer className="bg-[#0F172A] border-t border-white/8 px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo-zd-nobg.png" alt="ZeleraDeck" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-sm font-bold text-white block" style={{ fontFamily: "'Poppins', sans-serif" }}>ZeleraDeck</span>
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
