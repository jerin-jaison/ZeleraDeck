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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [dirty, setDirty] = useState(false)

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
      setDirty(false)
    }
  }, [heroData])

  // ── Save mutation ────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (fd) => api.patch('pro/admin/hero/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pro-admin-hero'] })
      setDirty(false)
      setImageFile(null)
      showToast('Hero settings saved.')
    },
    onError: () => showToast('Failed to save. Try again.', 'error'),
  })

  // ── Image pick + compression ─────────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState(null)

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = async (croppedBlob) => {
    setCropSrc(null)
    try {
      const croppedFile = new File([croppedBlob], 'hero.jpg', { type: 'image/jpeg' })
      const c = await imageCompression(croppedFile, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true })
      setImageFile(c)
      setImagePreview(URL.createObjectURL(c))
    } catch {
      setImageFile(croppedBlob)
      setImagePreview(URL.createObjectURL(croppedBlob))
    }
    setDirty(true)
  }

  const handleClearImage = () => {
    setImageFile(null)
    setImagePreview('')
    setDirty(true)
  }

  const handleSave = () => {
    const fd = new FormData()
    fd.append('hero_headline', headline)
    fd.append('hero_subheading', subheading)
    if (imageFile) {
      fd.append('image', imageFile)
    } else if (!imagePreview && heroData?.hero_image_url) {
      // User cleared the image
      fd.append('clear_image', 'true')
    }
    saveMutation.mutate(fd)
  }

  // ── Derived for preview ──────────────────────────────────────────────────────
  const previewBg = imagePreview || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPPacGlGJcNCa7Y_w6CK9ySdWJkCz-hjTeggQEm8dEPbrX2tUH3Ap-_CB5vTPgmQADInQofSoTwECvBDb1hqUNVHQ2bPk09C-ShNjuhdCAwktS1bUg20JWoloF9lTHiwGDodr9u8qbdAMhUnYrnC3RauOa55R4Zo6wxHhJXF9bOV1RCX29ZN9T6E1DcUM7tY7NwdJMeadnphFI6M_nesh1l1R3LNyC3KzJqINoRhux4sNsqw19CCU'

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
            Customise the hero section at the top of your public storefront. Set a headline, subheading, and background image.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Left: Form ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-[#e2e2e2] p-6 lg:p-8 space-y-8">

            {/* Hero Headline */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-1">
                Hero Headline
              </label>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                The large text in the centre of your homepage hero.
                E.g. <em>"New Arrivals 2025"</em> or <em>"Curated Elegance"</em>.
                Leave blank to show your shop name.
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
                A short line below the headline — a tagline or seasonal message. Max 2 lines.
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

            {/* Hero Background Image */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                  Hero Background Image
                </label>
                <AiPromptHelperButton
                  shopName={heroData?.shop_name || ''}
                  slotName="Hero Banner"
                  dimensions="1920×1080"
                  aspectRatio="16:9 landscape"
                  contextText={headline || subheading}
                />
              </div>
              <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
                Full-width background image for the hero section.<br />
                <strong className="text-[#1a1c1c]">Recommended: 1920×1080 px, landscape (16:9).</strong><br />
                The image will be darkened automatically so your text stays readable.<br />
                <span className="text-[#cfc4c5]">Optional — a clean fallback image is used if not set.</span>
              </p>
              <label className="w-full h-40 border-2 border-dashed border-[#cfc4c5] flex flex-col items-center justify-center gap-2 hover:bg-[#f3f3f3] transition-colors cursor-pointer group relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                {imagePreview ? (
                  <img src={imagePreview} alt="hero preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                ) : null}
                <span className="relative material-symbols-outlined text-[#cfc4c5] group-hover:text-black text-[36px] transition-colors">cloud_upload</span>
                <p className="relative text-[11px] text-[#7e7576] group-hover:text-black transition-colors">
                  {imagePreview ? 'Click to change image' : 'Click or drag & drop to upload'}
                </p>
                {!imagePreview && (
                  <p className="relative text-[10px] text-[#cfc4c5] font-sans">PNG, JPG, WEBP · Max 10 MB · 1920×1080 landscape</p>
                )}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="mt-2 text-[11px] text-[#7e7576] hover:text-[#ba1a1a] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Remove image (use default)
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Live Preview ─────────────────────────────────────────── */}
          <div>
            <p className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-3">Live Preview</p>
            <div
              className="relative w-full h-72 lg:h-96 bg-cover bg-center overflow-hidden border border-[#e2e2e2]"
              style={{ backgroundImage: `url(${previewBg})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {/* Hero copy */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {headline ? (
                  <>
                    <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-tight leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                      {headline}
                    </h2>
                    {subheading && (
                      <p className="text-white/70 text-sm mt-2 max-w-sm">{subheading}</p>
                    )}
                  </>
                ) : (
                  <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-tight leading-tight opacity-40" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                    Your shop name here
                  </h2>
                )}
                <div className="mt-4 inline-block bg-white text-black text-[10px] font-semibold uppercase tracking-widest px-5 py-2">
                  Shop Collection
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#cfc4c5] mt-2 font-sans">
              Preview is approximate. Actual hero on your store is full-screen height.
            </p>
          </div>

        </div>
      )}

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={16 / 9}
          title="Crop Hero Image (16:9 Landscape)"
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
