import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import api from '../api/axios'
import ProductForm from '../components/ProductForm'
import SkeletonCard from '../components/SkeletonCard'
import Toast, { toast } from '../components/Toast'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get('shop/products/').then((r) => r.data.find((p) => p.id === id)),
  })

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      await api.patch(`shop/products/${id}/`, formData)
      navigate('/dashboard')
    } catch (err) {
      const data = err?.response?.data
      const msg = data
        ? typeof data === 'string' ? data
          : Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
        : 'Failed to save. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`shop/products/${id}/`)
      toast('Product deleted')
      navigate('/dashboard')
    } catch {
      toast('Failed to delete product', 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <Toast />
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-10 pb-4 bg-white border-b border-[#F0F0F0]">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl bg-[#F8F8F8] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={20} className="text-[#0A0A0A]" />
        </button>
        <h1 className="text-base font-semibold text-[#0A0A0A]">Edit Product</h1>
      </div>

      {loading && (
        <div className="h-0.5 bg-[#F0F0F0] overflow-hidden">
          <div className="h-full bg-[#111111] animate-pulse w-2/3" />
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3">
          <p className="text-xs text-[#991B1B]">{error}</p>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : !product ? (
          <p className="text-sm text-[#737373] text-center py-12">Product not found.</p>
        ) : (
          <>
            <ProductForm
              initial={product}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              loading={loading}
            />
            {/* Delete link */}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full text-xs text-[#EF4444] text-center py-4 mt-2"
            >
              Delete Product
            </button>
          </>
        )}
      </div>

      {/* Sticky submit */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 pb-safe max-w-md mx-auto">
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] active:scale-[0.98] text-white font-medium rounded-xl py-3 text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Delete bottom sheet */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 pb-safe max-w-md mx-auto"
            style={{ animation: 'slideUp 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#0A0A0A]">Delete product?</h3>
            <p className="text-sm text-[#737373] mt-1 mb-5">{product?.name}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-[#FEE2E2] text-[#991B1B] rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
