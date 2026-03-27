import Logo from '../components/Logo'

export default function MaintenancePage({ message }) {
  const displayMsg = message || "ZeleraDeck is under maintenance.\nWe're making things better for you."

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Layer 1 — Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Layer 2 — Green glow orb */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 300, height: 300,
          background: '#25D366',
          opacity: 0.04,
          animation: 'mPulse 3s ease-in-out infinite',
        }}
      />

      {/* Layer 3 — Floating ambient cards */}
      <div
        className="absolute bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-[11px] text-[#444]"
        style={{ top: '15%', left: '4%', animation: 'float1 5s ease-in-out infinite' }}
      >
        🔧 Updating system
      </div>
      <div
        className="absolute bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-[11px] text-[#444]"
        style={{ top: '18%', right: '4%', animation: 'float2 6s ease-in-out infinite 1s' }}
      >
        ⚡ Almost there
      </div>
      <div
        className="absolute bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-[11px] text-[#444]"
        style={{ bottom: '16%', left: '6%', animation: 'float2 5.5s ease-in-out infinite 0.5s' }}
      >
        🛠 Fixing things
      </div>

      {/* Layer 4 — Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Orbit animation */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Center piece */}
          <div
            className="w-14 h-14 bg-[#0A0A0A] border-2 border-[#25D366] rounded-2xl flex items-center justify-center"
            style={{ animation: 'mPulse 2.5s ease-in-out infinite' }}
          >
            <Logo size={28} theme="light" />
          </div>
          {/* Orbiting dot 1 */}
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-[#25D366]"
            style={{ animation: 'orbit 3s linear infinite' }}
          />
          {/* Orbiting dot 2 */}
          <div
            className="absolute w-2 h-2 rounded-full bg-white opacity-50"
            style={{ animation: 'orbit2 4.5s linear infinite' }}
          />
        </div>

        {/* Title */}
        <h1
          className="mt-6 text-2xl font-extrabold text-white tracking-tight text-center"
          style={{ animation: 'slidein 0.6s ease-out' }}
        >
          We'll be back soon
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-[#737373] text-center max-w-xs leading-relaxed whitespace-pre-line">
          {displayMsg}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-60">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] text-[#555]">Working on it...</span>
            <span className="text-[#25D366] text-sm">●</span>
          </div>
          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#25D366] rounded-full"
              style={{ animation: 'barfill 3s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#25D366]"
              style={{ animation: `dotpulse 1.4s ease-in-out infinite ${i * 0.16}s` }}
            />
          ))}
        </div>

        {/* URL tag */}
        <div className="mt-6 bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-[11px] text-[#555]">
          <span className="text-[#25D366] font-semibold">zeleradeck.com</span> — back shortly
        </div>
      </div>
    </div>
  )
}
