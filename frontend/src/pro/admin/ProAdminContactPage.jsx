/**
 * ProAdminContactPage
 * Matches the Stitch "admin_edit_contact_info" design.
 * Fully responsive across all device sizes (mobile 320px+, tablet, desktop).
 *
 * Fields: address, city/postal, country, phone, WhatsApp override,
 *         email, business hours Mon-Sun, Google Maps embed URL, social links.
 * PATCH /api/pro/admin/contact/
 */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatGoogleMapsEmbedUrl } from '../ProContactPage'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const inputCls = 'w-full bg-transparent border-b border-black py-3 text-sm text-[#1a1c1c] focus:outline-none placeholder:text-[#cfc4c5] transition-colors focus:border-[#555]'

function SectionLabel({ children }) {
  return (
    <div className="col-span-full border-b border-[#e2e2e2] pb-2 mb-2 mt-4 first:mt-0">
      <label className="text-[12px] uppercase tracking-[0.1em] text-[#1a1c1c] font-semibold">{children}</label>
    </div>
  )
}

export default function ProAdminContactPage() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['pro-admin-contact', slug],
    queryFn: () => api.get('pro/admin/contact/').then(r => r.data),
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (payload) => api.patch('pro/admin/contact/', payload),
    onSuccess: (res) => {
      qc.setQueryData(['pro-admin-contact', slug], res.data)
      setForm(res.data)
      showToast('Contact info saved.')
    },
    onError: () => showToast('Failed to save. Try again.', 'error'),
  })

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form) return
    const payload = {
      ...form,
      google_maps_embed_url: formatGoogleMapsEmbedUrl(form.google_maps_embed_url || '', {
        city: form.city,
        addressLines: [form.address_line1, form.city, form.state].filter(Boolean)
      }),
    }
    saveMutation.mutate(payload)
  }

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-16 lg:py-12 w-full max-w-full overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-black text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="mb-6 sm:mb-8 lg:mb-12">
        <h2 className="font-serif text-2xl sm:text-[36px] md:text-[48px] sm:leading-[44px] md:leading-[56px] font-normal text-black mb-2">
          Contact Details
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#4c4546] max-w-xl leading-relaxed">
          Configure the public contact information for your storefront. This data will be visible on your customer-facing website.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 lg:gap-y-8 w-full">

          {/* Store Address */}
          <SectionLabel>Store Address</SectionLabel>
          <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={form.address_line1 || ''}
                onChange={e => set('address_line1', e.target.value)}
                placeholder="Street Address"
                className={inputCls}
              />
            </div>
            <div>
              <input
                type="text"
                value={form.address_line2 || ''}
                onChange={e => set('address_line2', e.target.value)}
                placeholder="Suite / Floor"
                className={inputCls}
              />
            </div>
          </div>

          {/* Location Identity */}
          <SectionLabel>Location Identity</SectionLabel>
          <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={form.city || ''}
                onChange={e => set('city', e.target.value)}
                placeholder="City"
                className={inputCls}
              />
            </div>
            <div>
              <input
                type="text"
                value={form.postal_code || ''}
                onChange={e => set('postal_code', e.target.value)}
                placeholder="Postal Code"
                className={inputCls}
              />
            </div>
          </div>

          {/* State & Country */}
          <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">State</label>
              <input
                type="text"
                value={form.state || ''}
                onChange={e => set('state', e.target.value)}
                placeholder="Kerala"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">Country</label>
              <input
                type="text"
                value={form.country || ''}
                onChange={e => set('country', e.target.value)}
                placeholder="India"
                className={inputCls}
              />
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">Phone</label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">WhatsApp Business</label>
              <input
                type="tel"
                value={form.whatsapp_override || ''}
                onChange={e => set('whatsapp_override', e.target.value)}
                placeholder="Defaults to shop phone if blank"
                className={`${inputCls} border-[#cfc4c5]`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="col-span-full">
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">Inquiry Email</label>
            <input
              type="email"
              value={form.email || ''}
              onChange={e => set('email', e.target.value)}
              placeholder="hello@yourstore.com"
              className={inputCls}
            />
          </div>

          {/* Business Hours */}
          <div className="col-span-full pt-2">
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-4">Business Hours</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
              {DAYS.map((day, i) => (
                <div key={day} className="flex flex-col items-center border border-[#e2e2e2] hover:border-black transition-colors p-2 sm:p-3 min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#4c4546] mb-1 sm:mb-2">
                    {DAY_LABELS[i]}
                  </span>
                  <input
                    type="text"
                    value={form[`hours_${day}`] || ''}
                    onChange={e => set(`hours_${day}`, e.target.value)}
                    placeholder="Closed"
                    className="w-full min-w-0 text-center text-[11px] bg-transparent border-none focus:outline-none focus:ring-0 text-[#1a1c1c] placeholder:text-[#cfc4c5]"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#7e7576] mt-2">Format: 10:00–20:00 or leave blank for Closed</p>
          </div>

          {/* Google Maps */}
          <div className="col-span-full pt-2">
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-3">
              Google Maps Location / Embed URL
            </label>
            <input
              type="text"
              value={form.google_maps_embed_url || ''}
              onChange={e => set('google_maps_embed_url', e.target.value)}
              onBlur={e => {
                const formatted = formatGoogleMapsEmbedUrl(e.target.value);
                if (formatted !== e.target.value) set('google_maps_embed_url', formatted);
              }}
              placeholder="Paste Google Maps URL, embed iframe code, or address..."
              className={`${inputCls} border-[#cfc4c5]`}
            />
            <p className="text-[11px] text-[#7e7576] mt-1 font-sans leading-relaxed">
              Paste your Google Maps link, full <code className="bg-[#f3f3f3] px-1 py-0.5">&lt;iframe&gt;</code> code, or store address (e.g. <em>"Kochi, Kerala"</em>). Automatically converted to a working map embed.
            </p>
          </div>

          {/* Social Links */}
          <div className="col-span-full pt-2">
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold border-b border-[#e2e2e2] pb-2 mb-4">
              Social Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
              <div>
                <div className="flex items-center gap-2 border-b border-[#cfc4c5] pb-2 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4c4546]">photo_camera</span>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">Instagram</label>
                </div>
                <input
                  type="url"
                  value={form.instagram_url || ''}
                  onChange={e => set('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/yourshop"
                  className={`${inputCls} border-[#cfc4c5] text-sm`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 border-b border-[#cfc4c5] pb-2 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4c4546]">thumb_up</span>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">Facebook</label>
                </div>
                <input
                  type="url"
                  value={form.facebook_url || ''}
                  onChange={e => set('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/yourshop"
                  className={`${inputCls} border-[#cfc4c5] text-sm`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 border-b border-[#cfc4c5] pb-2 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4c4546]">smart_display</span>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">YouTube</label>
                </div>
                <input
                  type="url"
                  value={form.youtube_url || ''}
                  onChange={e => set('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@yourshop"
                  className={`${inputCls} border-[#cfc4c5] text-sm`}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="col-span-full pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-4 sm:gap-6 border-t border-[#e2e2e2] mt-4">
            <button
              type="button"
              onClick={() => setForm(data)}
              disabled={saveMutation.isPending}
              className="text-[12px] uppercase tracking-widest text-[#4c4546] hover:text-black transition-colors font-semibold disabled:opacity-50 text-center py-2 sm:py-0"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-black text-white px-8 sm:px-12 py-3.5 sm:py-4 text-[11px] sm:text-[12px] uppercase tracking-widest font-semibold hover:bg-[#333] transition-all duration-300 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saveMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Update Store Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
