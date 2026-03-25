import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import ImageWithFallback from './ImageWithFallback'

export default function DashboardProductListItem({ product, onUpdate, onDelete }) {
  const navigate = useNavigate()
  const showToast = useToast()
  const [toggling, setToggling] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [optimisticStock, setOptimisticStock] = useState(product.is_in_stock)

  const handleToggleStock = async () => {
    setToggling(true)
    const newVal = !optimisticStock
    setOptimisticStock(newVal)
    try {
      await api.patch(`shop/products/${product.id}/`, { is_in_stock: newVal })
      onUpdate?.()
    } catch {
      setOptimisticStock(!newVal)
      showToast('Failed to update stock', 'error')
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`shop/products/${product.id}/`)
      onDelete?.(product.id)
      showToast('Product deleted')
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeleting(false)
      setShowDeleteSheet(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-3 if flex flex-row items-center gap-3">
        {/* Image */}
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          className="w-16 h-16 rounded-xl flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#A3A3A3] font-mono">{product.display_id}</p>
          <p className="text-sm font-semibold text-[#0A0A0A] line-clamp-1 mt-0.5">{product.name}</p>
          <p className="text-sm font-bold text-[#0A0A0A]">₹{Number(product.price).toLocaleString('en-IN')}</p>
          <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            optimisticStock ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
          }`}>
            {optimisticStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {/* Stock toggle */}
          <button
            onClick={handleToggleStock}
            disabled={toggling}
            className="relative"
          >
            <div className={`w-9 h-5 rounded-full transition-colors ${optimisticStock ? 'bg-[#25D366]' : 'bg-[#D4D4D4]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                optimisticStock ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {/* Edit */}
          <button
            onClick={() => navigate(`/dashboard/edit-product/${product.id}`)}
            className="w-8 h-8 rounded-lg bg-[#F8F8F8] flex items-center justify-center"
          >
            <Pencil className="w-3.5 h-3.5 text-[#737373]" />
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteSheet(true)}
            className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
          </button>
        </div>
      </div>

      {/* Delete bottom sheet */}
      {showDeleteSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowDeleteSheet(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto"
            style={{ animation: 'slideUp 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#0A0A0A]">Delete product?</h3>
            <p className="text-sm text-[#737373] mt-1">{product.name}</p>
            <p className="text-xs text-[#A3A3A3]">{product.display_id}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteSheet(false)}
                className="flex-1 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-[#EF4444] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
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
