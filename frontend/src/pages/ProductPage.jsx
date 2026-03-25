import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronLeft } from 'lucide-react'
import ImageWithFallback from '../components/ImageWithFallback'

const API = 'https://zeleradeck.onrender.com/api/'

function WAIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function ProductPage() {
  const { slug, displayId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-public', slug, displayId],
    queryFn: () => axios.get(`${API}store/${slug}/product/${displayId}/`).then((r) => r.data),
    retry: false,
  })

  const handleWhatsApp = () => {
    const product = data.product
    const shop = data.shop
    const msg =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ *${product.name}*\n` +
      `🆔 ID: ${product.display_id}\n` +
      `💰 Price: ₹${Number(product.price).toLocaleString('en-IN')}\n` +
      `🔗 https://zelera-deck.vercel.app/store/${slug}/product/${displayId}\n\n` +
      `Please confirm availability. Thank you!`
    window.open(`https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto">
        <div className="aspect-square skeleton w-full" />
        <div className="px-4 mt-4 space-y-3">
          <div className="h-3 skeleton rounded-full w-1/4" />
          <div className="h-6 skeleton rounded-xl w-3/4" />
          <div className="h-8 skeleton rounded-xl w-1/2" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl font-bold text-[#F0F0F0]">404</p>
        <p className="text-base font-semibold text-[#0A0A0A] mt-2">Product not found</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-sm text-[#737373]">← Go back</button>
      </div>
    )
  }

  const { product, shop } = data
  const inStock = product.is_in_stock

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(`/store/${slug}`)}
        className="flex items-center gap-1 text-sm text-[#737373] px-4 pt-10 pb-3"
      >
        <ChevronLeft size={16} />
        Back to store
      </button>

      {/* Product image */}
      <div className="w-full aspect-square bg-[#F8F8F8]">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content */}
      <div className="px-4 mt-4 pb-32">
        <span className="inline-block text-xs bg-[#F0F0F0] text-[#737373] px-2 py-1 rounded-md font-mono">
          {product.display_id}
        </span>

        <h1 className="text-xl font-bold text-[#0A0A0A] mt-2">{product.name}</h1>
        <p className="text-2xl font-bold text-[#0A0A0A] mt-1">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>

        {/* Stock badge */}
        <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${
          inStock ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
        }`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>

        {product.description && (
          <p className="text-sm text-[#737373] mt-4 leading-relaxed">{product.description}</p>
        )}
      </div>

      {/* Sticky WhatsApp CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 pb-safe max-w-md mx-auto">
        {inStock ? (
          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
          >
            <WAIcon />
            Order on WhatsApp
          </button>
        ) : (
          <div className="w-full bg-[#F0F0F0] text-[#A3A3A3] font-medium rounded-xl py-3.5 text-sm text-center">
            Currently Out of Stock
          </div>
        )}
      </div>
    </div>
  )
}
