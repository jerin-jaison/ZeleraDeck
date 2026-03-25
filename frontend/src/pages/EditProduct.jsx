import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import ProductForm from '../components/ProductForm'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: product, isLoading: fetching } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`shop/products/`).then((r) => r.data.find((p) => p.id === id)),
  })

  useEffect(() => {
    let timer
    if (loading) timer = setTimeout(() => setSlowWarning(true), 8000)
    else setSlowWarning(false)
    return () => clearTimeout(timer)
  }, [loading])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await api.patch(`shop/products/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(true)
      showToast('Product updated!')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`shop/products/${id}/`)
      showToast('Product deleted')
      navigate('/dashboard', { replace: true })
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeleting(false)
      setShowDeleteSheet(false)
    }
  }

  if (fetching) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto">
        <div className="px-4 py-4 border-b border-[#F0F0F0]">
          <div className="h-4 w-32 skeleton rounded" />
        </div>
        <div className="px-4 mt-4">
          <div className="aspect-video skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#0A0A0A] animate-pulse z-50" />}

      <div className="px-4 py-4 border-b border-[#F0F0F0] flex items-center gap-2">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5 text-[#737373]" /></button>
        <h1 className="text-sm font-semibold text-[#0A0A0A]">Edit Product</h1>
      </div>

      {product && <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={loading} />}

      {/* Delete link */}
      <div className="px-4 pb-6 text-center">
        <button onClick={() => setShowDeleteSheet(true)} className="text-xs text-[#EF4444] underline">
          Delete this product
        </button>
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 z-40 max-w-md mx-auto">
        <button
          type="submit"
          form="product-form"
          disabled={loading || success}
          className={`w-full rounded-xl py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            success
              ? 'bg-[#25D366] text-white'
              : 'bg-[#0A0A0A] text-white hover:bg-[#2A2A2A] active:scale-[0.98] disabled:opacity-70'
          }`}
        >
          {success ? 'Saved! ✓' : loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
          ) : 'Save Changes'}
        </button>
        {slowWarning && loading && (
          <p className="text-xs text-[#A3A3A3] text-center mt-2">Still uploading... Render backend may be starting up</p>
        )}
      </div>

      {/* Delete bottom sheet */}
      {showDeleteSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowDeleteSheet(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto"
            style={{ animation: 'slideUp 0.25s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">Delete product?</h3>
            <p className="text-sm text-[#737373] mt-1">{product?.name}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteSheet(false)}
                className="flex-1 border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-[#EF4444] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
