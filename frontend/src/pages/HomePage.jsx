import { useEffect } from 'react'
import SEOHead from '../components/SEOHead'

export default function HomePage() {
  useEffect(() => {
    document.title = 'ZeleraDeck — Where We Grow Together'
  }, [])

  return (
    <>
      <SEOHead
        title="ZeleraDeck — Where We Grow Together"
        description="ZeleraDeck gives Kerala shop owners a beautiful digital storefront with WhatsApp ordering. No app, no website needed. Set up in minutes."
        url="https://zeleradeck.com"
        keywords="digital catalogue Kerala, WhatsApp catalogue shop, ZeleraDeck, shop catalogue app India, Kerala SMB platform"
      />
      <div className="w-full h-screen overflow-hidden bg-[#0A0A0A]">
        <iframe
          src="/landing.html"
          title="ZeleraDeck Landing Page"
          className="w-full h-full border-0"
          style={{ width: '100vw', height: '100vh', border: 'none' }}
        />
      </div>
    </>
  )
}
