import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductForm from '../components/ProductForm'
import SkeletonCard from '../components/SkeletonCard'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      api.get('shop/products/').then((r) => r.data.find((p) => p.id === id)),
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
        ? typeof data === 'string'
          ? data
          : Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join(' | ')
        : 'Failed to save. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <Link
            to="/dashboard"
            className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h2 className="text-[17px] font-bold text-gray-900">Edit Product</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {isLoading ? (
            <SkeletonCard />
          ) : !product ? (
            <p className="text-gray-400 text-sm text-center py-8">Product not found.</p>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}
              <ProductForm
                initial={product}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                loading={loading}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
