import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import ProductForm from '../components/ProductForm'

export default function AddProduct() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)

  useEffect(() => {
    let timer
    if (loading) {
      timer = setTimeout(() => setSlowWarning(true), 8000)
    } else {
      setSlowWarning(false)
    }
    return () => clearTimeout(timer)
  }, [loading])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await api.post('shop/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(true)
      showToast('Product added!')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to add product', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Progress bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#0A0A0A] animate-pulse z-50" />
      )}

      {/* Header */}
      <div className="px-4 py-4 border-b border-[#F0F0F0] flex items-center gap-2">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5 text-[#737373]" /></button>
        <h1 className="text-sm font-semibold text-[#0A0A0A]">Add Product</h1>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={loading} />

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
          {success ? (
            'Added! ✓'
          ) : loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            'Add Product'
          )}
        </button>
        {slowWarning && loading && (
          <p className="text-xs text-[#A3A3A3] text-center mt-2">
            This is taking a bit longer than usual, please wait...
          </p>
        )}
      </div>
    </div>
  )
}
