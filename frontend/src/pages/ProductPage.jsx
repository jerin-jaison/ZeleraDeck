import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ImageWithFallback from '../components/ImageWithFallback'

function WAIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 h-14 px-4 flex items-center">
        <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded-full w-3/4 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded-full w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
            <div className="h-12 bg-gray-100 rounded-2xl w-full animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { slug, displayId } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-public', slug, displayId],
    queryFn: () =>
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'}store/${slug}/product/${displayId}/`).then((r) => r.data),

    retry: false,
  })

  const handleWhatsApp = () => {
    if (!data) return
    const message =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ Product: ${data.name}\n` +
      `🆔 ID: ${data.display_id}\n` +
      `💰 Price: ₹${data.price}\n` +
      `🔗 Link: zeleradeck.com/store/${slug}/product/${data.display_id}\n\n` +
      `Please confirm availability. Thank you!`
    window.open(`https://wa.me/${data.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (isLoading) return <Skeleton />

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[18px] font-bold text-gray-800 mb-1">Product not found</h1>
          <p className="text-[13px] text-gray-400">Double-check the link and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store header with back link */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to={`/store/${slug}`}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-bold text-gray-900 text-[15px] truncate">{data.shop_name}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Square image */}
          <div className="relative aspect-square bg-gray-50">
            <ImageWithFallback
              src={data.image_url}
              alt={data.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
              {data.display_id}
            </span>
            {!data.is_in_stock && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5">
            <h1 className="text-[19px] font-bold text-gray-900 leading-tight">{data.name}</h1>
            <p className="text-[22px] font-bold text-indigo-600 mt-1">
              ₹{Number(data.price).toLocaleString('en-IN')}
            </p>
            {data.description && (
              <p className="text-[13px] text-gray-500 leading-relaxed mt-3">{data.description}</p>
            )}

            {data.is_in_stock ? (
              <button
                onClick={handleWhatsApp}
                className="mt-5 w-full bg-[#25D366] hover:bg-[#1ebe5c] active:bg-[#18ad52] text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2.5 shadow-md shadow-green-200 text-[15px]"
              >
                <WAIcon />
                Order on WhatsApp
              </button>
            ) : (
              <div className="mt-5 w-full bg-gray-100 text-gray-400 font-semibold py-4 rounded-2xl text-center text-[14px]">
                Currently Unavailable
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-gray-300 mt-6">Powered by ZeleraDeck</p>
      </main>
    </div>
  )
}
