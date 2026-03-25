import { useState } from 'react'
import { Camera } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function ProductForm({ initial = {}, onSubmit, submitLabel = 'Save', loading = false }) {
  const [name, setName] = useState(initial.name || '')
  const [price, setPrice] = useState(initial.price || '')
  const [description, setDescription] = useState(initial.description || '')
  const [isInStock, setIsInStock] = useState(initial.is_in_stock !== false)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(initial.image_url || null)
  const [sizeInfo, setSizeInfo] = useState(null)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Product name is required'
    if (!price || isNaN(price) || Number(price) < 0) e.price = 'Enter a valid price'
    if (!image && !initial.image_url) e.image = 'Product image is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = async (file) => {
    if (!file) return
    const beforeKB = (file.size / 1024).toFixed(1)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, useWebWorker: true })
      const afterKB = (compressed.size / 1024).toFixed(1)
      setSizeInfo({ before: beforeKB, after: afterKB })
      const safeFile = new File([compressed], 'product.jpg', { type: 'image/jpeg' })
      setImage(safeFile)
      setPreview(URL.createObjectURL(safeFile))
    } catch {
      const safeFile = new File([file], 'product.jpg', { type: file.type || 'image/jpeg' })
      setImage(safeFile)
      setPreview(URL.createObjectURL(safeFile))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('price', price)
    if (description.trim()) fd.append('description', description.trim())
    fd.append('is_in_stock', isInStock ? 'true' : 'false')
    if (image) fd.append('image', image)
    onSubmit(fd)
  }

  const inputCls = "w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent placeholder:text-[#A3A3A3]"
  const labelCls = "block text-xs font-medium text-[#737373] mb-1"

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-5 pb-28">
      {/* Image upload — FIRST */}
      <div>
        <label className={labelCls}>
          Product Photo {!initial.image_url && <span className="text-[#EF4444]">*</span>}
        </label>
        <label className="block cursor-pointer">
          <div className={`w-full aspect-video rounded-2xl border-2 border-dashed overflow-hidden relative ${
            errors.image ? 'border-[#EF4444] bg-[#FEE2E2]/20' : 'border-[#D4D4D4] bg-[#F8F8F8]'
          }`}>
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-2 text-center">
                  <span className="text-xs text-white">Tap to change photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Camera size={32} className="text-[#A3A3A3]" />
                <p className="text-sm text-[#737373] mt-2">Tap to add photo</p>
                <p className="text-xs text-[#A3A3A3] mt-1">JPG, PNG or WebP · Max 5MB</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files[0])}
          />
        </label>
        {sizeInfo && (
          <p className="text-xs text-[#737373] mt-1.5">
            ✓ Compressed: {sizeInfo.before}KB → {sizeInfo.after}KB
          </p>
        )}
        {errors.image && <p className="text-xs text-[#EF4444] mt-1">{errors.image}</p>}
      </div>

      {/* Name */}
      <div>
        <label className={labelCls}>Product Name <span className="text-[#EF4444]">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Blue Cotton Saree"
          className={inputCls}
        />
        {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
      </div>

      {/* Price */}
      <div>
        <label className={labelCls}>Price <span className="text-[#EF4444]">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#737373]">₹</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="850"
            min="0"
            step="1"
            className={`${inputCls} pl-8`}
          />
        </div>
        {errors.price && <p className="text-xs text-[#EF4444] mt-1">{errors.price}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief product description…"
          className={`${inputCls} resize-none`}
        />
        <p className="text-[11px] text-[#A3A3A3] mt-1 text-right">{description.length}/500</p>
      </div>

      {/* Stock toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-[#0A0A0A]">Mark as in stock</p>
          <p className="text-xs text-[#A3A3A3]">
            {isInStock ? 'Visible with WhatsApp button' : 'Will show as out of stock'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsInStock((v) => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
            isInStock ? 'bg-[#25D366]' : 'bg-[#D4D4D4]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              isInStock ? 'left-6' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </form>
  )
}
