import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodePanel({ storeUrl }) {
  const canvasRef = useRef(null)

  const download = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'zeleradeck-qr.png'
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={canvasRef} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <QRCodeCanvas value={storeUrl} size={200} />
      </div>
      <button
        onClick={download}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-4 py-2 rounded-lg transition"
      >
        Download QR Code
      </button>
    </div>
  )
}
