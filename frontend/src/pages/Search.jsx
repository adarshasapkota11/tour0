import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useActivities, useDestinations } from '../api/hooks'
import ActivityCard from '../components/ActivityCard'
import DestinationCard from '../components/DestinationCard'
import { ActivityGridSkeleton, DestinationGridSkeleton } from '../components/Skeleton'
import { ErrorState } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatNum } from '../utils/nepaliDate.js'

const RESULT_LIMIT = 9
const REVEAL_STEP = 9

export default function Search() {
  const { t, lang } = useI18n()
  usePageTitle(t('search.title'))
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [input, setInput] = useState(q)
  const [destVisible, setDestVisible] = useState(RESULT_LIMIT)
  const [activityVisible, setActivityVisible] = useState(RESULT_LIMIT)

  const enabled = Boolean(q)
  const destinations = useDestinations(enabled ? { search: q, page_size: 100 } : undefined)
  const activities = useActivities(enabled ? { search: q, page_size: 100 } : undefined)

  useEffect(() => {
    setDestVisible(RESULT_LIMIT)
    setActivityVisible(RESULT_LIMIT)
  }, [q])

  const handleSearch = (e) => {
    e.preventDefault()
    const term = input.trim()
    if (term) setSearchParams({ q: term })
    else setSearchParams({})
  }

  const clearSearch = () => {
    setInput('')
    setSearchParams({})
  }

  const destResults = destinations.data?.results || []
  const activityResults = activities.data?.results || []
  const nothingFound = enabled && destResults.length === 0 && activityResults.length === 0

  const destShown = destResults.slice(0, destVisible)
  const activityShown = activityResults.slice(0, activityVisible)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('search.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('search.subtitle')}</p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex items-center gap-2 bg-card border border-line-strong rounded-xl p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200"
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.search')}
          className="flex-1 min-w-0 px-3 py-2 text-ink placeholder:text-ink-faint outline-none bg-transparent"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          {t('home.search')}
        </button>
      </form>

      {q && (
        <div className="mt-4 text-sm text-ink-muted">
          {t('search.showingResults', { q })} <span className="font-medium text-ink">"{q}"</span>
          {' · '}
          <button onClick={clearSearch} className="text-ink-muted hover:text-brand-600 underline">
            {t('search.clearSearch')}
          </button>
        </div>
      )}

      {!enabled && (
        <div className="mt-16 text-center">
          <p className="text-4xl">🗺️</p>
          <h2 className="mt-3 text-xl font-bold text-ink">{t('search.promptTitle')}</h2>
          <p className="mt-1 text-ink-muted">{t('search.promptText')}</p>
        </div>
      )}

      {enabled && (destinations.isLoading || activities.isLoading) && (
        <div className="mt-8 space-y-10">
          <DestinationGridSkeleton count={6} />
          <ActivityGridSkeleton count={6} />
        </div>
      )}

      {enabled && destinations.isError && (
        <div className="mt-8">
          <ErrorState message={t('search.couldNotLoadDestinations')} />
        </div>
      )}

      {enabled && activities.isError && (
        <div className="mt-8">
          <ErrorState message={t('search.couldNotLoadActivities')} />
        </div>
      )}

      {nothingFound && (
        <div className="mt-16 text-center">
          <p className="text-4xl">🔍</p>
          <h2 className="mt-3 text-xl font-bold text-ink">{t('search.noResults', { q })}</h2>
          <p className="mt-1 text-ink-muted">{t('search.noResultsHint')}</p>
        </div>
      )}

      {enabled && destResults.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">{t('search.destinationsHeading')}</h2>
              <p className="text-ink-muted">
                {destinations.data.count === 1
                  ? t('search.destinationMatchOne', { count: formatNum(destinations.data.count, lang) })
                  : t('search.destinationMatchMany', { count: formatNum(destinations.data.count, lang) })}
              </p>
            </div>
            <Link
              to={`/destinations?q=${encodeURIComponent(q)}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {t('search.viewAllDestinations')}
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destShown.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
          {destShown.length < destResults.length && (
            <button
              type="button"
              onClick={() => setDestVisible((v) => v + REVEAL_STEP)}
              className="mt-6 px-5 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-tint hover:bg-brand-100 rounded-lg transition-colors"
            >
              {t('search.loadMore')}
            </button>
          )}
        </section>
      )}

      {enabled && activityResults.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">{t('search.activitiesHeading')}</h2>
              <p className="text-ink-muted">
                {activities.data.count === 1
                  ? t('search.activityMatchOne', { count: formatNum(activities.data.count, lang) })
                  : t('search.activityMatchMany', { count: formatNum(activities.data.count, lang) })}
              </p>
            </div>
            <Link
              to={`/activities?q=${encodeURIComponent(q)}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {t('search.viewAllActivities')}
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activityShown.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
          {activityShown.length < activityResults.length && (
            <button
              type="button"
              onClick={() => setActivityVisible((v) => v + REVEAL_STEP)}
              className="mt-6 px-5 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-tint hover:bg-brand-100 rounded-lg transition-colors"
            >
              {t('search.loadMore')}
            </button>
          )}
        </section>
      )}
    </div>
  )
}
