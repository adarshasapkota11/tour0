import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useActivities, useCategories } from '../api/hooks'
import ActivityCard from '../components/ActivityCard'
import Pagination from '../components/Pagination'
import { ActivityGridSkeleton } from '../components/Skeleton'
import { EmptyState, ErrorState } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

const PAGE_SIZE = 12

export default function Activities() {
  const { t } = useI18n()
  usePageTitle(t('activities.title'))
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const destination = searchParams.get('destination') || ''
  const q = searchParams.get('q') || ''
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const [input, setInput] = useState(q)

  const categories = useCategories()
  const activities = useActivities({
    category__slug: category || undefined,
    destination__slug: destination || undefined,
    search: q || undefined,
    page,
    page_size: PAGE_SIZE,
  })

  const setParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next)
  }

  const selectCategory = (slug) => setParams({ category: slug || '', page: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    setParams({ q: input.trim() || '', page: '' })
  }

  const clearFilters = () => setSearchParams({})

  const chipClass = (active) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-brand-600 border-brand-600 text-white'
        : 'bg-card border-line-strong text-ink-muted hover:border-brand-400'
    }`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('activities.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('activities.subtitle')}</p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex items-center gap-2 bg-card border border-line-strong rounded-xl p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200"
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('activities.searchPlaceholder')}
          aria-label={t('activities.searchAria')}
          className="flex-1 min-w-0 px-3 py-2 text-ink placeholder:text-ink-faint outline-none bg-transparent"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          {t('home.search')}
        </button>
      </form>

      {categories.data && categories.data.results.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button onClick={() => selectCategory('')} className={chipClass(!category)}>
            {t('activities.all')}
          </button>
          {categories.data.results.map((c) => (
            <button key={c.id} onClick={() => selectCategory(c.slug)} className={chipClass(category === c.slug)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {q && (
        <div className="mt-4 text-sm text-ink-muted">
          {t('search.showingResults', { q })} <span className="font-medium text-ink">"{q}"</span>
          {' · '}
          <button onClick={clearFilters} className="text-ink-muted hover:text-brand-600 underline">
            {t('search.clearSearch')}
          </button>
        </div>
      )}

      {destination && (
        <div className="mt-4 text-sm text-ink-muted">
          {t('activities.showingInDestination')}{' '}
          <Link to={`/destinations/${destination}`} className="text-brand-600 hover:underline font-medium">
            {destination.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Link>
          {' · '}
          <button onClick={clearFilters} className="text-ink-muted hover:text-brand-600 underline">
            {t('activities.clearFilter')}
          </button>
        </div>
      )}

      {activities.isLoading && <ActivityGridSkeleton count={6} />}
      {activities.isError && <ErrorState message={t('activities.couldNotLoad')} />}
      {activities.data && activities.data.results.length === 0 && (
        <EmptyState message={t('activities.noMatch')} />
      )}
      {activities.data && activities.data.results.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.data.results.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      )}

      {activities.data && (
        <Pagination
          count={activities.data.count}
          page={page}
          pageSize={PAGE_SIZE}
          onChange={(nextPage) => setParams({ page: nextPage > 1 ? String(nextPage) : '' })}
        />
      )}
    </div>
  )
}
