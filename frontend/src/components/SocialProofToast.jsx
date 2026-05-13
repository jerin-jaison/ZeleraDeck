import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const MESSAGES = [
  { name: "Marina's Jewels",  amount: '₹2,499', action: 'ordered today',    color: '#EC4899', initial: 'MJ' },
  { name: 'Spice & Blend',   amount: '₹3,850', action: 'stocked up',       color: '#F97316', initial: 'SB' },
  { name: 'Urban Threads',   amount: '₹1,200', action: 'just shipped',     color: '#3B82F6', initial: 'UT' },
  { name: 'Café Kerala',     amount: '₹4,120', action: 'updated catalogue', color: '#10B981', initial: 'CK' },
  { name: 'Raj Jewellers',   amount: '₹5,600', action: 'new orders in',    color: '#8B5CF6', initial: 'RJ' },
  { name: 'Beena Sarees',    amount: '₹2,100', action: 'went digital',     color: '#F43F5E', initial: 'BS' },
]

export default function SocialProofToast() {
  const [visible, setVisible]   = useState(false)
  const [exiting, setExiting]   = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const timers = useRef([])

  const clear = () => timers.current.forEach(clearTimeout)

  const dismiss = () => {
    setExiting(true)
    const t = setTimeout(() => setVisible(false), 300)
    timers.current.push(t)
  }

  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let idx = 0
    function showToast() {
      setMsgIndex(idx % MESSAGES.length)
      idx++
      setExiting(false)
      setVisible(true)

      const t1 = setTimeout(() => {
        setExiting(true)
        const t2 = setTimeout(() => {
          setVisible(false)
          const t3 = setTimeout(showToast, 8000 + Math.random() * 4000)
          timers.current.push(t3)
        }, 300)
        timers.current.push(t2)
      }, 4500)
      timers.current.push(t1)
    }

    const init = setTimeout(showToast, 3500)
    timers.current.push(init)
    return clear
  }, [])

  if (!visible) return null

  const msg = MESSAGES[msgIndex]

  return (
    <div
      className="fixed bottom-5 left-4 z-50 pointer-events-auto"
      style={{
        animation: exiting
          ? 'toastOut 0.3s ease-in forwards'
          : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        maxWidth: '300px',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative rounded-2xl p-4 flex items-center gap-3.5 shadow-2xl"
        style={{
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Avatar with gradient initial */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${msg.color}, ${msg.color}99)`,
          }}
        >
          {msg.initial}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {msg.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-tight" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <span className="font-semibold" style={{ color: msg.color }}>{msg.amount}</span>
            {' '}{msg.action}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="p-1 text-white/30 hover:text-white/70 flex-shrink-0 transition-colors rounded-lg cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Accent dot */}
        <div
          className="absolute top-3 right-10 w-1.5 h-1.5 rounded-full"
          style={{ background: msg.color, boxShadow: `0 0 6px ${msg.color}` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
