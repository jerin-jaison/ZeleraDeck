import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, ExternalLink, Download, CheckCircle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'

export default function StoreInfo() {
  const showToast = useToast()
  const [copied, setCopied] = useState(false)

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop-me'],
    queryFn: () => api.get('shop/me/').then((r) => r.data),
  })

  const { data: productsData } = useQuery({
    queryKey: ['shop-products-stats'],
    queryFn: () => api.get('shop/products/?page_size=48').then((r) => r.data),
  })

  // API now returns { products: [...], pagination: {...} }
  const productList = productsData?.products ?? []
  const storeUrl = shop ? `https://zelera-deck.vercel.app/store/${shop.slug}` : ''
  const total = productList.length > 0 ? (productsData?.pagination?.total ?? productList.length) : 0
  const inStock = productList.filter((p) => p.is_in_stock).length
  const outOfStock = productList.filter((p) => !p.is_in_stock).length

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    showToast('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const canvas = document.getElementById('store-qr-code')
    if (!canvas) { showToast('QR code not ready', 'error'); return }
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `zeleradeck-${shop.slug}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast('QR code downloaded!')
  }

  const shareWhatsApp = () => {
    const msg = `Browse our catalogue: ${storeUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Skeleton
  const Skel = ({ className }) => <div className={`skeleton rounded-lg ${className}`} />

  if (isLoading) {
    return (
      <div className="bg-[#F8F8F8] min-h-screen pb-24 max-w-md mx-auto">
        <div className="px-4 pt-6 pb-2"><Skel className="h-7 w-28" /></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 mx-4 mt-3 border border-[#F0F0F0]">
            <Skel className="h-3 w-20 mb-3" />
            <Skel className="h-12 w-full mb-3" />
            <Skel className="h-10 w-full" />
          </div>
        ))}
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="bg-[#F8F8F8] min-h-screen pb-24 max-w-md mx-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold text-[#0A0A0A]">My Store</h1>
      </div>

      {/* CARD 1: Store Link */}
      <div className="bg-white rounded-2xl p-4 mx-4 mt-4 border border-[#F0F0F0]">
        <p className="text-xs text-[#737373] font-medium mb-3">Store link</p>
        <div className="bg-[#F8F8F8] rounded-xl p-3">
          <p className="font-mono text-sm text-[#0A0A0A] break-all select-all">
            zelera-deck.vercel.app/store/{shop.slug}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={copyLink}
            className="flex items-center justify-center gap-1.5 border border-[#E5E5E5] rounded-xl py-2.5 text-xs font-medium text-[#0A0A0A]">
            {copied ? <><CheckCircle className="w-3.5 h-3.5 text-[#25D366]" /><span className="text-[#25D366]">Copied! ✓</span></> :
              <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
          </button>
          <button onClick={() => window.open(storeUrl, '_blank')}
            className="flex items-center justify-center gap-1.5 border border-[#E5E5E5] rounded-xl py-2.5 text-xs font-medium text-[#0A0A0A]">
            <ExternalLink className="w-3.5 h-3.5" /> Open Store
          </button>
        </div>
        <button onClick={shareWhatsApp}
          className="w-full mt-2 bg-[#25D366] text-white rounded-xl py-3 text-xs font-medium flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </button>
      </div>

      {/* CARD 2: QR Code */}
      <div className="bg-white rounded-2xl p-4 mx-4 mt-3 border border-[#F0F0F0]">
        <p className="text-xs text-[#737373] font-medium mb-3">QR Code</p>
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl border border-[#F0F0F0] inline-block">
            <QRCodeCanvas
              id="store-qr-code"
              value={storeUrl}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>
        <p className="text-xs text-[#737373] text-center mt-3">Customers scan this to browse your products</p>
        <button onClick={downloadQR}
          className="w-full mt-3 flex items-center justify-center gap-1.5 border border-[#E5E5E5] rounded-xl py-2.5 text-xs font-medium text-[#0A0A0A]">
          <Download className="w-3.5 h-3.5" /> Download QR Code
        </button>
        <div className="mt-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3">
          <p className="text-xs text-[#166534]">
            💡 Print this QR and place it at your counter so walk-in customers can browse your full catalogue
          </p>
        </div>
      </div>

      {/* CARD 3: Stats */}
      <div className="bg-white rounded-2xl p-4 mx-4 mt-3 border border-[#F0F0F0]">
        <p className="text-xs text-[#737373] font-medium mb-3">Quick Stats</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: total },
            { label: 'In Stock', value: inStock, color: 'text-[#166534]' },
            { label: 'Out of Stock', value: outOfStock, color: 'text-[#991B1B]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#F8F8F8] rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${color || 'text-[#0A0A0A]'}`}>{value}</p>
              <p className="text-[10px] text-[#737373] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 4: Account */}
      <div className="bg-white rounded-2xl p-4 mx-4 mt-3 border border-[#F0F0F0]">
        <p className="text-xs text-[#737373] font-medium mb-3">Account</p>
        {shop.logo_url && (
          <img src={shop.logo_url} alt="Shop logo" className="w-16 h-16 rounded-xl object-cover border border-[#F0F0F0] mb-3" />
        )}
        {[
          { label: 'Store Name', value: shop.name },
          { label: 'Phone', value: shop.phone },
          { label: 'WhatsApp', value: shop.whatsapp_number },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2.5 border-b border-[#F8F8F8] last:border-0">
            <span className="text-xs text-[#737373]">{label}</span>
            <span className="text-xs text-[#0A0A0A] font-medium text-right">{value}</span>
          </div>
        ))}
        <div className="mt-3 bg-[#F8F8F8] rounded-xl p-3">
          <p className="text-xs text-[#737373]">To change your password, contact ZeleraDeck support</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
