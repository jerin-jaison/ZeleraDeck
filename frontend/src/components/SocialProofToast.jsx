import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const MESSAGES = [
  { shop: 'Mia Fashion Hub',    action: 'just joined ZeleraDeck',       emoji: '🛍️' },
  { shop: 'Krishna Textiles',   action: 'started their free trial',     emoji: '✅' },
  { shop: 'Beena Sarees',       action: 'shared their catalogue',       emoji: '📲' },
  { shop: "John's Electronics", action: 'set up their shop',            emoji: '🔧' },
  { shop: 'Mercy Boutique',     action: 'added 20 new products',        emoji: '👗' },
  { shop: 'Angel Supermarket',  action: 'just chose us',                emoji: '🛒' },
  { shop: 'Raj Jewellers',      action: 'went digital today',           emoji: '💍' },
]

export default function SocialProofToast() {
  const [visible, setVisible]   = useState(false)
  const [exiting, setExiting]   = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const timers = useRef([])

  const clear = () => timers.current.forEach(clearTimeout)

  const dismiss = () => {
    setExiting(true)
    const t = setTimeout(() => setVisible(false), 380)
    timers.current.push(t)
  }

  useEffect(() => {
    let idx = 0

    function showToast() {
      setMsgIndex(idx % MESSAGES.length)
      idx++
      setExiting(false)
      setVisible(true)

      // auto-dismiss after 4 s
      const t1 = setTimeout(() => {
        setExiting(true)
        const t2 = setTimeout(() => {
          setVisible(false)
          // schedule next after 8-12 s random gap
          const t3 = setTimeout(showToast, 8000 + Math.random() * 4000)
          timers.current.push(t3)
        }, 380)
        timers.current.push(t2)
      }, 4000)
      timers.current.push(t1)
    }

    // first toast after 3 s
    const init = setTimeout(showToast, 3000)
    timers.current.push(init)

    return clear
  }, [])

  if (!visible) return null

  const msg = MESSAGES[msgIndex]

  return (
    <div
      className="fixed bottom-5 left-4 z-50 max-w-[272px] pointer-events-auto"
      style={{
        animation: exiting
          ? 'toastOut 0.38s ease-in forwards'
          : 'toastIn 0.38s ease-out forwards',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-3.5 flex items-center gap-3">
        {/* Emoji icon */}
        <div className="w-9 h-9 bg-[#F8F8F8] rounded-xl flex items-center justify-center flex-shrink-0 text-[18px] leading-none select-none">
          {msg.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#0A0A0A] leading-tight truncate">
            {msg.shop}
          </p>
          <p className="text-xs text-[#737373] mt-0.5 leading-tight">
            {msg.action}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="p-0.5 text-[#D4D4D4] hover:text-[#737373] flex-shrink-0 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
