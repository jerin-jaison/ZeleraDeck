import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import api from '../api/axios'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const showToast = useToast()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (auth.hydrated && auth.isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.hydrated, auth.isAuthenticated])

  if (!auth.hydrated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('auth/login/', { phone, password })
      auth.login(data.access, data.refresh, data.shop_name, data.slug)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      showToast(err?.response?.data?.error || 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Brand top */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-16 pb-10">
        <img src="/logo-new.png" alt="ZeleraDeck" className="w-16 h-16 rounded-2xl object-cover" />
        <h1 className="text-2xl font-bold text-white mt-4">ZeleraDeck</h1>
        <p className="text-xs tracking-[0.2em] text-white/60 mt-2 font-semibold">WHERE GROWTH BEGINS</p>
      </div>

      {/* White bottom sheet */}
      <div className="flex-1 bg-white rounded-t-3xl p-6 pt-8" style={{ animation: 'slideUp 0.25s ease-out' }}>
        <h2 className="text-xl font-bold text-[#0A0A0A]">Welcome back</h2>
        <p className="text-sm text-[#737373] mt-1 mb-6">Sign in to manage your store</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason banners */}
          {reason === 'deactivated' && (
            <div className="bg-[#FEE2E2] rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#991B1B]">Your store has been deactivated. Contact ZeleraDeck support.</p>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-[#737373] mb-1.5">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={loading}
              required
              className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#737373]">Password</label>
              <a href="/contact" className="text-xs text-[#737373] underline">Forgot?</a>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 pr-12 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent placeholder:text-[#A3A3A3] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              >
                {showPw ? <EyeOff className="w-4 h-4 text-[#A3A3A3]" /> : <Eye className="w-4 h-4 text-[#A3A3A3]" />}
              </button>
            </div>
          </div>



          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white rounded-xl py-4 font-semibold text-sm hover:bg-[#2A2A2A] active:scale-[0.98] transition-all disabled:opacity-70 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-xs text-[#A3A3A3] text-center mt-6">
          Having trouble?{' '}
          <a href="/contact" className="underline text-[#737373]">Contact support</a>
        </p>
      </div>
    </div>
  )
}
