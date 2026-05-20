import { useState, useRef } from 'react'
import { Camera, Video, X, Zap, CheckCircle2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import Cropper from 'react-easy-crop'
import api from '../api/axios'
import CategoriesBottomSheet from './CategoriesBottomSheet'

// ── Cloudinary direct upload config ──────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'de7f6rnco'
const CLOUDINARY_UPLOAD_PRESET = 'zeleradeck_video'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((resolve) => { canvas.toBlob((blob) => { resolve(blob) }, 'image/jpeg') })
}

// ── Image slot ────────────────────────────────────────────────────────────────
function ImageSlot({ slotIndex, previewUrl, compressionInfo, onPick }) {
  const fileRef = useRef()
  const label = slotIndex === 1 ? 'Photo 1 (Required)' : `Photo ${slotIndex} (Optional)`
  return (
    <div>
      {slotIndex > 1 && <p className="text-xs font-medium text-[#737373] mb-1.5">{label}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { onPick(e); e.target.value = '' }} className="hidden" />
      <button type="button" onClick={() => fileRef.current?.click()}
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
              <><p className="text-sm text-[#737373] mt-2">Tap to add photo</p><p className="text-xs text-[#A3A3A3] mt-1">JPG, PNG or WebP</p></>
            ) : (
              <p className="text-xs text-[#A3A3A3] mt-1">Optional</p>
            )}
          </div>
        )}
      </button>
      {compressionInfo && <p className="text-xs text-[#737373] mt-1">{compressionInfo}</p>}
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

  const SLOT_COUNT = isPro ? 4 : 1
  const [imageFiles, setImageFiles] = useState(Array(4).fill(null))
  const [previewUrls, setPreviewUrls] = useState([
    initialData?.image_url || '',
    initialData?.image_url_2 || '',
    initialData?.image_url_3 || '',
    initialData?.image_url_4 || '',
  ])
  const [compressionInfos, setCompressionInfos] = useState(Array(4).fill(''))

  // Video state
  const videoRef = useRef()
  const xhrRef = useRef(null)
  const [videoCloudinaryUrl, setVideoCloudinaryUrl] = useState(initialData?.video_url || '')
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(initialData?.video_url || '')
  const [videoError, setVideoError] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  // Size comparison stats
  const [videoOriginalSize, setVideoOriginalSize] = useState(0)   // bytes before
  const [videoCompressedSize, setVideoCompressedSize] = useState(0) // bytes after (eager)

  // Cropper
  const [cropSlotIndex, setCropSlotIndex] = useState(null)
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api.get('shop/categories/').then((r) => r.data),
  })
  const categories = categoriesData || []

  // ── Image pick ─────────────────────────────────────────────────────────────
  const handleImagePick = (e, slotIndex) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSlotIndex(slotIndex)
    setCropImageSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleCropComplete = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels || cropSlotIndex === null) return
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels)
      if (!croppedBlob) return
      const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' })
      const beforeKB = (croppedBlob.size / 1024).toFixed(1)
      const compressed = await imageCompression(croppedFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true })
      const afterKB = (compressed.size / 1024).toFixed(1)
      const newFiles = [...imageFiles]; newFiles[cropSlotIndex] = compressed; setImageFiles(newFiles)
      const newPreviews = [...previewUrls]; newPreviews[cropSlotIndex] = URL.createObjectURL(compressed); setPreviewUrls(newPreviews)
      const newInfos = [...compressionInfos]; newInfos[cropSlotIndex] = `Optimised: ${beforeKB}KB → ${afterKB}KB ✓`; setCompressionInfos(newInfos)
      setCropImageSrc(null); setCropSlotIndex(null)
    } catch { setCropImageSrc(null); setCropSlotIndex(null) }
  }

  // ── Video pick → upload directly to Cloudinary ────────────────────────────
  const handleVideoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setVideoError('')

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setVideoError('Please select an mp4, mov, or webm video file.')
      return
    }

    // Record original file size for the before/after comparison
    setVideoOriginalSize(file.size)
    setVideoCompressedSize(0)
    setVideoCloudinaryUrl('')
    setVideoPreviewUrl('')

    // Start XHR upload directly to Cloudinary
    setVideoUploading(true)
    setVideoUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        setVideoUploadProgress(Math.round((ev.loaded / ev.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      setVideoUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText)
        // Use the eager (compressed) version
        const eager = result.eager?.[0]
        const compressedUrl = eager?.secure_url || result.secure_url
        const compressedBytes = eager?.bytes || result.bytes || 0

        if (compressedBytes > 5 * 1024 * 1024) {
          setVideoError(
            `Video is too long — compressed to ${formatBytes(compressedBytes)} but limit is 5 MB. Please use a clip under 60 seconds.`
          )
          setVideoCompressedSize(compressedBytes)
          return
        }

        setVideoCloudinaryUrl(compressedUrl)
        setVideoPreviewUrl(compressedUrl)
        setVideoCompressedSize(compressedBytes)
      } else {
        setVideoError('Video upload failed. Please try a shorter clip in mp4 or mov format.')
      }
    })

    xhr.addEventListener('error', () => {
      setVideoUploading(false)
      setVideoError('Video upload failed. Please check your connection and try again.')
    })

    xhr.addEventListener('abort', () => {
      setVideoUploading(false)
    })

    xhr.open('POST', CLOUDINARY_UPLOAD_URL)
    xhr.send(formData)
  }

  const handleRemoveVideo = () => {
    if (xhrRef.current) xhrRef.current.abort()
    setVideoCloudinaryUrl('')
    setVideoPreviewUrl('')
    setVideoError('')
    setVideoUploading(false)
    setVideoUploadProgress(0)
    setVideoOriginalSize(0)
    setVideoCompressedSize(0)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    if (videoUploading) return // safety guard
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
      // Send the pre-uploaded Cloudinary URL, not a file
      if (videoCloudinaryUrl) formData.append('video_url', videoCloudinaryUrl)
    }

    onSubmit(formData)
  }

  const reductionPct = videoOriginalSize && videoCompressedSize
    ? Math.round((1 - videoCompressedSize / videoOriginalSize) * 100)
    : 0

  const uploadDone = !videoUploading && videoCloudinaryUrl && videoCompressedSize > 0

  return (
    <>
      <form id="product-form" onSubmit={handleSubmit}>

        {isPro && (
          <div className="px-4 mt-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
              <span className="text-xs font-semibold">Pro</span>
            </div>
          </div>
        )}

        {/* ── Images ──────────────────────────────────────────────────────── */}
        <div className={`px-4 mt-4 ${isPro ? 'grid grid-cols-2 gap-3' : ''}`}>
          {Array.from({ length: SLOT_COUNT }).map((_, i) => (
            <ImageSlot key={i} slotIndex={i + 1} required={i === 0}
              previewUrl={previewUrls[i]} compressionInfo={compressionInfos[i]}
              onPick={(e) => handleImagePick(e, i)} />
          ))}
        </div>

        {/* ── Video (Pro only) ─────────────────────────────────────────────── */}
        {isPro && (
          <div className="px-4 mt-4">
            <label className="block text-xs font-medium text-[#737373] mb-1.5">
              Product Video <span className="text-[#A3A3A3]">(optional · optimised by Cloudinary on upload)</span>
            </label>
            <input ref={videoRef} type="file" accept="video/mp4,video/webm,.mov,video/quicktime"
              onChange={handleVideoPick} className="hidden" disabled={videoUploading} />

            {/* Preview (upload done) */}
            {videoPreviewUrl && !videoUploading && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                <button type="button" onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Upload in progress */}
            {videoUploading && (
              <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-amber-800">
                    Uploading to Cloudinary… {videoUploadProgress}%
                  </p>
                  <button type="button" onClick={handleRemoveVideo}
                    className="text-xs text-amber-600 underline">Cancel</button>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-200"
                    style={{ width: `${videoUploadProgress}%` }} />
                </div>
                <p className="text-[11px] text-amber-600 mt-1.5">
                  {formatBytes(videoOriginalSize)} raw · Cloudinary will compress this on their servers
                </p>
              </div>
            )}

            {/* Empty picker */}
            {!videoPreviewUrl && !videoUploading && (
              <button type="button" onClick={() => videoRef.current?.click()}
                className="w-full border-2 border-dashed border-[#D4D4D4] rounded-xl py-5 flex flex-col items-center gap-1 hover:border-[#A3A3A3] transition-colors">
                <Video className="w-7 h-7 text-[#A3A3A3]" />
                <p className="text-sm text-[#737373]">Tap to add video</p>
                <p className="text-xs text-[#A3A3A3]">MP4, WebM or MOV · any size · auto-compressed</p>
              </button>
            )}

            {/* ✅ Before / After size comparison */}
            {uploadDone && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-800">
                    {formatBytes(videoOriginalSize)} → {formatBytes(videoCompressedSize)}
                    <span className="ml-1 font-normal text-green-700">({reductionPct}% smaller)</span>
                  </p>
                  <p className="text-[11px] text-green-600 mt-0.5">
                    Ready to save · Cloudinary optimised to 720p
                  </p>
                </div>
              </div>
            )}

            {/* Error for over-limit after compression */}
            {videoError && !videoUploading && videoCompressedSize > 5 * 1024 * 1024 && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <p className="text-xs font-semibold text-red-700">Too long after compression</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  {formatBytes(videoOriginalSize)} → {formatBytes(videoCompressedSize)} · Limit is 5 MB. Use a clip under ~60 seconds.
                </p>
              </div>
            )}

            {/* Generic error */}
            {videoError && videoCompressedSize === 0 && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{videoError}</p>
            )}
          </div>
        )}

        {/* ── Fields ──────────────────────────────────────────────────────── */}
        <div className="px-4 mt-6 space-y-4 pb-32">
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name" required
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#737373]">₹</span>
              <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00" required min="0" step="0.01"
                className="w-full border border-[#E5E5E5] rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#737373]">
                Description <span className="text-[#A3A3A3]">(optional)</span>
              </label>
              <span className="text-[10px] text-[#A3A3A3]">{description.length}/500</span>
            </div>
            <textarea value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..." rows={3}
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-[#737373]">Category</label>
              <span className="text-xs text-[#A3A3A3]">(optional)</span>
              <button type="button" onClick={() => setShowCategories(true)} className="text-xs text-[#0A0A0A] underline ml-auto">
                {categories.length > 0 ? 'Manage →' : 'Add Category +'}
              </button>
            </div>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCategoryId(null)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer border transition-all ${categoryId === null ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white border-[#E5E5E5] text-[#737373]'}`}>
                  No category
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer border transition-all ${categoryId === cat.id ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white border-[#E5E5E5] text-[#737373]'}`}>
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
            <button type="button" onClick={() => setIsInStock(!isInStock)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ backgroundColor: isInStock ? '#25D366' : '#D4D4D4' }}>
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                style={{ transform: isInStock ? 'translateX(24px)' : 'translateX(2px)' }} />
            </button>
          </div>
        </div>
      </form>

      {/* Expose uploading state for parent submit button */}
      <input type="hidden" id="video-uploading-flag" value={videoUploading ? '1' : '0'} />

      <CategoriesBottomSheet isOpen={showCategories} onClose={() => { setShowCategories(false); qc.invalidateQueries({ queryKey: ['shop-categories'] }) }} />

      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper image={cropImageSrc} crop={crop} zoom={zoom} aspect={1}
              onCropChange={setCrop} onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="p-4 bg-white flex justify-between gap-4">
            <button type="button" onClick={() => { setCropImageSrc(null); setCropSlotIndex(null) }}
              className="flex-1 py-4 font-semibold text-[#0A0A0A] bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl">Cancel</button>
            <button type="button" onClick={handleCropComplete}
              className="flex-1 py-4 font-semibold text-white bg-[#0A0A0A] rounded-xl hover:bg-[#2A2A2A]">Done Crop</button>
          </div>
        </div>
      )}
    </>
  )
}
