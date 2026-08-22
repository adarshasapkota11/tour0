import { Link } from 'react-router-dom'

import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

export default function NotFound() {
  const { t } = useI18n()
  usePageTitle(t('notFound.title'))

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-3xl font-bold text-ink">{t('notFound.title')}</h1>
      <p className="mt-3 text-ink-muted">{t('notFound.text')}</p>
      <Link
        to="/"
        className="mt-8 inline-block px-6 py-3 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}
