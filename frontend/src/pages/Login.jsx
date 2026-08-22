import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { extractError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

export default function Login() {
  const { t } = useI18n()
  usePageTitle(t('login.title'))
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const next = searchParams.get('next') || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success(t('login.success'))
      navigate(next, { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="bg-card border border-line rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-ink">{t('login.welcomeBack')}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t('login.subtitle')}</p>

        {next !== '/' && (
          <p className="mt-3 text-xs px-3 py-2 rounded-lg bg-brand-tint text-brand-tint-fg">
            {t('login.returnNote')}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm px-3 py-2 rounded-lg bg-danger-bg text-danger-fg">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl"
          >
            {submitting ? t('login.loggingIn') : t('login.logIn')}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-ink-muted">
          {t('login.newHere')}{' '}
          <Link
            to={`/register?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            {t('login.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
