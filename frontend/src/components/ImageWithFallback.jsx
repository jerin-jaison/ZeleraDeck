import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/** Inserts Cloudinary auto-format + auto-quality transformations into image URLs */
function cloudinaryOptimize(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url
  // Avoid double-inserting
  if (url.includes('f_auto') || url.includes('q_auto')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export default function ImageWithFallback({ src, alt, className = '', ...rest }) {
  const optimizedSrc = cloudinaryOptimize(src)
  const [status, setStatus] = useState(optimizedSrc ? 'loading' : 'error')

  return (
    <div className={`relative bg-[#F8F8F8] overflow-hidden ${className}`} {...rest}>
      {status === 'loading' && (
        <div className="absolute inset-0 skeleton" />
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8F8F8]">
          <ImageOff className="w-6 h-6 text-[#D4D4D4]" />
        </div>
      )}
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`w-full h-full object-cover ${status === 'loaded' ? '' : 'invisible'}`}
        />
      )}
    </div>
  )
}
