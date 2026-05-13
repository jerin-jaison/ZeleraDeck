import { useEffect, useState, useRef, useCallback } from 'react'

const SPLASH_KEY = 'splashSeen'

export default function SplashScreen() {
  const [phase, setPhase] = useState(() =>
    sessionStorage.getItem(SPLASH_KEY) ? 'done' : 'entering'
  )
  const timerRef = useRef(null)
  const dismissed = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    clearTimeout(timerRef.current)
    sessionStorage.setItem(SPLASH_KEY, '1')
    setPhase('exiting')
  }, [])

  useEffect(() => {
    if (phase === 'done') return

    // Brief frame to allow CSS to initialise before animating in
    const enterTimer = requestAnimationFrame(() => setPhase('visible'))

    // Auto-dismiss after 10 s
    timerRef.current = setTimeout(dismiss, 10_000)

    const onScroll = () => dismiss()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(enterTimer)
      clearTimeout(timerRef.current)
      window.removeEventListener('scroll', onScroll)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'exiting') return
    const t = setTimeout(() => setPhase('done'), 900)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={`splash-root splash-${phase}`}
      onClick={dismiss}
      role="dialog"
      aria-label="Welcome to ZeleraDeck"
      aria-modal="true"
    >
      {/* Animated grain texture */}
      <div className="splash-grain" aria-hidden="true" />

      {/* Curtain panels — slide apart on dismiss */}
      <div className="splash-curtain splash-curtain-top" aria-hidden="true" />
      <div className="splash-curtain splash-curtain-bottom" aria-hidden="true" />

      {/* Central content */}
      <div className="splash-content">
        {/* Logo with gold glow */}
        <div className="splash-logo-wrap">
          <div className="splash-logo-glow" aria-hidden="true" />
          <img
            src="/logo-zd-nobg.png"
            alt="ZeleraDeck logo"
            className="splash-logo"
            draggable={false}
          />
        </div>

        {/* Brand name */}
        <h1 className="splash-brand">ZeleraDeck</h1>

        {/* Slogan */}
        <p className="splash-slogan">WHERE WE GROW TOGETHER</p>

        {/* Decorative divider */}
        <div className="splash-divider" aria-hidden="true">
          <span className="splash-line" />
          <span className="splash-star">✦</span>
          <span className="splash-line" />
        </div>

        {/* Entry hint */}
        <p className="splash-hint">tap anywhere to enter</p>
      </div>

      {/* Progress bar */}
      <div className="splash-progress-track" aria-hidden="true">
        <div className={`splash-progress-bar ${phase === 'visible' ? 'splash-progress-run' : ''}`} />
      </div>
    </div>
  )
}
