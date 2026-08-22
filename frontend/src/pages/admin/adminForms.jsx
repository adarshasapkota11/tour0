import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const inputClass =
  'w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card text-ink placeholder:text-ink-faint'
export const labelClass = 'block text-sm font-medium text-ink-subtle mb-1'
export const tableWrap = 'bg-card border border-line rounded-2xl overflow-hidden'
export const thClass = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted'
export const tdClass = 'px-4 py-3 text-sm text-ink-subtle'

export function TextField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  )
}

export function TextAreaField({ label, id, rows = 5, ...props }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea id={id} rows={rows} className={inputClass} {...props} />
    </div>
  )
}

export function SelectField({ label, id, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select id={id} className={inputClass} {...props}>
        {children}
      </select>
    </div>
  )
}

export function CheckboxField({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink-subtle cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded border-line-strong accent-brand-600" {...props} />
      {label}
    </label>
  )
}

export function ImageField({ label, id, current, onChange }) {
  const [preview, setPreview] = useState(current || '')

  useEffect(() => setPreview(current || ''), [current])

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : current || '')
    onChange(file || null)
  }

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-line" />
        ) : (
          <div className="w-28 h-20 flex items-center justify-center rounded-lg border border-dashed border-line-strong text-ink-faint text-xs">
            No image
          </div>
        )}
        <div className="flex-1">
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-ink-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-brand-tint file:text-brand-tint-fg file:text-sm file:font-semibold hover:file:bg-brand-tint"
          />
          {current && (
            <p className="mt-1 text-xs text-ink-faint">Leave empty to keep the current image.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function PrimaryLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
    >
      {children}
    </Link>
  )
}

export function ConfirmDelete({ onConfirm, busy = false, label = 'Delete', className = 'text-red-600 hover:text-red-700' }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`text-sm font-medium ${className}`}
      >
        {label}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 disabled:opacity-60"
      >
        {busy ? 'Deleting…' : 'Confirm'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm font-medium text-ink-muted hover:text-ink-subtle"
      >
        Cancel
      </button>
    </span>
  )
}
