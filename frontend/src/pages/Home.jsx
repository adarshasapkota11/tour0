import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useActivities, useCategories, useDestinations } from '../api/hooks'
import { placeImage } from '../api/staticImages'
import ActivityCard from '../components/ActivityCard'
import Carousel from '../components/Carousel'
import DestinationCard from '../components/DestinationCard'
import Media from '../components/Media'
import NepalMap from '../components/NepalMap'
import { DestinationGridSkeleton, ActivityGridSkeleton } from '../components/Skeleton'
import { EmptyState, ErrorState } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatNum } from '../utils/nepaliDate.js'

export default function Home() {
  const { t, lang } = useI18n()
  usePageTitle(t('home.title'))
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const cardRef = useRef(null)
  const destinations = useDestinations()
  const categories = useCategories()
  const featured = useActivities({ is_featured: 'true', page_size: 6 })
  const related = useActivities(
    { destination__slug: selected?.slug, page_size: 3 },
    { enabled: !!selected },
  )

  const placed = (destinations.data?.results || []).filter((d) => d.latitude && d.longitude)

  useEffect(() => {
    if (!selected) return undefined
    const closeOnOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setSelected(null)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('touchstart', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('touchstart', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [selected])

  const handleSearch = (e) => {
    e.preventDefault()
    const term = query.trim()
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search')
  }

  const relatedActivities = selected ? (related.data?.results || []).slice(0, 3) : []

  return (
    <div>
      <section className="relative h-[85svh] max-h-[700px] min-h-[560px] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <NepalMap
            destinations={placed}
            onSelect={setSelected}
            selectedSlug={selected?.slug}
          />
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-slate-900/10 pointer-events-none" />

        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-14 sm:pt-16 text-center pointer-events-none">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl mx-auto">
            {t('home.heroHeadline')} <span className="text-brand-300">{t('home.heroAccent')}</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-white/90 max-w-xl mx-auto">
            {t('home.heroTagline')}
          </p>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 pointer-events-none">
          {selected && (
            <div
              ref={cardRef}
              key={selected.slug}
              className="map-card-enter pointer-events-auto w-full max-w-sm bg-card text-ink rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
            >
              <div className="relative">
                <Media
                  src={placeImage(selected)}
                  alt={selected.name}
                  label={selected.name}
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={t('map.close')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs font-semibold rounded-full">
                  {t('cards.activityCount', { count: formatNum(selected.activity_count, lang) })}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold text-ink leading-tight">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-ink-muted">{selected.province}</p>
                {relatedActivities.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {relatedActivities.map((activity) => (
                      <li key={activity.id} className="text-sm">
                        <Link
                          to={`/activities/${activity.slug}`}
                          className="text-ink-subtle hover:text-brand-600 hover:underline"
                        >
                          {activity.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={`/destinations/${selected.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {t('map.viewDestination')} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 pb-5 pointer-events-none">
          <div className="mx-auto w-full max-w-4xl px-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <form
              onSubmit={handleSearch}
              className="pointer-events-auto w-full sm:w-auto sm:flex-1 min-w-[240px] max-w-md bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-1.5 flex items-center gap-2 shadow-xl shadow-black/20"
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                aria-label={t('home.search')}
                className="flex-1 min-w-0 px-3 py-2 bg-transparent text-white placeholder:text-white/60 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
              >
                {t('home.search')}
              </button>
            </form>
            <Link
              to="/activities"
              className="pointer-events-auto px-5 py-2.5 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg transition-colors"
            >
              {t('home.exploreActivities')}
            </Link>
            <Link
              to="/destinations"
              className="pointer-events-auto px-5 py-2.5 font-semibold border border-brand-300/70 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              {t('home.exploreDestinations')}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-card border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 flex flex-wrap items-center gap-x-10 gap-y-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="flex flex-col">
              <strong className="text-2xl font-bold text-ink">
                {formatNum(destinations.data?.count || 10, lang)}+
              </strong>
              <span className="text-sm text-ink-muted">{t('home.statDestinations')}</span>
            </span>
            <span className="flex flex-col">
              <strong className="text-2xl font-bold text-ink">{formatNum(22, lang)}+</strong>
              <span className="text-sm text-ink-muted">{t('home.statExperiences')}</span>
            </span>
            <span className="flex flex-col">
              <strong className="text-2xl font-bold text-ink">{formatNum(7, lang)}</strong>
              <span className="text-sm text-ink-muted">{t('home.statProvinces')}</span>
            </span>
          </div>
          <span className="ml-auto text-sm text-ink-faint">{t('home.mapHint')}</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">{t('home.popularTitle')}</h2>
            <p className="text-ink-muted">{t('home.popularSubtitle')}</p>
          </div>
          <Link to="/destinations" className="text-sm font-medium text-brand-600 hover:underline">
            {t('home.viewAllDestinations')}
          </Link>
        </div>

        {destinations.isLoading && <DestinationGridSkeleton count={6} />}
        {destinations.isError && <ErrorState message={t('home.couldNotLoadDestinations')} />}
        {destinations.data && destinations.data.results.length > 0 && (
          <div className="mt-6">
            <Carousel label={t('home.popularTitle')}>
              {destinations.data.results.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </Carousel>
          </div>
        )}
      </section>

      {categories.data && categories.data.results.length > 0 && (
        <section className="bg-card border-y border-line">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="text-2xl font-bold text-ink">{t('home.thingsToDo')}</h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.data.results.map((c) => (
                <Link
                  key={c.id}
                  to={`/activities?category=${c.slug}`}
                  className="bg-subtle hover:bg-brand-tint border border-line hover:border-brand-300 rounded-xl p-4 text-center transition-colors"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <p className="mt-2 text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">
                    {t('cards.activityCount', { count: formatNum(c.activity_count, lang) })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">{t('home.featuredTitle')}</h2>
            <p className="text-ink-muted">{t('home.featuredSubtitle')}</p>
          </div>
          <Link to="/activities" className="text-sm font-medium text-brand-600 hover:underline">
            {t('home.viewAll')}
          </Link>
        </div>

        {featured.isLoading && <ActivityGridSkeleton count={6} />}
        {featured.isError && <ErrorState message={t('home.couldNotLoadActivities')} />}
        {featured.data && featured.data.results.length === 0 && (
          <EmptyState message={t('home.noFeatured')} />
        )}
        {featured.data && featured.data.results.length > 0 && (
          <div className="mt-6">
            <Carousel label={t('home.featuredTitle')}>
              {featured.data.results.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </Carousel>
          </div>
        )}
      </section>
    </div>
  )
}
