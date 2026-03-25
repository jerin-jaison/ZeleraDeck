import { useState } from 'react'

export default function ImageWithFallback({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div className="relative w-full h-full bg-[#F8F8F8]">
      {/* Shimmer placeholder while loading */}
      {!loaded && !errored && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Fallback when image fails */}
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#D4D4D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {!errored && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
