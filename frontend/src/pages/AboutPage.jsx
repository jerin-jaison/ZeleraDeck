import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, MessageCircle, Mail } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const FEATURES = [
  {
    title: 'Digital Product Catalogue',
    desc: 'Upload your products with photos, prices, and descriptions. Your catalogue is instantly live and shareable.',
  },
  {
    title: 'One Shareable Link',
    desc: 'Every shop gets a unique URL. Share it on WhatsApp, Instagram, Facebook, or print it on a flyer.',
  },
  {
    title: 'QR Code Generator',
    desc: 'Auto-generated QR code for your shop. Print it in-store and let walk-in customers browse digitally.',
  },
  {
    title: 'WhatsApp Ordering',
    desc: 'Customers browse your catalogue and place orders directly on WhatsApp — no payment gateway needed.',
  },
  {
    title: 'Category Management',
    desc: 'Organise products into categories so customers can find what they need quickly.',
  },
  {
    title: 'Stock Control',
    desc: 'Mark products in-stock or out-of-stock in a single tap. Keep your catalogue accurate in real time.',
  },
]

const PRICING = [
  {
    name: 'Standard Plan',
    price: '₹699',
    desc: 'Everything you need to run your digital shop. Cancel anytime.',
    features: ['Unlimited products', 'Shareable catalogue link', 'QR code', 'WhatsApp ordering', 'Zero commissions on sales'],
  },
  {
    name: 'Launch Offer (3 Months)',
    price: '₹1,599',
    desc: 'Jumpstart your digital growth for roughly ₹533/month!',
    features: ['Everything in Standard', 'Full 3 months of access', 'Priority support', 'No hidden setup fees'],
    highlight: true,
  },
]

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ZeleraDeck',
  url: 'https://zeleradeck.com',
  logo: 'https://zeleradeck.com/logo2.png',
  description:
    'ZeleraDeck is a mobile-first digital product catalogue SaaS for small shop owners in Kerala, India.',
  email: 'teamzelera@gmail.com',
  telephone: '+917012783442',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Kerala',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'State',
    name: 'Kerala',
  },
  sameAs: ['https://zeleradeck.com'],
}

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <>
      <SEOHead
        title="About ZeleraDeck — Digital Catalogue for Kerala Shops"
        description="Learn about ZeleraDeck — the mobile-first digital product catalogue built for small shop owners in Kerala, India. Create your catalogue, share one link, and grow your business."
        url="https://zeleradeck.com/about"
        keywords="about zeleradeck, digital catalogue Kerala, online catalogue for shops, zeleradeck features, zeleradeck pricing, shop catalogue app Kerala"
        schema={aboutSchema}
      />

      {/* ── Semantic HTML page — readable by AI crawlers without JS ── */}
      <div className="bg-[#F8F8F8] min-h-screen pb-16" style={{ animation: 'fadeIn 0.15s ease-out' }}>

        {/* Header */}
        <header className="bg-white border-b border-[#F0F0F0]">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 text-[#0A0A0A]"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-[#0A0A0A]">About ZeleraDeck</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

          {/* Hero section */}
          <section aria-labelledby="hero-heading">
            <div className="bg-[#0A0A0A] rounded-2xl p-8 text-center">
              <img
                src="/logo-new.png"
                alt="ZeleraDeck logo"
                className="w-14 h-14 rounded-2xl object-cover mx-auto"
                loading="eager"
              />
              <h2 id="hero-heading" className="text-2xl font-black text-white mt-4">
                ZeleraDeck
              </h2>
              <p className="text-sm tracking-[0.2em] text-white/60 mt-2 font-semibold uppercase">
                Where Growth Begins
              </p>
              <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-md mx-auto">
                A mobile-first digital product catalogue built for small shop owners
                in Kerala, India. Create your catalogue in minutes, share one link
                everywhere, and let customers browse and order on WhatsApp.
              </p>
            </div>
          </section>

          {/* What is ZeleraDeck */}
          <section aria-labelledby="what-heading">
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
              <h2 id="what-heading" className="text-lg font-bold text-[#0A0A0A]">
                What is ZeleraDeck?
              </h2>
              <p className="text-sm text-[#737373] mt-3 leading-relaxed">
                ZeleraDeck is a <strong>SaaS (Software as a Service)</strong> platform
                that gives local shop owners in Kerala their own professional digital
                product catalogue — without needing a website, developer, or technical
                knowledge.
              </p>
              <p className="text-sm text-[#737373] mt-3 leading-relaxed">
                Shop owners sign up, upload their products with photos and prices, and
                instantly get a shareable link and QR code. Customers can browse the
                catalogue on any phone and place orders directly on WhatsApp.
              </p>
              <p className="text-sm text-[#737373] mt-3 leading-relaxed">
                Think of it as a <strong>simple, affordable alternative to Shopify</strong> designed
                specifically for Kerala's small business community —  kirana stores,
                boutiques, electronics shops, hardware stores, and more.
              </p>
            </div>
          </section>

          {/* Who is it for */}
          <section aria-labelledby="for-heading">
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
              <h2 id="for-heading" className="text-lg font-bold text-[#0A0A0A]">
                Who is ZeleraDeck for?
              </h2>
              <ul className="mt-4 space-y-2">
                {[
                  'Kirana stores and grocery shops',
                  'Mobile phone dealers and electronics shops',
                  'Clothing boutiques and textile shops',
                  'Hardware and building material stores',
                  'Restaurants and food businesses',
                  'Home-based businesses and cottage industries',
                  'Any local shop owner in Kerala who wants to go digital',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#737373]">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Features */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-lg font-bold text-[#0A0A0A] mb-4">
              Key Features
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="bg-white rounded-2xl border border-[#F0F0F0] p-5"
                >
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">{f.title}</h3>
                  <p className="text-sm text-[#737373] mt-1 leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section aria-labelledby="pricing-heading">
            <h2 id="pricing-heading" className="text-lg font-bold text-[#0A0A0A] mb-4">
              Pricing Plans
            </h2>
            <div className="space-y-3">
              {PRICING.map((plan) => (
                <article
                  key={plan.name}
                  className={`rounded-2xl border p-5 ${
                    plan.highlight
                      ? 'bg-[#0A0A0A] border-[#0A0A0A]'
                      : 'bg-white border-[#F0F0F0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-bold text-base ${
                        plan.highlight ? 'text-white' : 'text-[#0A0A0A]'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <span
                      className={`text-lg font-black ${
                        plan.highlight ? 'text-white' : 'text-[#0A0A0A]'
                      }`}
                    >
                      {plan.price}
                      <span
                        className={`text-xs font-normal ml-1 ${
                          plan.highlight ? 'text-white/60' : 'text-[#737373]'
                        }`}
                      >
                        /month
                      </span>
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      plan.highlight ? 'text-white/60' : 'text-[#737373]'
                    }`}
                  >
                    {plan.desc}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className={`flex items-center gap-2 text-sm ${
                          plan.highlight ? 'text-white/80' : 'text-[#737373]'
                        }`}
                      >
                        <CheckCircle
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            plan.highlight ? 'text-white/60' : 'text-[#16A34A]'
                          }`}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact-heading">
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
              <h2 id="contact-heading" className="text-lg font-bold text-[#0A0A0A]">
                Get in Touch
              </h2>
              <p className="text-sm text-[#737373] mt-2">
                Have questions? Our support team responds quickly on WhatsApp in
                both English and Malayalam.
              </p>
              <address className="mt-4 not-italic space-y-3">
                <a
                  href="https://wa.me/917012783442"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm font-medium text-[#0A0A0A]"
                >
                  <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  +91 70127 83442
                </a>
                <a
                  href="mailto:teamzelera@gmail.com"
                  className="flex items-center gap-3 text-sm font-medium text-[#0A0A0A]"
                >
                  <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  teamzelera@gmail.com
                </a>
              </address>
              <button
                onClick={() => navigate('/contact')}
                className="mt-6 w-full bg-[#0A0A0A] text-white rounded-xl py-3.5 text-sm font-semibold"
              >
                Contact Support
              </button>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}
