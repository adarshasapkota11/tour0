import { useId } from 'react'

export function LogoMark({ className = 'h-8 w-8' }) {
  const id = useId()
  const gid = id.replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-400)" />
          <stop offset="100%" stopColor="var(--brand-600)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="11" r="5" fill={`url(#${gid})`} opacity="0.35" />
      <path d="M3.5 27 12.5 9.5 17.5 18.5 21 13.5 28.5 27Z" fill={`url(#${gid})`} />
    </svg>
  )
}

export default function Logo({ markClass = 'h-8 w-8', textClass = 'text-xl', withText = true }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={markClass} />
      {withText && (
        <span className={`font-bold leading-none ${textClass}`}>
          <span className="text-ink">Tour</span>
          <span className="text-brand-600">Nepal</span>
        </span>
      )}
    </span>
  )
}
