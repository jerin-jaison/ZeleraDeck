import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-[#F0F0F0]">404</p>
      <p className="text-lg font-semibold text-[#0A0A0A] mt-2">Store not found</p>
      <p className="text-sm text-[#737373] mt-1 max-w-xs">
        This store link doesn't exist. Please check the URL.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="mt-8 border border-[#E5E5E5] bg-white text-[#111111] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#F8F8F8] transition-colors"
      >
        Go to Login
      </button>
    </div>
  )
}
