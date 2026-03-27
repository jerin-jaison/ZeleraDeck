export default function Logo({ size = 32, variant = 'icon', theme = 'dark' }) {
  const icon = (
    <img
      src="/logo2.png"
      alt="ZeleraDeck"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      className="rounded-xl"
    />
  )

  if (variant === 'icon') return icon

  const textColor = theme === 'light' ? '#ffffff' : '#0A0A0A'

  if (variant === 'full-stacked') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        {icon}
        <span style={{ fontSize: size * 0.55, fontWeight: 700, color: textColor, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
          ZeleraDeck
        </span>
      </div>
    )
  }

  // variant === 'full'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon}
      <div>
        <span style={{ fontSize: size * 0.55, fontWeight: 700, color: textColor, letterSpacing: '-0.3px', display: 'block', lineHeight: 1.1 }}>
          ZeleraDeck
        </span>
      </div>
    </div>
  )
}
