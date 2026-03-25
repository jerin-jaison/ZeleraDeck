import { useState } from 'react'
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
    if (!price || isNaN(price) || Number(price) < 0) e.price = 'Enter a valid positive price'
    if (!image && !initial.image_url) e.image = 'Product image is required'
    if (description.length > 500) e.description = 'Max 500 characters'
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
      // Force a safe filename with .jpg extension — imageCompression may return files without extension
      const safeFile = new File([compressed], 'product.jpg', { type: 'image/jpeg' })
      setImage(safeFile)
      setPreview(URL.createObjectURL(safeFile))
    } catch {
      // Fallback: use original file with forced safe name
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Blue Cotton Saree"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="850"
            min="0"
            step="0.01"
            className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief product description..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
        <p className="text-gray-400 text-xs mt-1">{description.length}/500</p>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image {!initial.image_url && '*'}
        </label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-300 transition bg-gray-50">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400">Click to upload or drag and drop</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e.target.files[0])} />
        </label>
        {sizeInfo && (
          <p className="text-xs text-green-600 mt-1">
            Compressed: {sizeInfo.before}KB → {sizeInfo.after}KB
          </p>
        )}
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
      </div>

      {/* Stock toggle — large tap target */}
      <button
        type="button"
        onClick={() => setIsInStock((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
          isInStock
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}
      >
        <span className="text-[14px] font-semibold">
          {isInStock ? '● In Stock' : '○ Out of Stock'}
        </span>
        <div className={`w-11 h-6 rounded-full transition-colors relative ${
          isInStock ? 'bg-emerald-500' : 'bg-gray-300'
        }`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            isInStock ? 'left-5' : 'left-0.5'
          }`} />
        </div>
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
