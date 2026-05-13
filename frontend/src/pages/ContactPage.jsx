import { useState } from 'react'
import { MessageCircle, Mail, Phone, CheckCircle, Send, Clock, MapPin, ArrowRight } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'
import { Link } from 'react-router-dom'

const WA_NUMBER = '917012783442'
const WA_URL    = `https://wa.me/${WA_NUMBER}?text=Hi%2C%20I%20want%20to%20know%20more%20about%20ZeleraDeck`
const EMAIL     = 'teamzelera@gmail.com'
const PHONE     = '+91 70127 83442'

const CONTACT_METHODS = [
  {
    id: 'contact-wa-btn',
    icon: MessageCircle,
    label: 'WhatsApp Us',
    value: PHONE,
    sub: 'Fastest response — typically within 1 hour',
    href: WA_URL,
    bg: '#25D366',
    hoverBg: '#1ebe5d',
    textColor: '#fff',
    external: true,
  },
  {
    id: 'contact-phone-btn',
    icon: Phone,
    label: 'Call Us',
    value: PHONE,
    sub: 'Mon–Sat, 9 AM – 7 PM IST',
    href: `tel:${WA_NUMBER}`,
    bg: '#EFF6FF',
    hoverBg: '#DBEAFE',
    textColor: '#1E293B',
    external: false,
  },
  {
    id: 'contact-email-btn',
    icon: Mail,
    label: 'Email Us',
    value: EMAIL,
    sub: 'Response within 24 hours',
    href: `mailto:${EMAIL}`,
    bg: '#F8FAFC',
    hoverBg: '#F1F5F9',
    textColor: '#1E293B',
    external: false,
  },
]

const FAQ = [
  { q: 'How long does it take to set up?', a: 'Most shops are live within 30 minutes. Our team guides you through the entire process on WhatsApp.' },
  { q: 'Do I need a website or technical knowledge?', a: 'No. If you can send a WhatsApp message, you can manage ZeleraDeck. We handle everything else.' },
  { q: 'How do customers place orders?', a: 'They browse your catalogue link and tap "Order on WhatsApp". The order arrives directly in your WhatsApp inbox.' },
  { q: 'Can I try before paying?', a: 'Yes! WhatsApp us and we\'ll set up a demo for your shop so you can see it in action before committing.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', shopName: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <SEOHead
        title="Contact Us — ZeleraDeck"
        description="Get in touch with ZeleraDeck. WhatsApp us at +91 70127 83442 or fill the form. We respond within 24 hours in English or Malayalam."
        url="https://zeleradeck.com/contact"
        keywords="contact zeleradeck, zeleradeck support, WhatsApp Kerala shop catalogue"
      />
      <div className="zdeck-page min-h-screen" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <PublicNavbar />

        <main>

          {/* ── Page Hero ── */}
          <section className="relative overflow-hidden bg-white pt-20 pb-16 px-4 text-center" aria-labelledby="contact-hero-heading">
            <div className="zdeck-orb zdeck-orb-1" aria-hidden="true" style={{ opacity: 0.5 }} />
            <div className="zdeck-grid-overlay" aria-hidden="true" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="zdeck-section-badge">Get in Touch</span>
              <h1 id="contact-hero-heading" className="text-4xl sm:text-5xl font-black text-[#1E293B] mt-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                We're Here to<br />
                <span className="zdeck-gradient-text">Help You Grow</span>
              </h1>
              <p className="mt-5 text-[#94A3B8] text-lg max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Reach us on WhatsApp, call, or email — we respond in English and Malayalam, fast.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                {[
                  { icon: Clock, label: 'Replies within 1 hour on WhatsApp' },
                  { icon: MapPin, label: 'Based in Kerala' },
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

          {/* ── Contact Methods + Form ── */}
          <section className="px-4 py-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Left — direct contact */}
              <div>
                <span className="zdeck-section-badge">Direct Contact</span>
                <h2 className="zdeck-section-title mt-3 mb-6">Reach us directly</h2>

                <div className="space-y-3">
                  {CONTACT_METHODS.map(({ id, icon: Icon, label, value, sub, href, bg, hoverBg, textColor, external }) => (
                    <a
                      key={id}
                      id={id}
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="zdeck-contact-method-card"
                      style={{ '--contact-bg': bg, '--contact-hover': hoverBg }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg === '#25D366' ? 'rgba(255,255,255,0.2)' : bg }}>
                        <Icon className="w-6 h-6" style={{ color: bg === '#25D366' ? '#fff' : '#2563EB' }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: textColor, fontFamily: "'Poppins', sans-serif" }}>{label}</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: bg === '#25D366' ? 'rgba(255,255,255,0.9)' : '#1E293B', fontFamily: "'Open Sans', sans-serif" }}>{value}</p>
                        <p className="text-xs mt-0.5" style={{ color: bg === '#25D366' ? 'rgba(255,255,255,0.6)' : '#94A3B8', fontFamily: "'Open Sans', sans-serif" }}>{sub}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-50" style={{ color: textColor }} />
                    </a>
                  ))}
                </div>

                {/* FAQ */}
                <div className="mt-10">
                  <h3 className="text-base font-bold text-[#1E293B] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Frequently asked</h3>
                  <div className="space-y-3">
                    {FAQ.map(({ q, a }) => (
                      <div key={q} className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-[#2563EB]/30 transition-colors">
                        <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{q}</p>
                        <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — form or success */}
              <div>
                <span className="zdeck-section-badge">Send a Message</span>
                <h2 className="zdeck-section-title mt-3 mb-6">We'll call you back</h2>

                {submitted ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center shadow-sm">
                    <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-[#059669]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mt-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      We'll reach you soon!
                    </h3>
                    <p className="text-sm text-[#64748B] mt-2 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      We'll WhatsApp you within 24 hours from{' '}
                      <strong className="text-[#1E293B]">{PHONE}</strong>.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', shopName: '', phone: '', message: '' }) }}
                      className="mt-6 w-full border border-[#E2E8F0] rounded-xl py-3 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors cursor-pointer"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4"
                  >
                    {[
                      { id: 'contact-name',  name: 'name',     label: 'Your Name',                  placeholder: 'e.g. Ravi Kumar',          type: 'text' },
                      { id: 'contact-shop',  name: 'shopName', label: 'Shop Name',                  placeholder: 'e.g. Ravi General Store',   type: 'text' },
                      { id: 'contact-phone', name: 'phone',    label: 'Phone / WhatsApp Number',    placeholder: 'e.g. 98765 43210',          type: 'tel'  },
                    ].map(({ id, name, label, placeholder, type }) => (
                      <div key={id}>
                        <label htmlFor={id} className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {label}
                        </label>
                        <input
                          id={id}
                          name={name}
                          type={type}
                          value={form[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          required
                          className="zdeck-contact-input"
                        />
                      </div>
                    ))}

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Message (optional)
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your shop and what you need..."
                        rows={3}
                        className="zdeck-contact-input resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      id="contact-form-submit"
                      className="zdeck-pricing-btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>

                    <p className="text-center text-xs text-[#94A3B8]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      Or just{' '}
                      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold hover:underline">
                        WhatsApp us directly
                      </a>
                      {' '}— we respond fastest there.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="bg-[#F8FAFC] py-16 relative overflow-hidden" aria-labelledby="contact-cta-heading">
            <div className="zdeck-cta-orb" aria-hidden="true" />
            <div className="relative z-10 text-center px-4">
              <h2 id="contact-cta-heading" className="text-3xl sm:text-4xl font-black text-[#1E293B] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Ready to get started?
              </h2>
              <p className="text-[#64748B] mb-8 text-lg" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                The fastest way is a WhatsApp message. We'll have your shop live within the hour.
              </p>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" id="contact-bottom-wa-cta" className="zdeck-btn-primary">
                <MessageCircle className="w-5 h-5" />
                Get Started on WhatsApp
              </a>
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
