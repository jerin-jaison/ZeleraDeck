import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
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
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}

export default function ProductForm({ initialData, onSubmit, isLoading }) {
  const qc = useQueryClient()
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isInStock, setIsInStock] = useState(initialData?.is_in_stock ?? true)
  const [categoryId, setCategoryId] = useState(initialData?.category?.id || null)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialData?.image_url || '')
  const [compressionInfo, setCompressionInfo] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const fileRef = useRef()

  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api.get('shop/categories/').then((r) => r.data),
  })
  const categories = categoriesData || []

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropImageSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleCropComplete = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return
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
      setCompressionInfo(`Optimised: ${beforeKB}KB → ${afterKB}KB ✓`)
      
      setImageFile(compressed)
      setPreviewUrl(URL.createObjectURL(compressed))
      setCropImageSrc(null)
    } catch (err) {
      console.error('Crop failed', err)
      setCropImageSrc(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('description', description || '')
    formData.append('is_in_stock', isInStock)
    if (imageFile) formData.append('image', imageFile)
    if (categoryId) {
      formData.append('category_id', categoryId)
    }
    // When categoryId is null (no category selected), we don't send
    // category_id at all for new products. For editing, the backend
    // handles the absence by not changing the category.
    onSubmit(formData)
  }

  const handleCategoriesClose = () => {
    setShowCategories(false)
    qc.invalidateQueries({ queryKey: ['shop-categories'] })
  }

  return (
    <>
      <form id="product-form" onSubmit={handleSubmit}>
        {/* Image upload zone */}
        <div className="px-4 mt-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImagePick}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-video rounded-2xl overflow-hidden relative bg-[#F8F8F8] border-2 border-dashed border-[#D4D4D4]"
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 py-2">
                  <p className="text-xs text-white text-center">Change photo</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Camera className="w-10 h-10 text-[#A3A3A3]" />
                <p className="text-sm text-[#737373] mt-2">Tap to add photo</p>
                <p className="text-xs text-[#A3A3A3] mt-1">JPG, PNG or WebP</p>
              </div>
            )}
          </button>
          {compressionInfo && (
            <p className="text-xs text-[#737373] mt-2">{compressionInfo}</p>
          )}
        </div>

        {/* Fields */}
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
            <label className="block text-xs font-medium text-[#737373] mb-1.5">
              Description <span className="text-[#A3A3A3]">(optional)</span>
            </label>
            <textarea
              value={description}
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

      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="p-4 bg-white flex justify-between gap-4">
            <button
              type="button"
              onClick={() => setCropImageSrc(null)}
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
