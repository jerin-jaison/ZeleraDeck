import { useState, useEffect } from 'react'
import api from './api/axios'
import './App.css'

function App() {
  const [status, setStatus] = useState('checking') // 'checking' | 'connected' | 'unreachable'

  useEffect(() => {
    api.get('health/')
      .then(() => setStatus('connected'))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          ZeleraDeck
        </h1>
        <p className="text-gray-400 text-sm">Phase 1 — Link Verification</p>

        <div className="mt-6 px-8 py-5 rounded-2xl border bg-gray-900 border-gray-800">
          {status === 'checking' && (
            <p className="text-yellow-400 text-lg font-medium animate-pulse">
              Checking backend...
            </p>
          )}
          {status === 'connected' && (
            <p className="text-green-400 text-lg font-semibold">
              Backend connected ✅
            </p>
          )}
          {status === 'unreachable' && (
            <p className="text-red-400 text-lg font-semibold">
              Backend unreachable ❌
            </p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            GET http://localhost:8000/api/health/
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
