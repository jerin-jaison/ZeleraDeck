/**
 * ProAdminProductFormPage
 * Add (mode=add) or Edit (mode=edit) a product.
 *
 * Design: matches the Stitch "admin_edit_product" screen —
 *   three column sections: Core Essentials, Curation (sizes/colors), Specifications, Media Library.
 * Reuses the existing shop/products/ endpoints + same Cloudinary direct-upload as the main dashboard.
 * The form is split into sections with a sticky footer Save/Cancel bar.
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import api from '../../api/axios'
import ImageCropModal from '../../components/ImageCropModal'
import AiPromptHelperButton from '../../components/AiPromptHelperButton'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Cloudinary config (same as ProductForm.jsx) ─────────────────────────────
const CLOUD_NAME = 'de7f6rnco'
const UPLOAD_PRESET = 'zeleradeck_video'
const VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
const DELETE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`

async function deleteRejectedUpload(token) {
  if (!token) return
  try {
    await fetch(DELETE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  } catch { /* best-effort */ }
}

// ── Image slot ────────────────────────────────────────────────────────────────
function ImageSlot({ label, previewUrl, onChange, compressionInfo }) {
  const ref = useRef()
  return (
    <div
      className="aspect-square border border-dashed border-[#cfc4c5] flex flex-col items-center justify-center cursor-pointer hover:bg-[#f3f3f3] transition-all group relative overflow-hidden"
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { onChange(e); e.target.value = '' }}
      />
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : null}
      <div className={`relative z-10 flex flex-col items-center gap-1 ${previewUrl ? 'bg-black/40 absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center' : ''}`}>
        <span className="material-symbols-outlined text-[#7e7576] group-hover:text-black text-[28px]">
          {previewUrl ? 'edit' : 'image'}
        </span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#7e7576] group-hover:text-black font-semibold">
          {previewUrl ? 'Change' : label}
        </span>
      </div>
      {compressionInfo && (
        <p className="absolute bottom-1 left-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.5 text-center truncate rounded font-mono">
          {compressionInfo}
        </p>
      )}
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function FormSection({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-8 lg:py-16 border-b border-[#e2e2e2]">
      <div className="col-span-1 lg:col-span-4">
        <h2 className="font-serif text-xl sm:text-[28px] sm:leading-[36px] font-normal text-black border-b border-[#e2e2e2] pb-3 lg:pb-4 mb-3 lg:mb-4">
          {title}
        </h2>
        <p className="text-sm text-[#4c4546] leading-relaxed">{description}</p>
      </div>
      <div className="col-span-1 lg:col-span-8 space-y-6 lg:space-y-8">{children}</div>
    </section>
  )
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-transparent border-b border-black py-3 text-base text-[#1a1c1c] focus:outline-none placeholder:text-[#cfc4c5] transition-colors focus:border-[#555]'
const textareaCls = `${inputCls} resize-none`

export default function ProAdminProductFormPage({ mode = 'add' }) {
  const { slug, displayId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Core fields
  const NUMERIC_SIZES = ['36', '38', '40', '42', '44', '46']
  const ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const PRESET_COLORS = [
    { name: 'None', hex: 'none' },
    { name: 'Noir', hex: '#000000' },
    { name: 'Alabaster', hex: '#F5F5DC' },
    { name: 'Olive', hex: '#4B5320' },
    { name: 'Umber', hex: '#3B2F2F' },
    { name: 'Navy', hex: '#0A192F' },
    { name: 'Terracotta', hex: '#D96B43' },
    { name: 'Sage', hex: '#8A9A86' },
    { name: 'Oatmeal', hex: '#E3D9C6' },
    { name: 'Charcoal', hex: '#333333' },
    { name: 'Blush', hex: '#DE5D83' },
    { name: 'Camel', hex: '#C19A6B' },
  ]

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [inStock, setInStock] = useState(true)
  const [sizeScheme, setSizeScheme] = useState('numeric')
  const [selectedSizes, setSelectedSizes] = useState(['38', '40', '42', '44'])
  const [selectedColors, setSelectedColors] = useState(['Noir', 'Alabaster'])
  const [customColorInput, setCustomColorInput] = useState('')
  const [colorsExpanded, setColorsExpanded] = useState(false)

  // Images (4 slots)
  const [previewUrls, setPreviewUrls] = useState(['', '', '', ''])
  const [imageFiles, setImageFiles] = useState([null, null, null, null])

  // Video
  const xhrRef = useRef(null)
  const videoRef = useRef()
  const [videoCloudUrl, setVideoCloudUrl] = useState('')
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoError, setVideoError] = useState('')
  const [videoOriginalSize, setVideoOriginalSize] = useState(0)
  const [videoCompressedSize, setVideoCompressedSize] = useState(0)

  // UI state
  const [saving, setSaving] = useState(false)
  const [uploadPct, setUploadPct] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch categories using pro admin categories endpoint
  const { data: catData } = useQuery({
    queryKey: ['pro-admin-categories'],
    queryFn: () => api.get('pro/admin/categories/').then(r => r.data),
  })
  const categories = catData || []

  // If editing, fetch existing product
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['shop-product-detail', displayId],
    queryFn: () => api.get(`shop/products/${displayId}/`).then(r => r.data),
    enabled: mode === 'edit' && !!displayId,
  })

  useEffect(() => {
    if (productData) {
      setName(productData.name || '')
      setDescription(productData.description || '')
      setPrice(productData.price || '')
      setDiscount(productData.discount_percent ? String(productData.discount_percent) : '')
      setCategoryId(productData.category?.id || null)
      setInStock(productData.is_in_stock ?? true)
      setSizeScheme(productData.size_scheme || 'numeric')
      if (Array.isArray(productData.available_sizes) && productData.available_sizes.length > 0) {
        setSelectedSizes(productData.available_sizes)
      }
      if (Array.isArray(productData.available_colors) && productData.available_colors.length > 0) {
        setSelectedColors(productData.available_colors)
      }
      setPreviewUrls([
        productData.image_url || '',
        productData.image_url_2 || '',
        productData.image_url_3 || '',
        productData.image_url_4 || '',
      ])
      if (productData.video_url) {
        setVideoCloudUrl(productData.video_url)
        setVideoPreviewUrl(productData.video_url)
      }
    }
  }, [productData])

  // Image cropping & compression
  const [cropTarget, setCropTarget] = useState(null) // { slotIdx, file, rawUrl, originalSize }
  const [compressionInfos, setCompressionInfos] = useState(['', '', '', ''])

  // ── Image handlers ──────────────────────────────────────────────────────────
  const handleImagePick = (e, slotIdx) => {
    const file = e.target.files?.[0]
    if (!file) return
    const rawUrl = URL.createObjectURL(file)
    setCropTarget({ slotIdx, file, rawUrl, originalSize: file.size })
  }

  const handleCropComplete = async (croppedBlob) => {
    if (!cropTarget) return
    const { slotIdx, originalSize } = cropTarget
    setCropTarget(null)

    try {
      const croppedFile = new File([croppedBlob], `product_slot_${slotIdx + 1}.jpg`, { type: 'image/jpeg' })
      const compressed = await imageCompression(croppedFile, {
        maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true,
      })
      const savedBytes = originalSize > compressed.size ? originalSize - compressed.size : 0
      const pct = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0
      const infoText = `${formatBytes(originalSize)} → ${formatBytes(compressed.size)} (-${pct}%)`

      const newFiles = [...imageFiles]; newFiles[slotIdx] = compressed; setImageFiles(newFiles)
      const newPreviews = [...previewUrls]; newPreviews[slotIdx] = URL.createObjectURL(compressed); setPreviewUrls(newPreviews)
      const newInfos = [...compressionInfos]; newInfos[slotIdx] = infoText; setCompressionInfos(newInfos)
    } catch {
      const newFiles = [...imageFiles]; newFiles[slotIdx] = cropTarget.file; setImageFiles(newFiles)
      const newPreviews = [...previewUrls]; newPreviews[slotIdx] = cropTarget.rawUrl; setPreviewUrls(newPreviews)
    }
  }

  // ── Video handlers ──────────────────────────────────────────────────────────
  const handleVideoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setVideoError('')
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(file.type)) { setVideoError('Please use mp4, mov, or webm.'); return }
    if (file.size > 100 * 1024 * 1024) { setVideoError('File too large. Use a clip under 2 minutes.'); return }
    setVideoOriginalSize(file.size)
    setVideoCompressedSize(0)
    setVideoCloudUrl('')
    setVideoPreviewUrl('')
    setVideoUploading(true)
    setVideoProgress(0)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    xhr.upload.addEventListener('progress', ev => {
      if (ev.lengthComputable) setVideoProgress(Math.round((ev.loaded / ev.total) * 100))
    })
    xhr.addEventListener('load', () => {
      setVideoUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText)
        const eager = result.eager?.[0]
        const url = eager?.secure_url || result.secure_url
        const bytes = eager?.bytes || result.bytes || 0
        if (bytes > 5 * 1024 * 1024) {
          deleteRejectedUpload(result.delete_token)
          setVideoError(`Video too large after compression (${formatBytes(bytes)}). Use a shorter clip.`)
          setVideoCompressedSize(bytes)
          return
        }
        setVideoCloudUrl(url)
        setVideoPreviewUrl(url)
        setVideoCompressedSize(bytes)
      } else {
        setVideoError('Upload failed. Try again.')
      }
    })
    xhr.addEventListener('error', () => { setVideoUploading(false); setVideoError('Upload failed. Check your connection.') })
    xhr.addEventListener('abort', () => setVideoUploading(false))
    xhr.open('POST', VIDEO_UPLOAD_URL)
    xhr.send(fd)
  }

  const removeVideo = () => {
    if (xhrRef.current) xhrRef.current.abort()
    setVideoCloudUrl(''); setVideoPreviewUrl('')
    setVideoError(''); setVideoUploading(false)
    setVideoProgress(0); setVideoOriginalSize(0); setVideoCompressedSize(0)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (videoUploading) return

    const fd = new FormData()
    fd.append('name', name)
    fd.append('price', price)
    fd.append('description', description)
    fd.append('is_in_stock', inStock)
    fd.append('discount_percent', discount ? parseInt(discount, 10) : 0)
    fd.append('size_scheme', sizeScheme)
    fd.append('available_sizes', JSON.stringify(selectedSizes))
    fd.append('available_colors', JSON.stringify(selectedColors))
    if (categoryId) fd.append('category_id', categoryId)
    if (imageFiles[0]) fd.append('image', imageFiles[0])
    if (imageFiles[1]) fd.append('image_2', imageFiles[1])
    if (imageFiles[2]) fd.append('image_3', imageFiles[2])
    if (imageFiles[3]) fd.append('image_4', imageFiles[3])
    if (videoCloudUrl) {
      fd.append('video_url', videoCloudUrl)
      if (videoCompressedSize > 0) fd.append('video_compressed_bytes', videoCompressedSize)
    }

    setSaving(true)
    setUploadPct(0)
    try {
      if (mode === 'add') {
        await api.post('shop/products/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: ev => {
            const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0
            setUploadPct(pct)
          },
        })
        showToast('Product added!')
      } else {
        // Edit: primary image is required only if none exists. Use PATCH.
        await api.patch(`shop/products/${displayId}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: ev => {
            const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0
            setUploadPct(pct)
          },
        })
        showToast('Product saved!')
      }
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      setTimeout(() => navigate(`/pro-admin/${slug}/products`, { replace: true }), 1200)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Save failed. Try again.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
      setUploadPct(null)
    }
  }

  const IMAGE_LABELS = ['Main Image', 'Side Profile', 'Macro Detail', 'Model View']
  const isLoadingExisting = mode === 'edit' && productLoading

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 pb-32">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-black text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="pt-6 sm:pt-12 mb-6 sm:mb-12">
        <h1 className="font-serif text-2xl sm:text-[48px] sm:leading-[56px] font-normal text-black mb-2">
          {mode === 'add' ? 'Add Product' : 'Edit Product'}
        </h1>
        <nav className="flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-[#7e7576]">
          <button onClick={() => navigate(`/pro-admin/${slug}/products`)} className="hover:text-black transition-colors">
            Products
          </button>
          <span>/</span>
          <span className="text-black">{mode === 'add' ? 'New Product' : (name || displayId)}</span>
        </nav>
      </header>

      {isLoadingExisting ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form id="pro-admin-product-form" onSubmit={handleSubmit} className="space-y-0">

          {/* ── Core Essentials ───────────────────────────────────────── */}
          <FormSection
            title="Core Essentials"
            description="Define the primary identity of the product. Focus on clarity and precision in naming and descriptions."
          >
            <Field label="Product Name">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter product title..."
                required
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Elaborate on the craftsmanship and details..."
                rows={5}
                className={textareaCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
              <Field label="Price (₹)">
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className={inputCls}
                />
              </Field>
              <Field label="Discount % (Optional)">
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={`${inputCls} border-[#cfc4c5]`}
                />
              </Field>
            </div>
            <Field label="Category">
              <div className="relative">
                <select
                  value={categoryId || ''}
                  onChange={e => setCategoryId(e.target.value || null)}
                  className={`${inputCls} cursor-pointer appearance-none pr-10`}
                >
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#7e7576]">
                  expand_more
                </span>
              </div>
            </Field>
            <div className="flex items-center justify-between bg-[#f3f3f3] px-5 py-4">
              <span className="text-sm text-[#1a1c1c]">Mark as In Stock</span>
              <button
                type="button"
                onClick={() => setInStock(v => !v)}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{ backgroundColor: inStock ? '#000000' : '#cfc4c5' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: inStock ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          </FormSection>



          {/* ── Media Library ─────────────────────────────────────────── */}
          <FormSection
            title="Media Library"
            description="Visual storytelling is paramount. Provide high-resolution captures — main silhouette, side profile, macro detail, and model view."
          >
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                Product Photography (3:4 Portrait)
              </label>
              <AiPromptHelperButton
                slotName="Product Catalog Photo"
                dimensions="1200×1600"
                aspectRatio="3:4 portrait"
                contextText={name}
              />
            </div>
            {/* 4 image slots */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <ImageSlot
                  key={i}
                  label={IMAGE_LABELS[i]}
                  previewUrl={previewUrls[i]}
                  compressionInfo={compressionInfos[i]}
                  onChange={e => handleImagePick(e, i)}
                />
              ))}
            </div>

            {/* Video slot */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-3">
                Product Video
                <span className="normal-case tracking-normal font-normal text-[#7e7576] ml-2">(optional · automatically optimized)</span>
              </label>
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/webm,.mov,video/quicktime"
                className="hidden"
                onChange={handleVideoPick}
                disabled={videoUploading}
              />

              {videoPreviewUrl && !videoUploading && (
                <div className="relative border border-dashed border-[#cfc4c5] overflow-hidden aspect-video bg-black">
                  <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-white text-[16px]">close</span>
                  </button>
                </div>
              )}

              {videoUploading && (
                <div className="border border-dashed border-[#e2e2e2] bg-[#f9f9f9] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546]">
                      Uploading… {videoProgress}%
                    </p>
                    <button type="button" onClick={removeVideo} className="text-[12px] text-[#7e7576] hover:text-black underline">
                      Cancel
                    </button>
                  </div>
                  <div className="w-full bg-[#e2e2e2] h-1">
                    <div
                      className="h-full bg-black transition-all duration-200"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!videoPreviewUrl && !videoUploading && (
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  className="w-full border border-dashed border-[#cfc4c5] py-8 flex flex-col items-center gap-2 hover:bg-[#f3f3f3] transition-colors group"
                >
                  <span className="material-symbols-outlined text-[#7e7576] group-hover:text-black text-[32px] transition-colors">play_circle</span>
                  <span className="text-[12px] uppercase tracking-[0.1em] text-[#7e7576] group-hover:text-black font-semibold transition-colors">
                    Fabric Motion
                  </span>
                  <span className="text-[11px] text-[#cfc4c5]">MP4 · WebM · MOV</span>
                </button>
              )}

              {videoError && (
                <p className="text-[12px] text-[#ba1a1a] mt-2 font-medium">{videoError}</p>
              )}
              {!videoUploading && videoCloudUrl && videoCompressedSize > 0 && (
                <p className="text-[11px] text-[#4c4546] mt-2">
                  ✓ Optimized: {formatBytes(videoOriginalSize)} → {formatBytes(videoCompressedSize)}
                </p>
              )}
            </div>
          </FormSection>

        </form>
      )}

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 bg-white border-t border-[#e2e2e2] px-4 sm:px-8 lg:px-16 py-3.5 sm:py-5 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-[11px] text-[#7e7576]">
          {saving && (
            <>
              <div className="w-3 h-3 border border-[#7e7576] border-t-transparent rounded-full animate-spin" />
              {uploadPct !== null && uploadPct < 100 ? `Uploading ${uploadPct}%` : 'Saving…'}
            </>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate(`/pro-admin/${slug}/products`)}
            disabled={saving}
            className="px-6 sm:px-10 py-2.5 sm:py-3 border border-black text-black text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#f3f3f3] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pro-admin-product-form"
            disabled={saving || videoUploading}
            className="px-6 sm:px-10 py-2.5 sm:py-3 bg-black text-white text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {mode === 'add' ? 'Save Product' : 'Save Changes'}
          </button>
        </div>
      </footer>

      {/* Image Crop Modal */}
      {cropTarget && (
        <ImageCropModal
          imageSrc={cropTarget.rawUrl}
          aspect={3 / 4}
          title={`Crop Photo ${cropTarget.slotIdx + 1} (3:4 Portrait)`}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  )
}
