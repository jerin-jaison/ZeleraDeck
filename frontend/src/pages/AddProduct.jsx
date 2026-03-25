import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductForm from '../components/ProductForm'

export default function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      await api.post('shop/products/', formData)
      navigate('/dashboard')
    } catch (err) {
      const data = err?.response?.data
      // Build readable error from Django's field error dict e.g. {image: ['Upload a valid image.']}
      const msg = data
        ? typeof data === 'string'
          ? data
          : Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join(' | ')
        : 'Failed to add product. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            to="/dashboard"
            className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h2 className="text-[17px] font-bold text-gray-900">Add Product</h2>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" loading={loading} />
        </div>
      </main>
    </div>
  )
}
