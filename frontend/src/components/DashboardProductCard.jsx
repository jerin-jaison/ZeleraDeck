import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import ImageWithFallback from './ImageWithFallback'
import { toast } from './Toast'
import api from '../api/axios'
import { useQueryClient } from '@tanstack/react-query'

function WAIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function DashboardProductCard({ product, onEdit }) {
  const qc = useQueryClient()
  const [inStock, setInStock] = useState(product.is_in_stock)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Optimistic stock toggle
  const handleToggle = async () => {
    if (toggling) return
    const prev = inStock
    setInStock(!inStock)
    setToggling(true)
    try {
      await api.patch(`shop/products/${product.id}/`, {
        is_in_stock: !prev ? 'true' : 'false',
      })
      qc.invalidateQueries(['products'])
    } catch {
      setInStock(prev) // revert
      toast('Failed to update stock status', 'error')
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`shop/products/${product.id}/`)
      qc.invalidateQueries(['products'])
      toast('Product deleted')
    } catch {
      toast('Failed to delete product', 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square w-full">
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Display ID badge */}
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
            {product.display_id}
          </span>
          {/* OOS overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[10px] text-white font-medium bg-black/60 px-2 py-1 rounded-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-sm font-medium text-[#0A0A0A] line-clamp-1">{product.name}</p>
          <p className="text-sm font-semibold text-[#0A0A0A] mt-0.5">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-2">
            {/* Stock toggle pill */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                inStock ? 'bg-[#25D366]' : 'bg-[#D4D4D4]'
              }`}
              aria-label="Toggle stock"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  inStock ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>

            <div className="flex-1" />

            {/* Edit */}
            <button
              onClick={() => onEdit(product.id)}
              className="w-8 h-8 rounded-lg bg-[#F8F8F8] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors"
              aria-label="Edit product"
            >
              <Pencil size={14} className="text-[#737373]" />
            </button>

            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] flex items-center justify-center transition-colors"
              aria-label="Delete product"
            >
              <Trash2 size={14} className="text-[#991B1B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete bottom sheet */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-w-md mx-auto"
            style={{ animation: 'slideUp 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#0A0A0A]">Delete product?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-5 line-clamp-1">{product.name}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-[#FEE2E2] text-[#991B1B] rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
