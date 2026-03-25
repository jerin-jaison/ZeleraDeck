import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'
import api from '../api/axios'

// ── WhatsApp SVG shared ──────────────────────────────────────────────────────
function WAIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ── Dashboard variant ────────────────────────────────────────────────────────
export function DashboardProductCard({ product, onDeleted, onToggled }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      await api.delete(`shop/products/${product.id}/`)
      onDeleted(product.id)
    } catch {
      alert('Failed to delete product.')
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = async () => {
    setBusy(true)
    try {
      const { data } = await api.patch(`shop/products/${product.id}/`, {
        is_in_stock: !product.is_in_stock,
      })
      onToggled(data)
    } catch {
      alert('Failed to update stock status.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Square image */}
      <div className="relative aspect-square bg-gray-50">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* ID badge */}
        <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
          {product.display_id}
        </span>
        {/* OOS badge */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-[13px] leading-tight truncate">{product.name}</p>
        <p className="text-indigo-600 font-bold text-[15px] mt-1">₹{Number(product.price).toLocaleString('en-IN')}</p>

        {/* Actions row */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {/* Stock toggle */}
          <button
            onClick={handleToggle}
            className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${
              product.is_in_stock
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {product.is_in_stock ? '● In Stock' : '○ OOS'}
          </button>
          {/* Edit */}
          <button
            onClick={() => navigate(`/dashboard/edit-product/${product.id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M7 17l-4 1 1-4L16.5 5.5a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L7 17z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Public store variant ──────────────────────────────────────────────────────
export function PublicProductCard({ product, shop }) {
  const handleWhatsApp = () => {
    const message =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ Product: ${product.name}\n` +
      `🆔 ID: ${product.display_id}\n` +
      `💰 Price: ₹${product.price}\n` +
      `🔗 Link: zeleradeck.com/store/${shop.slug}/product/${product.display_id}\n\n` +
      `Please confirm availability. Thank you!`
    window.open(
      `https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
      {/* Square product image */}
      <div className="relative aspect-square bg-gray-50">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* ID chip */}
        <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
          {product.display_id}
        </span>
        {/* OOS overlay */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-[13px] leading-tight line-clamp-1">{product.name}</p>
        <p className="text-indigo-600 font-bold text-[15px] mt-0.5">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>

        {/* WhatsApp CTA — only when in stock */}
        {product.is_in_stock ? (
          <button
            onClick={handleWhatsApp}
            className="mt-2.5 w-full bg-[#25D366] hover:bg-[#1ebe5c] active:bg-[#18ad52] text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <WAIcon />
            Order
          </button>
        ) : (
          <div className="mt-2.5 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-[12px] text-gray-400 font-medium">Unavailable</span>
          </div>
        )}
      </div>
    </div>
  )
}
