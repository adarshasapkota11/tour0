import { Link, useParams } from 'react-router-dom'

import { useActivity } from '../api/hooks'
import { activityImage } from '../api/staticImages'
import Media from '../components/Media'
import { ErrorState, Loading } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatNum, formatPrice } from '../utils/nepaliDate.js'

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  moderate: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  challenging: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function ActivityDetail() {
  const { slug } = useParams()
  const { t, lang } = useI18n()
  const { data: activity, isLoading, isError } = useActivity(slug)
  usePageTitle(activity ? activity.name : t('activity.loading'))

  const difficultyLabels = {
    easy: t('difficulty.easy'),
    moderate: t('difficulty.moderate'),
    challenging: t('difficulty.challenging'),
  }

  if (isLoading) return <Loading label={t('activity.loading')} />
  if (isError || !activity) return <ErrorState message={t('activity.notFound')} />

  const price = formatPrice(activity.price, lang)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-ink-muted">
        <Link to="/" className="hover:text-brand-600">
          {t('activity.home')}
        </Link>
        {' / '}
        <Link
          to={`/destinations/${activity.destination_slug}`}
          className="hover:text-brand-600"
        >
          {activity.destination_name}
        </Link>
        {' / '}
        <span className="text-ink font-medium">{activity.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <Media
            src={activityImage(activity)}
            alt={activity.name}
            label={activity.name}
            className="w-full aspect-[4/3] object-cover rounded-2xl"
          />
        </div>

        <div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-subtle text-ink-muted font-medium">
            {activity.category_name}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-ink">{activity.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {activity.destination_name} · {activity.duration}
          </p>

          <p className="mt-6 text-ink-subtle leading-relaxed">{activity.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-subtle border border-line rounded-xl p-4">
              <dt className="text-ink-muted text-xs uppercase tracking-wide">{t('activity.price')}</dt>
              <dd className="mt-1 text-2xl font-bold text-brand-600">{price}</dd>
              <dd className="text-xs text-ink-muted">{t('activity.perPerson')}</dd>
            </div>
            <div className="bg-subtle border border-line rounded-xl p-4">
              <dt className="text-ink-muted text-xs uppercase tracking-wide">{t('activity.duration')}</dt>
              <dd className="mt-1 font-semibold text-ink">{activity.duration}</dd>
              <dd className="text-xs text-ink-muted">{t('activity.approx')}</dd>
            </div>
            <div className="bg-subtle border border-line rounded-xl p-4">
              <dt className="text-ink-muted text-xs uppercase tracking-wide">{t('activity.difficulty')}</dt>
              <dd className="mt-1">
                <span
                  className={`text-sm px-2 py-0.5 rounded-full font-medium capitalize ${
                    difficultyStyles[activity.difficulty] || 'bg-subtle text-ink-muted'
                  }`}
                >
                  {difficultyLabels[activity.difficulty] || activity.difficulty}
                </span>
              </dd>
            </div>
            <div className="bg-subtle border border-line rounded-xl p-4">
              <dt className="text-ink-muted text-xs uppercase tracking-wide">{t('activity.groupSize')}</dt>
              <dd className="mt-1 font-semibold text-ink">
                {t('activity.upTo', { count: formatNum(activity.capacity, lang) })}
              </dd>
              <dd className="text-xs text-ink-muted">{t('activity.perDeparture')}</dd>
            </div>
          </div>

          <Link
            to={`/book/${activity.slug}`}
            className="mt-8 block text-center px-6 py-4 font-semibold text-lg bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
          >
            {t('activity.bookNow', { price })}
          </Link>
          <p className="mt-2 text-xs text-ink-faint text-center">{t('activity.noLoginNeeded')}</p>
        </div>
      </div>
    </div>
  )
}
