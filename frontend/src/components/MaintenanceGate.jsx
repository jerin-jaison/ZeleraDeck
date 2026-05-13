import { useState, useEffect } from 'react'
import axios from 'axios'
import MaintenancePage from '../pages/MaintenancePage'

let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
if (!base.endsWith('/api/') && !base.endsWith('/api')) base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
if (!base.endsWith('/')) base += '/'

export default function MaintenanceGate({ children }) {
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const check = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await axios.get(`${base}status/`, {
          signal: controller.signal,
        })
        setStatus(res.data.maintenance)
        setMessage(res.data.message)
      } catch {
        // Fail open — show the app if API is down or timed out
        setStatus(false)
      } finally {
        clearTimeout(timeout)
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // Still loading — clean light spinner
  if (status === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #F0F0F0',
          borderTop: '3px solid #0A0A0A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  // Maintenance ON — but allow admin panel through
  if (status === true) {
    const isAdminPath = window.location.pathname.startsWith('/admin-panel')
    if (!isAdminPath) {
      return <MaintenancePage message={message} />
    }
  }

  return children
}
