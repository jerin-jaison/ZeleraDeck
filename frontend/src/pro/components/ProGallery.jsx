import React, { useState } from 'react';
import { Play } from 'lucide-react';

function cloudinaryOptimize(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export default function ProGallery({ image_url, image_url_2, image_url_3, image_url_4, video_url }) {
  // Collect all media items: exactly up to 4 items (3 images + 1 video, or whichever are populated)
  // Standard logic:
  // image_url is main.
  // We can treat image_url, image_url_2, image_url_3, image_url_4 (up to 3 distinct photos + 1 video or all photos + video)
  // Let's filter out any null/undefined/empty URLs.
  const mediaItems = [];
  if (image_url) mediaItems.push({ type: 'image', url: image_url });
  if (image_url_2) mediaItems.push({ type: 'image', url: image_url_2 });
  if (image_url_3) mediaItems.push({ type: 'image', url: image_url_3 });
  if (image_url_4) mediaItems.push({ type: 'image', url: image_url_4 });
  if (video_url) mediaItems.push({ type: 'video', url: video_url });

  const [activeMedia, setActiveMedia] = useState(mediaItems[0] || null);

  if (mediaItems.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-[var(--pro-surface-container-low)] flex items-center justify-center">
        <span className="pro-label-caps text-neutral-400">No media available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails (Left side on desktop, bottom on mobile) */}
      <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible shrink-0 pb-2 md:pb-0">
        {mediaItems.map((item, idx) => {
          const isActive = activeMedia?.url === item.url;
          return (
            <button
              key={idx}
              onClick={() => setActiveMedia(item)}
              className={`pro-gallery-thumb shrink-0 w-16 h-20 md:w-20 md:h-24 bg-[var(--pro-surface-container-low)] relative overflow-hidden transition-all duration-200 border-2 ${
                isActive ? 'border-black' : 'border-transparent'
              }`}
            >
              {item.type === 'image' ? (
                <img
                  src={cloudinaryOptimize(item.url)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-black/10">
                  <Play className="w-6 h-6 text-black relative z-10" />
                  {/* Show main image as video thumbnail if possible */}
                  {image_url && (
                    <img
                      src={cloudinaryOptimize(image_url)}
                      alt="Video thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main View Area (Right side on desktop, top on mobile) */}
      <div className="order-1 md:order-2 flex-1 aspect-[3/4] bg-[var(--pro-surface-container-low)] overflow-hidden relative">
        {activeMedia?.type === 'image' ? (
          <img
            src={cloudinaryOptimize(activeMedia.url)}
            alt="Active media"
            className="w-full h-full object-cover transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              src={activeMedia?.url}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          </div>
        )}
      </div>
    </div>
  );
}
