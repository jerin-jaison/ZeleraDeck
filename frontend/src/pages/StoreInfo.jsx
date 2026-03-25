import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeCanvas } from 'qrcode.react'
import { Copy, ExternalLink } from 'lucide-react'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import Toast, { toast } from '../components/Toast'

const FRONTEND = 'https://zelera-deck.vercel.app'

function WAIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function StoreInfo() {
  const [copied, setCopied] = useState(false)

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop-info'],
    queryFn: () => api.get('shop/info/').then((r) => r.data),
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('shop/products/').then((r) => r.data),
  })

  const storeUrl = shop ? `${FRONTEND}/store/${shop.slug}` : ''
  const displayUrl = shop ? `zelera-deck.vercel.app/store/${shop.slug}` : '…'

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast('Link copied!')
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById('store-qr-canvas')?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `zeleradeck-${shop?.slug}-qr.png`
    a.click()
    toast('QR code downloaded')
  }

  const inStock = products?.filter((p) => p.is_in_stock).length ?? 0
  const outOfStock = products?.filter((p) => !p.is_in_stock).length ?? 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] max-w-md mx-auto pb-24">
        <div className="px-4 pt-10 pb-4">
          <div className="h-6 skeleton rounded-full w-1/3 mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 mb-3 h-32 skeleton" />
          ))}
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <Toast />
      <div className="max-w-md mx-auto pb-24">
        <h1 className="text-xl font-bold text-[#0A0A0A] px-4 pt-10 pb-4">My Store</h1>

        {/* ── Card 1: Store Link ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mx-4">
          <p className="text-xs text-[#737373] font-medium mb-3">Your store link</p>

          <div className="bg-[#F8F8F8] rounded-xl p-3 mb-3">
            <p className="text-sm font-mono text-[#0A0A0A] break-all">{displayUrl}</p>
          </div>

          {/* Copy + Open row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 border border-[#E5E5E5] bg-white rounded-xl py-2.5 text-sm font-medium transition-colors hover:bg-[#F8F8F8]"
            >
              <Copy size={14} className={copied ? 'text-[#25D366]' : 'text-[#0A0A0A]'} />
              <span className={copied ? 'text-[#25D366]' : 'text-[#0A0A0A]'}>
                {copied ? 'Copied! ✓' : 'Copy Link'}
              </span>
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border border-[#E5E5E5] bg-white rounded-xl py-2.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#F8F8F8] transition-colors"
            >
              <ExternalLink size={14} />
              Open Store
            </a>
          </div>

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Browse our catalogue: ${storeUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] text-white rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            <WAIcon />
            Share on WhatsApp
          </a>
        </div>

        {/* ── Card 2: QR Code ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mx-4 mt-3">
          <p className="text-xs text-[#737373] font-medium mb-3">Store QR Code</p>

          <div id="store-qr-canvas" className="flex justify-center mb-3">
            <div className="p-4 bg-white border border-[#F0F0F0] rounded-2xl">
              {storeUrl && (
                <QRCodeCanvas
                  value={storeUrl}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#0A0A0A"
                  level="M"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-[#737373] text-center mb-3">
            Customers scan this to browse your products
          </p>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 w-full border border-[#E5E5E5] bg-white rounded-xl py-2.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#F8F8F8] transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download QR Code as PNG
          </button>

          {/* Print tip */}
          <div className="bg-[#F0FDF4] rounded-xl p-3">
            <p className="text-xs text-[#166534] leading-relaxed">
              💡 Print this QR code and place it at your counter so walk-in customers can browse your full catalogue
            </p>
          </div>
        </div>

        {/* ── Card 3: Quick Stats ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mx-4 mt-3">
          <p className="text-xs text-[#737373] font-medium mb-3">Quick Stats</p>
          <div className="flex gap-3">
            {[
              { label: 'Products',     value: products?.length ?? '…' },
              { label: 'In Stock',     value: inStock,     color: 'text-[#166534]' },
              { label: 'Out of Stock', value: outOfStock,  color: 'text-[#991B1B]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex-1 bg-[#F8F8F8] rounded-xl p-3">
                <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
                <p className="text-xs text-[#737373] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 4: Account Info ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 mx-4 mt-3">
          <p className="text-xs text-[#737373] font-medium mb-3">Account</p>

          {[
            { label: 'Store Name', value: shop?.name },
            { label: 'Phone',      value: shop?.phone },
            { label: 'WhatsApp',   value: shop?.whatsapp_number },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-[#F0F0F0] last:border-0">
              <span className="text-xs text-[#737373]">{label}</span>
              <span className="text-xs text-[#0A0A0A] font-medium">{value || '—'}</span>
            </div>
          ))}

          {/* Store status */}
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-[#737373]">Store Status</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              shop?.is_active
                ? 'bg-[#DCFCE7] text-[#166534]'
                : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}>
              {shop?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Password note */}
          <div className="bg-[#F8F8F8] rounded-xl p-3 mt-3">
            <p className="text-xs text-[#737373]">
              To change your password, contact ZeleraDeck support on WhatsApp
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
