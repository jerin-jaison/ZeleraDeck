import { useState } from 'react'

// An inline SVG data URI — grey box with simple image icon
const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23F3F4F6' width='400' height='400'/%3E%3Cg fill='%23D1D5DB'%3E%3Crect x='155' y='155' width='90' height='68' rx='6'/%3E%3Cpolygon points='135,223 175,183 205,208 245,170 265,223'/%3E%3Ccircle cx='178' cy='172' r='11'/%3E%3C/g%3E%3C/svg%3E"

export default function ImageWithFallback({ src, alt, className = '' }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setImgSrc(FALLBACK); setLoaded(true) }}
      />
    </div>
  )
}
