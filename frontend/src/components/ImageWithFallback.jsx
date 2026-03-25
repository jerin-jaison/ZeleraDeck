import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function ImageWithFallback({ src, alt, className = '', ...rest }) {
  const [status, setStatus] = useState(src ? 'loading' : 'error')

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
      {src && (
        <img
          src={src}
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
