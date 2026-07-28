import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg', 0.92)
  })
}

export default function ImageCropModal({
  imageSrc,
  aspect = 3 / 4,
  title = 'Crop Image',
  onCropComplete,
  onCancel,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropChange = (crop) => setCrop(crop)
  const handleZoomChange = (zoom) => setZoom(zoom)

  const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleDone = async () => {
    if (!croppedAreaPixels || isProcessing) return
    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedBlob) {
        onCropComplete(croppedBlob)
      }
    } catch (e) {
      console.error('Error cropping image:', e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#e2e2e2] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e2e2] flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="font-serif text-lg text-black uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-[#7e7576] font-sans">
              Drag to position or zoom to fit the frame perfectly.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="material-symbols-outlined text-[#4c4546] hover:text-black transition-colors text-[20px]"
          >
            close
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 sm:h-96 bg-[#111]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onCropComplete={onCropAreaChange}
            showGrid={true}
          />
        </div>

        {/* Controls & Zoom Slider */}
        <div className="p-6 space-y-4 bg-white border-t border-[#e2e2e2]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[18px] text-[#7e7576]">zoom_out</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-black h-1 bg-[#e2e2e2] rounded-lg cursor-pointer"
            />
            <span className="material-symbols-outlined text-[18px] text-[#7e7576]">zoom_in</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-black text-black text-[11px] uppercase tracking-[0.1em] font-semibold hover:bg-[#f3f3f3] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={isProcessing}
              className="px-8 py-2.5 bg-black text-white text-[11px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
