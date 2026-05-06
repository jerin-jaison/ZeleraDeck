import { useState } from 'react'
import { MessageCircle, Mail, Phone, CheckCircle, Send } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA_NUMBER = '917012783442'
const WA_URL = `https://wa.me/${WA_NUMBER}`
const PHONE_DISPLAY = '+91 70127 83442'
const EMAIL = 'admin@zeleradeck.com'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', shopName: '', phone: '' })
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
        description="Get in touch with ZeleraDeck. WhatsApp us at +91 70127 83442 or fill the form. We respond within 24 hours."
        url="https://zeleradeck.com/contact"
        keywords="contact zeleradeck, zeleradeck support, WhatsApp Kerala shop catalogue"
      />
      <div className="bg-[#F8F8F8] min-h-screen pb-16" style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <PublicNavbar />

        <main className="max-w-lg mx-auto px-4 py-10 space-y-4">

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-[#0A0A0A]">Get in Touch</h1>
            <p className="text-sm text-[#737373] mt-2">We respond within 24 hours — in English or Malayalam.</p>
          </div>

          {/* Direct contact buttons */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-3">
            <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Reach us directly</p>

            <a href={WA_URL} target="_blank" rel="noopener noreferrer" id="contact-wa-btn"
              className="flex items-center gap-3 bg-[#25D366] text-white rounded-xl px-4 py-3.5 hover:bg-[#1ebe5d] transition-colors">
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">WhatsApp Us</p>
                <p className="text-xs text-white/70">{PHONE_DISPLAY}</p>
              </div>
            </a>

            <a href={`tel:${WA_NUMBER}`} id="contact-phone-btn"
              className="flex items-center gap-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl px-4 py-3.5 hover:bg-[#F0F0F0] transition-colors">
              <Phone className="w-5 h-5 text-[#0A0A0A] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Call Us</p>
                <p className="text-xs text-[#737373]">{PHONE_DISPLAY}</p>
              </div>
            </a>

            <a href={`mailto:${EMAIL}`} id="contact-email-btn"
              className="flex items-center gap-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl px-4 py-3.5 hover:bg-[#F0F0F0] transition-colors">
              <Mail className="w-5 h-5 text-[#0A0A0A] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Email Us</p>
                <p className="text-xs text-[#737373]">{EMAIL}</p>
              </div>
            </a>
          </div>

          {/* Contact form */}
          {submitted ? (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8 text-center">
              <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-[#16A34A]" />
              </div>
              <h2 className="text-lg font-bold text-[#0A0A0A] mt-4">We'll reach you soon!</h2>
              <p className="text-sm text-[#737373] mt-2">
                We'll reach you on WhatsApp within 24 hours. Keep an eye on your messages from{' '}
                <strong>{PHONE_DISPLAY}</strong>.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', shopName: '', phone: '' }) }}
                className="mt-6 w-full border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F8F8F8] transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4"
            >
              <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Or send us a message</p>

              <div>
                <label htmlFor="contact-name" className="text-xs text-[#737373] block mb-1.5">Your Name</label>
                <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="e.g. Ravi Kumar" required
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white" />
              </div>

              <div>
                <label htmlFor="contact-shop" className="text-xs text-[#737373] block mb-1.5">Shop Name</label>
                <input id="contact-shop" name="shopName" type="text" value={form.shopName} onChange={handleChange}
                  placeholder="e.g. Ravi General Store" required
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white" />
              </div>

              <div>
                <label htmlFor="contact-phone" className="text-xs text-[#737373] block mb-1.5">Phone / WhatsApp Number</label>
                <input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="e.g. 98765 43210" required
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white" />
              </div>

              <button type="submit" id="contact-form-submit"
                className="w-full bg-[#0A0A0A] text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors">
                <Send className="w-4 h-4" />
                Send Message
              </button>
              <p className="text-[10px] text-[#A3A3A3] text-center">We respond within 24 hours on WhatsApp.</p>
            </form>
          )}
        </main>
      </div>
    </>
  )
}
