import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const SUPPORT_WA = '917012783442'
const SUPPORT_WA2 = '919562670230'
const SUPPORT_EMAIL = 'teamzelera@gmail.com'

const CATEGORIES = [
  'Cannot login / forgot password',
  'Product upload issue',
  'Store not showing',
  'Payment / subscription',
  'Feature request',
  'Other',
]

export default function ContactPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const text =
      `*ZeleraDeck Support Request*\n\n` +
      `*Name:* ${name || 'Not provided'}\n` +
      `*Phone:* ${phone || 'Not provided'}\n` +
      `*Issue:* ${category || 'General'}\n\n` +
      `*Message:*\n${message.trim()}`

    window.open(`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(text)}`, '_blank')
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-[#F8F8F8] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-[#16A34A]" />
          </div>
          <h2 className="text-lg font-bold mt-4 text-[#0A0A0A]">WhatsApp Opened</h2>
          <p className="text-sm text-[#737373] mt-2">
            Your message is ready in WhatsApp. Just press <strong>Send</strong> to reach our team.
          </p>
          <p className="text-xs text-[#A3A3A3] mt-3">
            We typically reply within a few hours.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 w-full border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium text-[#0A0A0A]"
          >
            Send Another
          </button>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 w-full text-xs text-[#A3A3A3] underline"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Contact Support — ZeleraDeck"
        description="Get help from the ZeleraDeck team. Reach us on WhatsApp or email for any issues with your digital shop catalogue."
        url="https://zeleradeck.com/contact"
        keywords="zeleradeck support, contact zeleradeck, help zeleradeck, shop catalogue support Kerala"
      />
    <div className="bg-[#F8F8F8] min-h-screen pb-12" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] px-4 py-4 flex items-center gap-3 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-[#0A0A0A]" />
        </button>
        <h1 className="text-base font-bold text-[#0A0A0A]">Contact Support</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 mb-4">
          <p className="text-sm font-semibold text-[#0A0A0A]">We're here to help 👋</p>
          <p className="text-xs text-[#737373] mt-1">
            Describe your issue below and we'll respond on WhatsApp as soon as possible.
          </p>

          {/* Quick contact links */}
          <div className="flex gap-2 mt-4">
            <a
              href={`https://wa.me/${SUPPORT_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] text-white rounded-xl py-2.5 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex-1 border border-[#E5E5E5] rounded-xl py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 text-[#0A0A0A]"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Us
            </a>
          </div>
          <p className="text-[10px] text-[#A3A3A3] mt-2 text-center">{SUPPORT_EMAIL}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#F0F0F0] p-5">
          <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-4">Send a Message</p>

          {/* Name */}
          <div className="mb-4">
            <label className="text-xs text-[#737373] block mb-1.5">Your Name <span className="text-[#A3A3A3]">(optional)</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="text-xs text-[#737373] block mb-1.5">Your Phone / WhatsApp <span className="text-[#A3A3A3]">(optional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs text-[#737373] block mb-1.5">What's the issue? <span className="text-[#A3A3A3]">(optional)</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white appearance-none"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="text-xs text-[#737373] block mb-1.5">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Describe your issue in detail..."
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send via WhatsApp
          </button>
          <p className="text-[10px] text-[#A3A3A3] text-center mt-3">
            Pressing send will open WhatsApp with your message pre-filled.
          </p>
        </form>

        {/* Contact info footer */}
        <div className="mt-4 bg-white rounded-2xl border border-[#F0F0F0] p-5">
          <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-3">Our Support Numbers</p>
          {[SUPPORT_WA, SUPPORT_WA2].map((num) => {
            const display = num.replace('91', '+91 ').replace(/(\d{5})(\d{5})$/, '$1 $2')
            return (
              <a
                key={num}
                href={`https://wa.me/${num}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2.5 border-b border-[#F8F8F8] last:border-0"
              >
                <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                </div>
                <span className="text-sm font-medium text-[#0A0A0A]">{display}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
    </>
  )
}
