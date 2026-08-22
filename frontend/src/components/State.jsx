import { useI18n } from '../i18n/index.jsx'

export function Loading({ label }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-muted">
      <svg className="animate-spin h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{label ?? t('state.loading')}</span>
    </div>
  )
}

export function ErrorState({ message }) {
  const { t } = useI18n()
  return (
    <div className="py-16 text-center">
      <p className="text-4xl mb-3">😕</p>
      <p className="text-ink-subtle">{message ?? t('state.error')}</p>
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="py-16 text-center text-ink-muted">
      <p className="text-4xl mb-3">🗺️</p>
      <p>{message}</p>
    </div>
  )
}
