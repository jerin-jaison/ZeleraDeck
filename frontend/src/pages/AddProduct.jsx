import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import api from '../api/axios'
import ProductForm from '../components/ProductForm'

export default function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      await api.post('shop/products/', formData)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      const data = err?.response?.data
      const msg = data
        ? typeof data === 'string' ? data
          : Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
        : 'Failed to add product. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-10 pb-4 bg-white border-b border-[#F0F0F0]">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl bg-[#F8F8F8] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={20} className="text-[#0A0A0A]" />
        </button>
        <h1 className="text-base font-semibold text-[#0A0A0A]">Add Product</h1>
      </div>

      {/* Loading progress bar */}
      {loading && (
        <div className="h-0.5 bg-[#F0F0F0] overflow-hidden">
          <div className="h-full bg-[#111111] animate-pulse w-2/3" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3">
          <p className="text-xs text-[#991B1B]">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="max-w-md mx-auto px-4 pt-5">
        <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" loading={loading} />
      </div>

      {/* Sticky submit button */}
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
          {loading ? 'Uploading…' : 'Add Product'}
        </button>
      </div>

      {/* Success overlay */}
      {success && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-[#0A0A0A]">Product added!</p>
        </div>
      )}
    </div>
  )
}
