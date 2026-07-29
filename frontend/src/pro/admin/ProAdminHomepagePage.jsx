/**
 * ProAdminHomepagePage
 * Hero section settings editor for the Pro storefront home page.
 * Allows the shop owner to set:
 *  - Hero background image (uploaded to Cloudinary via backend)
 *  - Hero headline text
 *  - Hero subheading text
 *
 * PATCH /api/pro/admin/hero/
 */
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import api from '../../api/axios'
import ImageCropModal from '../../components/ImageCropModal'
import AiPromptHelperButton from '../../components/AiPromptHelperButton'

export default function ProAdminHomepagePage() {
  const qc = useQueryClient()
  const [toast, setToast] = useState(null)

  // Local form state
  const [headline, setHeadline] = useState('')
  const [subheading, setSubheading] = useState('')

  // Desktop image
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Mobile image
  const [mobileImageFile, setMobileImageFile] = useState(null)
  const [mobileImagePreview, setMobileImagePreview] = useState('')

  const [dirty, setDirty] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState('desktop') // 'desktop' | 'mobile'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch current hero settings ──────────────────────────────────────────────
  const { data: heroData, isLoading } = useQuery({
    queryKey: ['pro-admin-hero'],
    queryFn: () => api.get('pro/admin/hero/').then(r => r.data),
  })

  // Populate form once data loads
  useEffect(() => {
    if (heroData) {
      setHeadline(heroData.hero_headline || '')
      setSubheading(heroData.hero_subheading || '')
      setImagePreview(heroData.hero_image_url || '')
      setMobileImagePreview(heroData.hero_mobile_image_url || '')
      setDirty(false)
    }
  }, [heroData])

  // ── Save mutation ────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (fd) => api.patch('pro/admin/hero/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pro-admin-hero'] })
      qc.invalidateQueries({ queryKey: ['pro-store'] })
      setDirty(false)
      setImageFile(null)
      setMobileImageFile(null)
      showToast('Hero settings saved successfully.')
    },
    onError: () => showToast('Failed to save settings. Try again.', 'error'),
  })

  // ── Image pick & crop setup ──────────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState(null)
  const [cropTarget, setCropTarget] = useState('desktop') // 'desktop' | 'mobile'

  const handleImagePick = (e, target = 'desktop') => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropTarget(target)
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = async (croppedBlob) => {
    const target = cropTarget
    setCropSrc(null)
    try {
      const fileName = target === 'mobile' ? 'hero_mobile.jpg' : 'hero_desktop.jpg'
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })
      // High-quality, high-resolution compression parameters (max 10MB, up to 3840px 4K) to avoid quality loss
      const compressed = await imageCompression(croppedFile, { maxSizeMB: 10, maxWidthOrHeight: 3840, useWebWorker: true })
      
      if (target === 'mobile') {
        setMobileImageFile(compressed)
        setMobileImagePreview(URL.createObjectURL(compressed))
      } else {
        setImageFile(compressed)
        setImagePreview(URL.createObjectURL(compressed))
      }
    } catch {
      if (target === 'mobile') {
        setMobileImageFile(croppedBlob)
        setMobileImagePreview(URL.createObjectURL(croppedBlob))
      } else {
        setImageFile(croppedBlob)
        setImagePreview(URL.createObjectURL(croppedBlob))
      }
    }
    setDirty(true)
  }

  const handleClearImage = (target = 'desktop') => {
    if (target === 'mobile') {
      setMobileImageFile(null)
      setMobileImagePreview('')
    } else {
      setImageFile(null)
      setImagePreview('')
    }
    setDirty(true)
  }

  const handleSave = () => {
    const fd = new FormData()
    fd.append('hero_headline', headline)
    fd.append('hero_subheading', subheading)

    if (imageFile) {
      fd.append('image', imageFile)
    } else if (!imagePreview && heroData?.hero_image_url) {
      fd.append('clear_image', 'true')
    }

    if (mobileImageFile) {
      fd.append('mobile_image', mobileImageFile)
    } else if (!mobileImagePreview && heroData?.hero_mobile_image_url) {
      fd.append('clear_mobile_image', 'true')
    }

    saveMutation.mutate(fd)
  }

  // ── Derived for previews ──────────────────────────────────────────────────────
  const defaultBg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop'
  const desktopPreviewBg = imagePreview || defaultBg
  const mobilePreviewBg = mobileImagePreview || imagePreview || defaultBg

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 lg:py-12 space-y-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-black text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-[32px] sm:leading-[40px] font-normal text-black">
            Homepage Settings
          </h2>
          <p className="text-sm sm:text-base text-[#4c4546] mt-1 sm:mt-2 max-w-lg">
            Customise the hero banner at the top of your storefront. Upload high-res images tailored separately for desktop laptops and mobile screens.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !dirty}
          className="bg-black text-white px-8 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold flex items-center gap-2 hover:bg-[#333] transition-all active:scale-95 disabled:opacity-40 self-start sm:self-auto"
        >
          {saveMutation.isPending && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Save Changes
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Left Column: Form Settings (7 cols) ───────────────────────── */}
          <div className="lg:col-span-7 bg-white border border-[#e2e2e2] p-6 lg:p-8 space-y-8">

            {/* Hero Headline */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-1">
                Hero Headline
              </label>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                The main title displayed on your hero banner.
                Leave blank to display your shop name.
              </p>
              <input
                type="text"
                value={headline}
                onChange={e => { setHeadline(e.target.value); setDirty(true) }}
                placeholder="e.g. New Arrivals 2025"
                maxLength={200}
                className="w-full py-2 bg-transparent border-b border-black text-xl font-serif focus:outline-none placeholder:text-[#cfc4c5]"
              />
              <p className="text-right text-[10px] text-[#cfc4c5] mt-1">{headline.length}/200</p>
            </div>

            {/* Hero Subheading */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-1">
                Subheading <span className="text-[#cfc4c5] font-normal normal-case">(optional)</span>
              </label>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                A subtitle or tag-line below the main headline.
              </p>
              <input
                type="text"
                value={subheading}
                onChange={e => { setSubheading(e.target.value); setDirty(true) }}
                placeholder="e.g. Crafted for the understated."
                maxLength={300}
                className="w-full py-2 bg-transparent border-b border-[#e2e2e2] text-sm text-[#4c4546] focus:outline-none focus:border-black transition-colors placeholder:text-[#cfc4c5]"
              />
              <p className="text-right text-[10px] text-[#cfc4c5] mt-1">{subheading.length}/300</p>
            </div>

            <hr className="border-t border-[#f2f2f2]" />

            {/* Desktop Hero Image */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                  Desktop / Laptop Hero Image (Landscape)
                </label>
                <AiPromptHelperButton
                  shopName={heroData?.shop_name || ''}
                  slotName="Desktop Hero Banner"
                  dimensions="1920×1080"
                  aspectRatio="16:9 landscape"
                  contextText={headline || subheading}
                />
              </div>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                Used on laptops and desktop screens.<br />
                <strong className="text-[#1a1c1c]">Recommended: 1920×1080 px (16:9 Landscape). Full HD/4K quality preserved.</strong>
              </p>
              <label className="w-full h-40 border-2 border-dashed border-[#cfc4c5] flex flex-col items-center justify-center gap-2 hover:bg-[#f3f3f3] transition-colors cursor-pointer group relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, 'desktop')} />
                {imagePreview ? (
                  <img src={imagePreview} alt="desktop hero preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                ) : null}
                <span className="relative material-symbols-outlined text-[#cfc4c5] group-hover:text-black text-[36px] transition-colors">laptop</span>
                <p className="relative text-[11px] text-[#7e7576] group-hover:text-black transition-colors font-medium">
                  {imagePreview ? 'Click to change desktop image' : 'Upload Desktop Image (Landscape)'}
                </p>
                {!imagePreview && (
                  <p className="relative text-[10px] text-[#cfc4c5] font-sans">PNG, JPG, WEBP · High resolution preserved</p>
                )}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => handleClearImage('desktop')}
                  className="mt-2 text-[11px] text-[#7e7576] hover:text-[#ba1a1a] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Remove desktop image
                </button>
              )}
            </div>

            <hr className="border-t border-[#f2f2f2]" />

            {/* Mobile Hero Image */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                  Mobile Hero Image (Portrait / Mobile Preferred)
                </label>
                <AiPromptHelperButton
                  shopName={heroData?.shop_name || ''}
                  slotName="Mobile Hero Banner"
                  dimensions="1080×1920"
                  aspectRatio="9:16 portrait"
                  contextText={headline || subheading}
                />
              </div>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                Displayed exclusively on phones &amp; mobile browsers for perfect framing.<br />
                <strong className="text-[#1a1c1c]">Recommended: 1080×1920 px (9:16 Portrait). If unassigned, falls back to desktop image.</strong>
              </p>
              <label className="w-full h-44 border-2 border-dashed border-[#cfc4c5] flex flex-col items-center justify-center gap-2 hover:bg-[#f3f3f3] transition-colors cursor-pointer group relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, 'mobile')} />
                {mobileImagePreview ? (
                  <img src={mobileImagePreview} alt="mobile hero preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                ) : null}
                <span className="relative material-symbols-outlined text-[#cfc4c5] group-hover:text-black text-[36px] transition-colors">smartphone</span>
                <p className="relative text-[11px] text-[#7e7576] group-hover:text-black transition-colors font-medium">
                  {mobileImagePreview ? 'Click to change mobile image' : 'Upload Mobile Image (Portrait)'}
                </p>
                {!mobileImagePreview && (
                  <p className="relative text-[10px] text-[#cfc4c5] font-sans">PNG, JPG, WEBP · Optimized for mobile screens</p>
                )}
              </label>
              {mobileImagePreview && (
                <button
                  type="button"
                  onClick={() => handleClearImage('mobile')}
                  className="mt-2 text-[11px] text-[#7e7576] hover:text-[#ba1a1a] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Remove mobile image (fallback to desktop)
                </button>
              )}
            </div>

          </div>

          {/* ── Right Column: Interactive Live Preview (5 cols) ─────────────── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">Live Preview</p>
              
              {/* Preview Mode Switcher */}
              <div className="flex bg-[#eeeeee] p-0.5 rounded text-[11px] uppercase tracking-wider font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('desktop')}
                  className={`px-3 py-1 transition-all rounded ${
                    activePreviewTab === 'desktop' ? 'bg-black text-white' : 'text-[#4c4546] hover:text-black'
                  }`}
                >
                  Laptop
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('mobile')}
                  className={`px-3 py-1 transition-all rounded ${
                    activePreviewTab === 'mobile' ? 'bg-black text-white' : 'text-[#4c4546] hover:text-black'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Desktop Preview */}
            {activePreviewTab === 'desktop' ? (
              <div className="space-y-2">
                <div
                  className="relative w-full h-72 lg:h-96 bg-cover bg-center overflow-hidden border border-[#e2e2e2] shadow-sm transition-all"
                  style={{ backgroundImage: `url(${desktopPreviewBg})` }}
                >
                  {/* Darkening overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                  {/* Hero copy */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    {headline ? (
                      <>
                        <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-tight leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                          {headline}
                        </h2>
                        {subheading && (
                          <p className="text-white/80 text-sm mt-2 max-w-sm font-sans">{subheading}</p>
                        )}
                      </>
                    ) : (
                      <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-tight leading-tight opacity-50" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                        Shop Name
                      </h2>
                    )}
                    <div className="mt-4 inline-block bg-white text-black text-[10px] font-semibold uppercase tracking-widest px-5 py-2">
                      Shop Collection
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#7e7576] font-sans">
                  Showing Desktop Landscape layout preview.
                </p>
              </div>
            ) : (
              /* Mobile Preview Frame */
              <div className="flex flex-col items-center">
                <div className="w-[280px] h-[520px] bg-black rounded-[36px] p-3 shadow-xl border-4 border-[#333] relative overflow-hidden">
                  {/* Phone Speaker notch */}
                  <div className="w-20 h-4 bg-black rounded-b-xl mx-auto absolute top-3 left-0 right-0 z-20" />
                  
                  {/* Screen Content */}
                  <div
                    className="w-full h-full rounded-[24px] bg-cover bg-center overflow-hidden relative flex flex-col justify-end p-5"
                    style={{ backgroundImage: `url(${mobilePreviewBg})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    <div className="relative z-10 text-white">
                      {headline ? (
                        <>
                          <h2 className="font-serif text-xl uppercase tracking-tight leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                            {headline}
                          </h2>
                          {subheading && (
                            <p className="text-white/80 text-xs mt-1.5 line-clamp-2 font-sans">{subheading}</p>
                          )}
                        </>
                      ) : (
                        <h2 className="font-serif text-xl uppercase tracking-tight leading-tight opacity-50" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                          Shop Name
                        </h2>
                      )}
                      <div className="mt-3 inline-block bg-white text-black text-[9px] font-semibold uppercase tracking-widest px-4 py-1.5">
                        Shop Collection
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#7e7576] mt-3 font-sans text-center">
                  Showing Mobile Portrait aspect ratio preview.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={cropTarget === 'mobile' ? 9 / 16 : 16 / 9}
          title={cropTarget === 'mobile' ? "Crop Mobile Hero Image (9:16 Portrait)" : "Crop Desktop Hero Image (16:9 Landscape)"}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
