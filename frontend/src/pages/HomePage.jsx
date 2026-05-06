import { Link } from 'react-router-dom'
import { MessageCircle, Link2, Package, CheckCircle, Star, ArrowRight, QrCode } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const FEATURES = [
  { icon: Link2, title: 'One Shareable Catalogue Link', desc: 'Every shop gets a unique link. Share it on WhatsApp, Instagram, or print on a flyer. Customers browse on any phone instantly.' },
  { icon: MessageCircle, title: 'WhatsApp-First Ordering', desc: 'Customers browse your catalogue and place orders directly on WhatsApp — no app download, no payment gateway needed.' },
  { icon: Package, title: 'Easy Product Management', desc: 'Add products with photos, prices, and categories in minutes. Mark in-stock or out-of-stock with a single tap.' },
  { icon: QrCode, title: 'QR Code for Your Shop', desc: 'Auto-generated QR code you can print in-store. Walk-in customers scan and browse your full digital catalogue instantly.' },
]

const PLANS = [
  { id: 'starter',  name: 'Starter', price: '₹799',   desc: 'Perfect for shops just going digital', badge: null, hi: false,
    features: ['Up to 50 products', 'Shareable catalogue link', 'WhatsApp ordering', 'QR code'] },
  { id: 'growth',   name: 'Growth',  price: '₹1,499', desc: 'For shops ready to grow faster',       badge: 'Most Popular', hi: true,
    features: ['Up to 200 products', 'Custom branding', 'Analytics dashboard', 'Priority support', 'Everything in Starter'] },
  { id: 'premium',  name: 'Premium', price: '₹2,499', desc: 'Unlimited power for established shops', badge: null, hi: false,
    features: ['Unlimited products', 'Advanced analytics', 'Dedicated support', 'Custom domain (soon)', 'Everything in Growth'] },
]

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="ZeleraDeck — Where Growth Begins"
        description="ZeleraDeck gives Kerala shop owners a beautiful digital catalogue with a shareable link and WhatsApp ordering. No website needed."
        url="https://zeleradeck.com"
        keywords="digital catalogue Kerala, WhatsApp catalogue shop, ZeleraDeck, shop catalogue app India"
      />
      <div className="bg-[#F8F8F8] min-h-screen" style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <PublicNavbar transparent={true} />
        <main>
          {/* Hero */}
          <section className="bg-[#0A0A0A] px-4 pt-28 pb-20 text-center">
            <div className="max-w-2xl mx-auto">
              <span className="inline-block text-xs font-semibold tracking-widest text-[#737373] uppercase mb-4">Digital Catalogue Platform</span>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Your shop. Online.
                <span className="block text-[#00c8f0] mt-1">In minutes.</span>
              </h1>
              <p className="mt-5 text-[#A3A3A3] text-base max-w-lg mx-auto leading-relaxed">
                ZeleraDeck gives Kerala shop owners a beautiful digital catalogue with a shareable link and WhatsApp ordering — no website, no app, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <a href={WA} target="_blank" rel="noopener noreferrer" id="hero-wa-cta"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors">
                  <MessageCircle className="w-4 h-4" /> Get Started on WhatsApp
                </a>
                <Link to="/about" id="hero-learn-more"
                  className="flex items-center justify-center gap-1.5 border border-white/15 text-white/80 font-medium text-sm px-7 py-3.5 rounded-xl hover:border-white/30 transition-colors">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>



          {/* Features */}
          <section aria-labelledby="features-heading" className="px-4 py-14 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="features-heading" className="text-2xl font-black text-[#0A0A0A]">Everything your shop needs</h2>
              <p className="text-sm text-[#737373] mt-2 max-w-sm mx-auto">Simple tools that actually work for local businesses in Kerala.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <article key={f.title} className="bg-white rounded-2xl border border-[#F0F0F0] p-5">
                    <div className="w-9 h-9 bg-[#F8F8F8] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-4 h-4 text-[#0A0A0A]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-sm font-bold text-[#0A0A0A]">{f.title}</h3>
                    <p className="text-sm text-[#737373] mt-1.5 leading-relaxed">{f.desc}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Pricing */}
          <section aria-labelledby="pricing-heading" className="bg-white border-y border-[#F0F0F0] px-4 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 id="pricing-heading" className="text-2xl font-black text-[#0A0A0A]">Simple, honest pricing</h2>
                <p className="text-sm text-[#737373] mt-2">No hidden fees. No online payment needed. Just WhatsApp us.</p>
              </div>
              <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-3 mb-6">
                <Star className="w-4 h-4 text-[#0A0A0A] flex-shrink-0 mt-0.5 fill-[#0A0A0A]" />
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">Founding Member Offer 🎉</p>
                  <p className="text-xs text-[#737373] mt-0.5">The first 15 shops get special Founding Member pricing — locked in for life. WhatsApp us to claim yours.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <article key={plan.id} className={`rounded-2xl border p-5 flex flex-col ${plan.hi ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'bg-white border-[#F0F0F0]'}`}>
                    {plan.badge && (
                      <span className={`self-start text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 ${plan.hi ? 'bg-white/15 text-white/70' : 'bg-[#F0F0F0] text-[#737373]'}`}>
                        {plan.badge}
                      </span>
                    )}
                    <h3 className={`font-bold text-base ${plan.hi ? 'text-white' : 'text-[#0A0A0A]'}`}>{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${plan.hi ? 'text-white' : 'text-[#0A0A0A]'}`}>{plan.price}</span>
                      <span className={`text-xs ${plan.hi ? 'text-white/50' : 'text-[#737373]'}`}>/month</span>
                    </div>
                    <p className={`text-xs mt-1 ${plan.hi ? 'text-white/50' : 'text-[#737373]'}`}>{plan.desc}</p>
                    <ul className="mt-4 space-y-2 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className={`flex items-start gap-2 text-xs ${plan.hi ? 'text-white/80' : 'text-[#737373]'}`}>
                          <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.hi ? 'text-white/50' : 'text-[#16A34A]'}`} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <a href={`${WA}&plan=${plan.name}`} target="_blank" rel="noopener noreferrer" id={`pricing-cta-${plan.id}`}
                      className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${plan.hi ? 'bg-white text-[#0A0A0A] hover:bg-[#F0F0F0]' : 'bg-[#0A0A0A] text-white hover:bg-[#2A2A2A]'}`}>
                      <MessageCircle className="w-3.5 h-3.5" /> {plan.name === 'Starter' ? 'Get Starter Plan' : plan.name === 'Growth' ? 'Get Growth Plan' : 'Get Premium Plan'}
                    </a>
                  </article>
                ))}
              </div>
              <p className="text-center text-xs text-[#A3A3A3] mt-6">No online payment needed. Just WhatsApp or call us — we'll set everything up for you.</p>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="px-4 py-14 max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-black text-[#0A0A0A]">Ready to take your shop digital?</h2>
            <p className="text-sm text-[#737373] mt-2">Join Kerala shops already growing with ZeleraDeck.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <a href={WA} target="_blank" rel="noopener noreferrer" id="bottom-wa-cta"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us Now
              </a>
              <Link to="/contact"
                className="flex items-center justify-center gap-1.5 border border-[#E5E5E5] text-[#0A0A0A] font-medium text-sm px-6 py-3.5 rounded-xl hover:border-[#D4D4D4] transition-colors">
                Contact Us
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#F0F0F0] px-4 py-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-new.png" alt="ZeleraDeck" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-sm font-bold text-[#0A0A0A]">ZeleraDeck</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              {[['Home','/'],['About','/about'],['Why Us','/why-us'],['Contact','/contact']].map(([l,t]) => (
                <Link key={t} to={t} className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors">{l}</Link>
              ))}
            </nav>
            <p className="text-xs text-[#A3A3A3]">© {new Date().getFullYear()} ZeleraDeck</p>
          </div>
        </footer>
      </div>
    </>
  )
}
