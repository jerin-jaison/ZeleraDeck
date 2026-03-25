import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import QRCodePanel from '../components/QRCodePanel'

function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${h} ${w} bg-gray-100 rounded-full animate-pulse`} />
}

export default function StoreInfo() {
  const [copied, setCopied] = useState(false)

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shopMe'],
    queryFn: () => api.get('shop/me/').then((r) => r.data),
  })

  const storeUrl = shop ? `https://zeleradeck.com/store/${shop.slug}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const shareWhatsApp = () => {
    const text = `Browse our products: ${storeUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-5 pb-10 space-y-4">
        <h2 className="text-[17px] font-bold text-gray-900">My Store Link</h2>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <SkeletonLine w="w-1/3" h="h-3" />
            <SkeletonLine w="w-4/5" h="h-4" />
            <div className="flex gap-3 pt-1">
              <SkeletonLine h="h-11" />
              <SkeletonLine h="h-11" />
            </div>
          </div>
        ) : (
          <>
            {/* Link card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Public Store Link
              </p>
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-[13px] font-medium break-all leading-relaxed hover:text-indigo-800 transition-colors"
              >
                {storeUrl}
              </a>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={copyLink}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5c] text-white text-[13px] font-bold transition-colors shadow-sm shadow-green-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* QR card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-5">
                QR Code
              </p>
              <QRCodePanel storeUrl={storeUrl} />
            </div>
          </>
        )}

        <div className="h-4" />
      </main>
    </div>
  )
}
