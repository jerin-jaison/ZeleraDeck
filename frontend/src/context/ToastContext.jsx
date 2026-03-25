import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 left-4 right-4 z-[100] max-w-sm mx-auto space-y-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-lg border border-[#F0F0F0] p-4 flex items-center gap-3 pointer-events-auto"
              style={{ animation: 'slideUp 0.25s ease-out' }}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                t.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#25D366]'
              }`} />
              <p className="text-sm text-[#0A0A0A] flex-1">{t.message}</p>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
