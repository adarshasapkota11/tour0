import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { client } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { extractError } from '../api/errors'

export default function Profile() {
  const { t } = useI18n()
  usePageTitle(t('profile.title'))
  const { user, fetchMe } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.patch('/auth/me/', form)
      await fetchMe()
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success(t('profile.toastSaved'))
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('profile.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('profile.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
            {t('profile.email')}
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle text-ink-muted cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-ink mb-1">
            {t('profile.fullName')}
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-card text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1">
            {t('profile.phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder={t('profile.phonePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-card text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2.5 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-60"
        >
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
      </form>
    </div>
  )
}
