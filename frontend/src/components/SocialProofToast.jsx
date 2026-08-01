import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import gsap from 'gsap'

const MESSAGES = [
  { name: "Marina's Jewels",  amount: '₹2,499', action: 'ordered via WhatsApp', initial: 'MJ' },
  { name: 'Spice & Blend',   amount: '₹3,850', action: 'updated online catalogue', initial: 'SB' },
  { name: 'Urban Threads',   amount: '₹1,200', action: 'received new customer order', initial: 'UT' },
  { name: 'Café Kerala',     amount: '₹4,120', action: 'catalogue shared to WhatsApp', initial: 'CK' },
  { name: 'Raj Jewellers',   amount: '₹5,600', action: 'new orders processing', initial: 'RJ' },
  { name: 'Beena Sarees',    amount: '₹2,100', action: 'launched digital storefront', initial: 'BS' },
]

export default function SocialProofToast() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const toastRef = useRef(null)
  const timerRef = useRef(null)
  const isHoveredRef = useRef(false)

  const msg = MESSAGES[msgIndex]

  const animateOut = (onComplete) => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        x: -30,
        opacity: 0,
        scale: 0.95,
        filter: 'blur(4px)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setVisible(false)
          if (onComplete) onComplete()
        },
      })
    } else {
      setVisible(false)
      if (onComplete) onComplete()
    }
  }

  const showNext = () => {
    setMsgIndex((prev) => (prev + 1) % MESSAGES.length)
    setVisible(true)
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Initial delay before first toast
    const initTimer = setTimeout(() => {
      setVisible(true)
    }, 3500)

    return () => clearTimeout(initTimer)
  }, [])

  // Animate entrance on visibility
  useEffect(() => {
    if (visible && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { x: -30, opacity: 0, scale: 0.95, filter: 'blur(4px)' },
        { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' }
      )

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (!isHoveredRef.current) {
          animateOut(() => {
            setTimeout(showNext, 8500)
          })
        }
      }, 4500)
    }
  }, [visible, msgIndex])

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    animateOut()
  }

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    timerRef.current = setTimeout(() => {
      animateOut(() => {
        setTimeout(showNext, 8500)
      })
    }, 2000)
  }

  if (!visible) return null

  return (
    <div
      ref={toastRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-6 left-6 z-[9999] pointer-events-auto max-w-xs w-[calc(100vw-3rem)] sm:w-80 overflow-hidden rounded-xl border border-[#C8B29B]/30 bg-[#121216]/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all"
      role="status"
      aria-live="polite"
    >
      {/* Hairline champagne left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8B29B]" />

      <div className="flex items-start gap-3 pl-1">
        {/* Avatar badge */}
        <div className="w-9 h-9 rounded-lg bg-[#C8B29B]/10 border border-[#C8B29B]/30 flex items-center justify-center flex-shrink-0 text-[#C8B29B] font-mono text-xs font-bold">
          {msg.initial}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F04A2A]/10 text-[#F04A2A] border border-[#F04A2A]/30">
              LIVE MERCHANT ACTIVITY
            </span>
          </div>
          <p className="text-xs font-semibold text-[#F0EFEA] truncate">
            {msg.name}
          </p>
          <p className="text-[11px] text-[#888890] mt-0.5 leading-tight">
            <span className="font-mono text-[#C8B29B] font-semibold">{msg.amount}</span> — {msg.action}
          </p>
        </div>

        {/* Manual Close Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-[#888890] hover:text-[#F0EFEA] transition-colors p-1 rounded-md hover:bg-white/5 focus:outline-none cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
