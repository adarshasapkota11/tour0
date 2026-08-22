import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { extractError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

export default function Register() {
  const { t } = useI18n()
  usePageTitle(t('register.title'))
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const next = searchParams.get('next') || '/'

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(t('register.passwordMismatch'))
      return
    }
    setSubmitting(true)
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      await login(form.email, form.password)
      toast.success(t('register.success'))
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
        <h1 className="text-2xl font-bold text-ink">{t('register.createYourAccount')}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t('register.subtitle')}</p>

        {next !== '/' && (
          <p className="mt-3 text-xs px-3 py-2 rounded-lg bg-brand-tint text-brand-tint-fg">
            {t('register.returnNote')}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm px-3 py-2 rounded-lg bg-danger-bg text-danger-fg">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="field-label">{t('register.fullName')}</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={update('full_name')}
              className="field"
              placeholder="Ram Bahadur"
            />
          </div>
          <div>
            <label className="field-label">{t('login.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="field"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
          <div>
            <label className="field-label">{t('register.phone')}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              className="field"
              placeholder="98XXXXXXXX"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">{t('login.password')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={update('password')}
                className="field"
                placeholder={t('register.minChars')}
              />
            </div>
            <div>
              <label className="field-label">{t('register.confirm')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirm}
                onChange={update('confirm')}
                className="field"
                placeholder={t('register.repeatPassword')}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl"
          >
            {submitting ? t('register.creating') : t('register.signUp')}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-ink-muted">
          {t('register.alreadyHave')}{' '}
          <Link
            to={`/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            {t('login.logIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
