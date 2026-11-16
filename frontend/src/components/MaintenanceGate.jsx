import { useState, useEffect, lazy, Suspense } from 'react'
import axios from 'axios'

const MaintenancePage = lazy(() => import('../pages/MaintenancePage'))

let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
if (!base.endsWith('/api/') && !base.endsWith('/api')) base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
if (!base.endsWith('/')) base += '/'

export default function MaintenanceGate({ children }) {
  // Non-blocking: defaults to false so the application renders immediately without waiting for network
  const [status, setStatus] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await axios.get(`${base}status/`, {
          signal: controller.signal,
        })
        if (mounted) {
          setStatus(Boolean(res.data?.maintenance))
          setMessage(res.data?.message || '')
        }
      } catch {
        // Fail open — keep app accessible if API is down or timed out
        if (mounted) setStatus(false)
      } finally {
        clearTimeout(timeout)
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Maintenance ON — but keep admin panel exception accessible
  if (status === true) {
    const isAdmin = window.location.pathname.startsWith('/admin-panel')
    if (!isAdmin) {
      return (
        <Suspense fallback={null}>
          <MaintenancePage message={message} />
        </Suspense>
      )
    }
  }

  // Non-blocking: renders app immediately
  return children
}
