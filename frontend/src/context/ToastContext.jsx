import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import gsap from 'gsap'

const ToastContext = createContext(null)

function ToastItem({ toast, onRemove }) {
  const toastRef = useRef(null)
  const timerRef = useRef(null)
  const isHoveredRef = useRef(false)
  const [isExiting, setIsExiting] = useState(false)

  const isError = toast.type === 'error'

  // Animate Entrance with GSAP
  useEffect(() => {
    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        {
          x: 40,
          opacity: 0,
          scale: 0.95,
          filter: 'blur(6px)',
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power3.out',
        }
      )
    }
  }, [])

  const triggerDismiss = useCallback(() => {
    if (isExiting) return
    setIsExiting(true)

    if (toastRef.current) {
      gsap.to(toastRef.current, {
        x: 40,
        opacity: 0,
        scale: 0.9,
        filter: 'blur(6px)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onRemove(toast.id)
        },
      })
    } else {
      onRemove(toast.id)
    }
  }, [isExiting, onRemove, toast.id])

  // Auto-dismiss timer handling with hover pause capability
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        triggerDismiss()
      }
    }, 4200)
  }, [triggerDismiss])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    startTimer()
  }

  return (
    <div
      ref={toastRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border p-4 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all ${
        isError
          ? 'bg-[#121216]/95 border-[#F04A2A]/40 shadow-[0_0_20px_rgba(240,74,42,0.15)]'
          : 'bg-[#121216]/95 border-[#C8B29B]/40 shadow-[0_0_20px_rgba(200,178,155,0.1)]'
      }`}
    >
      {/* Hairline left accent border */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isError ? 'bg-[#F04A2A]' : 'bg-[#C8B29B]'
        }`}
      />

      <div className="flex items-start gap-3 pl-1">
        {/* Status Icon */}
        <div className="mt-0.5 flex-shrink-0">
          {isError ? (
            <div className="p-1 rounded-lg bg-[#F04A2A]/10 text-[#F04A2A]">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded-lg bg-[#C8B29B]/10 text-[#C8B29B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isError
                  ? 'bg-[#F04A2A]/10 text-[#F04A2A] border-[#F04A2A]/30'
                  : 'bg-[#C8B29B]/10 text-[#C8B29B] border-[#C8B29B]/30'
              }`}
            >
              {isError ? 'System Alert' : 'Notification'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#F0EFEA] leading-relaxed font-sans font-medium">
            {toast.message}
          </p>
        </div>

        {/* Manual Close Button */}
        <button
          onClick={triggerDismiss}
          className="flex-shrink-0 text-[#888890] hover:text-[#F0EFEA] transition-colors p-1 rounded-md hover:bg-white/5 focus:outline-none cursor-pointer"
          aria-label="Dismiss toast notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast container - Top Right Fixed Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-[calc(100vw-2.5rem)] sm:w-80">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
