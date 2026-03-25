export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-5">
      <div className="text-center max-w-xs">
        {/* Illustration */}
        <div className="w-20 h-20 rounded-3xl bg-white shadow-lg shadow-gray-200/60 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">Store not found</h1>
        <p className="text-[13px] text-gray-400 leading-relaxed">
          This store doesn't exist or the link may be incorrect. Double-check the URL and try again.
        </p>
      </div>
    </div>
  )
}
