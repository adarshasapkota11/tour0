const gradients = [
  'from-brand-400 to-brand-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-rose-500',
  'from-violet-400 to-purple-600',
  'from-sky-400 to-indigo-600',
]

export default function Media({ src, alt, label, className }) {
  if (src) {
    return <img src={src} alt={alt || label} className={className} loading="lazy" />
  }
  const index = [...(label || '')].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % gradients.length
  return (
    <div
      className={`${className} bg-gradient-to-br ${gradients[index]} flex items-center justify-center`}
    >
      <span className="text-5xl text-white/90 font-extrabold tracking-tight">
        {(label || '?').slice(0, 1).toUpperCase()}
      </span>
    </div>
  )
}
