import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('auth/login/', { phone, password })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('shop_name', data.shop_name)
      localStorage.setItem('slug', data.slug)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Brand area — top 40% */}
      <div className="flex-[2] flex flex-col items-center justify-center px-6">
        {/* Z logo */}
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-[#0A0A0A]">Z</span>
        </div>
        <h1 className="text-xl font-bold text-white">ZeleraDeck</h1>
        <p className="text-sm text-[#737373] mt-1">Your shop. One link.</p>
      </div>

      {/* Login sheet — bottom 60% */}
      <div
        className="flex-[3] bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Welcome back</h2>
        <p className="text-sm text-[#737373] mt-1 mb-6">Login to manage your store</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={loading}
              required
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 pr-12 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#737373] p-1"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] active:scale-[0.98] text-white font-medium rounded-xl py-3 text-sm transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Logging in…' : 'Log In'}
          </button>

          {/* Error */}
          {error && (
            <p className="text-xs text-[#EF4444] text-center flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </form>

        <p className="text-xs text-center text-[#737373] mt-8">
          Having trouble? Contact support
        </p>
      </div>
    </div>
  )
}
