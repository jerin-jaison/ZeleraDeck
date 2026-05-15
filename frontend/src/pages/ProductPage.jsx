import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, PlayCircle } from 'lucide-react'
import api from '../api/axios'
import ImageWithFallback from '../components/ImageWithFallback'
import SEOHead from '../components/SEOHead'

/** Append Cloudinary auto-format + quality optimisation */
function cloudinaryOptimize(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

const WA_SVG = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
)

// ── Swipeable media carousel ──────────────────────────────────────────────────
function MediaCarousel({ slides }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  if (!slides || slides.length === 0) return null

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only swipe if horizontal movement is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0 && current < slides.length - 1) setCurrent(current + 1)
      if (dx > 0 && current > 0) setCurrent(current - 1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const slide = slides[current]

  return (
    <div className="relative w-full aspect-square bg-[#F8F8F8] select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((s, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / slides.length}%` }}>
            {s.type === 'video' ? (
              <video
                src={s.url}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <ImageWithFallback
                src={s.url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Dot indicators — only show when multiple slides */}
      {slides.length > 1 && (
        <>
          {/* Counter badge top-right */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {current + 1} / {slides.length}
          </div>

          {/* Dot strip bottom-center */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50'
                } ${s.type === 'video' ? 'bg-amber-400' : ''}`}
              />
            ))}
          </div>

          {/* Swipe hint on first load */}
          {current === 0 && (
            <div className="absolute bottom-9 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full">
                Swipe to see more
              </span>
            </div>
          )}
        </>
      )}

      {/* Video slide indicator on thumbnail */}
      {slide.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg" />
        </div>
      )}
    </div>
  )
}

export default function ProductPage() {
  const { slug, displayId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['public-product', slug, displayId],
    queryFn: () => api.get(`store/${slug}/product/${displayId}/`).then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto">
        <div className="px-4 py-3"><div className="h-4 w-28 skeleton rounded" /></div>
        <div className="w-full aspect-square skeleton" />
        <div className="px-4 mt-4 space-y-3">
          <div className="h-4 w-20 skeleton rounded" />
          <div className="h-6 w-3/4 skeleton rounded" />
          <div className="h-6 w-1/3 skeleton rounded" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[96px] font-black text-[#F0F0F0] leading-none">404</p>
        <p className="text-xl font-bold mt-2">Product not found</p>
        <button onClick={() => navigate(`/store/${slug}`)} className="text-sm text-[#737373] underline mt-4">Back to store</button>
      </div>
    )
  }

  const { product, shop } = data

  // Build ordered slide list — only include non-null URLs
  const imageKeys = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4']
  const slides = [
    ...imageKeys
      .map((k) => product[k])
      .filter(Boolean)
      .map((url) => ({ type: 'image', url: cloudinaryOptimize(url) })),
    ...(product.video_url ? [{ type: 'video', url: product.video_url }] : []),
  ]

  const orderOnWhatsApp = () => {
    const message =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ Product: ${product.name}\n` +
      `🆔 ID: ${product.display_id}\n` +
      `💰 Price: ₹${product.price}\n` +
      `🔗 Link: https://zeleradeck.onrender.com/og/store/${slug}/product/${product.display_id}\n\n` +
      `Please confirm availability. Thank you!`
    window.open(`https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // ── Per-product SEO metadata ──
  const productTitle = `${product.name} — ${shop.name}`
  const productDesc = product.description
    ? `${product.description.slice(0, 140)}…`
    : `${product.name} available at ${shop.name}. Price: ₹${Number(product.price).toLocaleString('en-IN')}. Order on WhatsApp.`
  const productUrl = `https://zeleradeck.com/store/${slug}/product/${product.display_id}`
  const productImage = product.image_url ? cloudinaryOptimize(product.image_url) : 'https://zeleradeck.com/logo2.png'

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDesc,
    image: productImage,
    sku: product.display_id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.is_in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
    brand: { '@type': 'Brand', name: shop.name },
  }

  return (
    <>
      <SEOHead
        title={productTitle}
        description={productDesc}
        url={productUrl}
        image={productImage}
        schema={productSchema}
      />
    <div className="bg-white min-h-screen max-w-md mx-auto pb-24" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Back */}
      <button onClick={() => navigate(`/store/${slug}`)}
        className="px-4 py-3 flex items-center gap-1 text-sm text-[#737373]">
        <ChevronLeft className="w-4 h-4" /> Back to store
      </button>

      {/* Media carousel */}
      <MediaCarousel slides={slides} />

      {/* Out-of-stock overlay */}
      {!product.is_in_stock && (
        <div className="mx-4 mt-3 bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] text-xs font-medium px-3 py-2 rounded-xl text-center">
          Currently Out of Stock
        </div>
      )}

      {/* Content */}
      <div className="px-4 mt-4">
        <span className="inline-block text-xs bg-[#F0F0F0] text-[#737373] px-2 py-1 rounded-lg font-mono">
          {product.display_id}
        </span>
        <h1 className="text-xl font-bold mt-2">{product.name}</h1>
        <p className="text-2xl font-black mt-1">₹{Number(product.price).toLocaleString('en-IN')}</p>

        <div className="mt-2 inline-flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${product.is_in_stock ? 'bg-[#25D366]' : 'bg-[#EF4444]'}`} />
          <span className="text-sm text-[#737373]">{product.is_in_stock ? 'In Stock' : 'Out of Stock'}</span>
        </div>

        {product.description && (
          <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
            <p className="text-sm text-[#737373] leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 max-w-md mx-auto">
        {product.is_in_stock ? (
          <button onClick={orderOnWhatsApp}
            className="w-full bg-[#25D366] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2">
            {WA_SVG} Order on WhatsApp
          </button>
        ) : (
          <div className="w-full bg-[#F0F0F0] text-[#A3A3A3] rounded-xl py-4 font-medium text-center text-sm">
            Currently Out of Stock
          </div>
        )}
      </div>
    </div>
    </>
  )
}
