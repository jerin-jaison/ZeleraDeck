import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import ProductForm from '../components/ProductForm'

export default function AddProduct() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { isPro: isProCtx, updateIsPro } = useAuth()
  const [isPro, setIsPro] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)

  useEffect(() => {
    api.get('shop/me/')
      .then(r => {
        const val = Boolean(r.data.is_pro ?? false)
        setIsPro(val)
        updateIsPro(val)
      })
      .catch(() => setIsPro(Boolean(isProCtx)))
  }, [])

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
    setUploadProgress(0)
    try {
      await api.post('shop/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0
          setUploadProgress(pct)
        },
      })
      setSuccess(true)
      showToast('Product added!')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Video upload failed. Please try a shorter clip in mp4 or mov format.', 'error')
    } finally {
      setLoading(false)
      setUploadProgress(null)
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

      {isPro === null ? (
        <div className="px-4 mt-4 space-y-4">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="h-12 skeleton rounded-xl" />
          <div className="h-12 skeleton rounded-xl" />
        </div>
      ) : (
        <ProductForm onSubmit={handleSubmit} isLoading={loading} isPro={isPro} />
      )}

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
              {uploadProgress !== null && uploadProgress < 100
                ? `Uploading ${uploadProgress}%`
                : 'Processing…'}
            </>
          ) : (
            'Add Product'
          )}
        </button>

        {/* Upload progress bar */}
        {loading && uploadProgress !== null && (
          <div className="mt-2 w-full bg-[#E5E5E5] rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-[#0A0A0A] rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {slowWarning && loading && (
          <p className="text-xs text-[#A3A3A3] text-center mt-2">
            This is taking a bit longer than usual, please wait…
          </p>
        )}
      </div>
    </div>
  )
}
