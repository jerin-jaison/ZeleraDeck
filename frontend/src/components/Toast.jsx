import { useState, useCallback } from 'react'

let _setToast = null

export function toast(msg, type = 'success') {
  if (_setToast) _setToast({ msg, type, id: Date.now() })
}

export default function Toast() {
  const [current, setCurrent] = useState(null)

  // Register the setter globally so toast() utility can call it
  _setToast = useCallback((t) => {
    setCurrent(t)
    setTimeout(() => setCurrent(null), 3000)
  }, [])

  if (!current) return null

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[100] max-w-md mx-auto"
      style={{ animation: 'toastIn 0.25s ease-out' }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[#F0F0F0] px-4 py-3 flex items-center gap-3">
        {/* Indicator dot */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            current.type === 'success' ? 'bg-[#25D366]' : 'bg-[#EF4444]'
          }`}
        />
        <p className="text-sm text-[#0A0A0A] font-medium">{current.msg}</p>
      </div>
    </div>
  )
}
