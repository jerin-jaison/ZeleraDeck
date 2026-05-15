import { useState, useRef } from 'react'
import { Camera, Video, X, Zap } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import Cropper from 'react-easy-crop'
import api from '../api/axios'
import CategoriesBottomSheet from './CategoriesBottomSheet'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => { resolve(blob) }, 'image/jpeg')
  })
}

// ── Single image slot component ───────────────────────────────────────────────
function ImageSlot({ slotIndex, required, file, previewUrl, compressionInfo, onPick }) {
  const fileRef = useRef()
  const label = slotIndex === 1 ? 'Photo 1 (Required)' : `Photo ${slotIndex} (Optional)`

  return (
    <div>
      {slotIndex > 1 && (
        <p className="text-xs font-medium text-[#737373] mb-1.5">
          {label}
        </p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { onPick(e); e.target.value = '' }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`w-full rounded-xl overflow-hidden relative bg-[#F8F8F8] border-2 border-dashed transition-colors ${
          previewUrl ? 'border-transparent' : 'border-[#D4D4D4] hover:border-[#A3A3A3]'
        } ${slotIndex === 1 ? 'aspect-square' : 'aspect-video'}`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={`Preview ${slotIndex}`} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 py-2">
              <p className="text-xs text-white text-center">Change photo</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6">
            <Camera className="w-8 h-8 text-[#A3A3A3]" />
            {slotIndex === 1 ? (
              <>
                <p className="text-sm text-[#737373] mt-2">Tap to add photo</p>
                <p className="text-xs text-[#A3A3A3] mt-1">JPG, PNG or WebP</p>
              </>
            ) : (
              <p className="text-xs text-[#A3A3A3] mt-1">Optional</p>
            )}
          </div>
        )}
      </button>
      {compressionInfo && (
        <p className="text-xs text-[#737373] mt-1">{compressionInfo}</p>
      )}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function ProductForm({ initialData, onSubmit, isLoading, isPro = false }) {
  const qc = useQueryClient()
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isInStock, setIsInStock] = useState(initialData?.is_in_stock ?? true)
  const [categoryId, setCategoryId] = useState(initialData?.category?.id || null)
  const [showCategories, setShowCategories] = useState(false)

  // Image slots: 1 required + 3 optional (pro only)
  const SLOT_COUNT = isPro ? 4 : 1
  const [imageFiles, setImageFiles] = useState(Array(4).fill(null))
  const [previewUrls, setPreviewUrls] = useState([
    initialData?.image_url || '',
    initialData?.image_url_2 || '',
    initialData?.image_url_3 || '',
    initialData?.image_url_4 || '',
  ])
  const [compressionInfos, setCompressionInfos] = useState(Array(4).fill(''))

  // Video (pro only)
  const videoRef = useRef()
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(initialData?.video_url || '')
  const [videoError, setVideoError] = useState('')

  // Cropper state
  const [cropSlotIndex, setCropSlotIndex] = useState(null) // which slot is being cropped
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api.get('shop/categories/').then((r) => r.data),
  })
  const categories = categoriesData || []

  // ── Image pick handler (opens cropper) ─────────────────────────────────────
  const handleImagePick = (e, slotIndex) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSlotIndex(slotIndex)
    setCropImageSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  // ── Crop complete ────────────────────────────────────────────────────────────
  const handleCropComplete = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels || cropSlotIndex === null) return
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels)
      if (!croppedBlob) return

      const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' })
      const beforeKB = (croppedBlob.size / 1024).toFixed(1)

      const compressed = await imageCompression(croppedFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      })
      const afterKB = (compressed.size / 1024).toFixed(1)

      const newFiles = [...imageFiles]
      newFiles[cropSlotIndex] = compressed
      setImageFiles(newFiles)

      const newPreviews = [...previewUrls]
      newPreviews[cropSlotIndex] = URL.createObjectURL(compressed)
      setPreviewUrls(newPreviews)

      const newInfos = [...compressionInfos]
      newInfos[cropSlotIndex] = `Optimised: ${beforeKB}KB → ${afterKB}KB ✓`
      setCompressionInfos(newInfos)

      setCropImageSrc(null)
      setCropSlotIndex(null)
    } catch (err) {
      console.error('Crop failed', err)
      setCropImageSrc(null)
      setCropSlotIndex(null)
    }
  }

  // ── Video pick ───────────────────────────────────────────────────────────────
  const handleVideoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoError('')

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setVideoError('Only MP4, WebM, or MOV files are allowed.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setVideoError('Video must be under 5MB.')
      e.target.value = ''
      return
    }
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('description', description || '')
    formData.append('is_in_stock', isInStock)
    if (imageFiles[0]) formData.append('image', imageFiles[0])
    if (categoryId) formData.append('category_id', categoryId)

    if (isPro) {
      if (imageFiles[1]) formData.append('image_2', imageFiles[1])
      if (imageFiles[2]) formData.append('image_3', imageFiles[2])
      if (imageFiles[3]) formData.append('image_4', imageFiles[3])
      if (videoFile) formData.append('video', videoFile)
    }

    onSubmit(formData)
  }

  const handleCategoriesClose = () => {
    setShowCategories(false)
    qc.invalidateQueries({ queryKey: ['shop-categories'] })
  }

  return (
    <>
      <form id="product-form" onSubmit={handleSubmit}>

        {/* ── Pro badge ──────────────────────────────────────────────────────── */}
        {isPro && (
          <div className="px-4 mt-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
              <span className="text-xs font-semibold">Pro</span>
            </div>
          </div>
        )}

        {/* ── Image upload zone(s) ───────────────────────────────────────────── */}
        <div className={`px-4 mt-4 ${isPro ? 'grid grid-cols-2 gap-3' : ''}`}>
          {Array.from({ length: SLOT_COUNT }).map((_, i) => (
            <ImageSlot
              key={i}
              slotIndex={i + 1}
              required={i === 0}
              file={imageFiles[i]}
              previewUrl={previewUrls[i]}
              compressionInfo={compressionInfos[i]}
              onPick={(e) => handleImagePick(e, i)}
            />
          ))}
        </div>

        {/* ── Video upload (Pro only) ────────────────────────────────────────── */}
        {isPro && (
          <div className="px-4 mt-4">
            <label className="block text-xs font-medium text-[#737373] mb-1.5">
              Product Video <span className="text-[#A3A3A3]">(optional, max 5MB)</span>
            </label>
            <input
              ref={videoRef}
              type="file"
              accept="video/mp4,video/webm,.mov,video/quicktime"
              onChange={handleVideoPick}
              className="hidden"
            />
            {videoPreviewUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); setVideoPreviewUrl(''); setVideoError('') }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="w-full border-2 border-dashed border-[#D4D4D4] rounded-xl py-5 flex flex-col items-center gap-1 hover:border-[#A3A3A3] transition-colors"
              >
                <Video className="w-7 h-7 text-[#A3A3A3]" />
                <p className="text-sm text-[#737373]">Tap to add video</p>
                <p className="text-xs text-[#A3A3A3]">MP4, WebM or MOV · max 5MB</p>
              </button>
            )}
            {videoError && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{videoError}</p>
            )}
          </div>
        )}

        {/* ── Fields ────────────────────────────────────────────────────────── */}
        <div className="px-4 mt-6 space-y-4 pb-32">
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#737373]">₹</span>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="w-full border border-[#E5E5E5] rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#737373]">
                Description <span className="text-[#A3A3A3]">(optional)</span>
              </label>
              <span className="text-[10px] text-[#A3A3A3]">{description.length}/500</span>
            </div>
            <textarea
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
            />
          </div>

          {/* Category selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-[#737373]">Category</label>
              <span className="text-xs text-[#A3A3A3]">(optional)</span>
              <button
                type="button"
                onClick={() => setShowCategories(true)}
                className="text-xs text-[#0A0A0A] underline ml-auto"
              >
                {categories.length > 0 ? 'Manage →' : 'Add Category +'}
              </button>
            </div>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryId(null)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer border transition-all ${
                    categoryId === null
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white border-[#E5E5E5] text-[#737373]'
                  }`}
                >
                  No category
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer border transition-all ${
                      categoryId === cat.id
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'bg-white border-[#E5E5E5] text-[#737373]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A3A3A3] italic">No categories created yet.</p>
            )}
          </div>

          <div className="flex justify-between items-center bg-[#F8F8F8] rounded-xl p-4">
            <p className="text-sm font-medium text-[#0A0A0A]">Mark as in stock</p>
            <button
              type="button"
              onClick={() => setIsInStock(!isInStock)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ backgroundColor: isInStock ? '#25D366' : '#D4D4D4' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                style={{ transform: isInStock ? 'translateX(24px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>
      </form>

      <CategoriesBottomSheet
        isOpen={showCategories}
        onClose={handleCategoriesClose}
      />

      {/* ── Crop modal ─────────────────────────────────────────────────────── */}
      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="p-4 bg-white flex justify-between gap-4">
            <button
              type="button"
              onClick={() => { setCropImageSrc(null); setCropSlotIndex(null) }}
              className="flex-1 py-4 font-semibold text-[#0A0A0A] bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropComplete}
              className="flex-1 py-4 font-semibold text-white bg-[#0A0A0A] rounded-xl hover:bg-[#2A2A2A]"
            >
              Done Crop
            </button>
          </div>
        </div>
      )}
    </>
  )
}
