import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDestinations } from '../api/hooks'
import DestinationCard from '../components/DestinationCard'
import Pagination from '../components/Pagination'
import { DestinationGridSkeleton } from '../components/Skeleton'
import { EmptyState, ErrorState } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

const PAGE_SIZE = 12

export default function Destinations() {
  const { t } = useI18n()
  usePageTitle(t('destinations.title'))
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const [input, setInput] = useState(q)

  const destinations = useDestinations({ search: q || undefined, page, page_size: PAGE_SIZE })

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

  const changePage = (nextPage) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage > 1) next.set('page', String(nextPage))
    else next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('destinations.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('destinations.subtitle')}</p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex items-center gap-2 bg-card border border-line-strong rounded-xl p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200"
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('destinations.searchPlaceholder')}
          aria-label={t('destinations.searchAria')}
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

      {destinations.isLoading && <div className="mt-8"><DestinationGridSkeleton count={6} /></div>}
      {destinations.isError && <div className="mt-8"><ErrorState message={t('destinations.couldNotLoad')} /></div>}
      {destinations.data && destinations.data.results.length === 0 && (
        <div className="mt-8">
          <EmptyState message={t('destinations.noMatch')} />
        </div>
      )}
      {destinations.data && destinations.data.results.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.data.results.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      )}

      {destinations.data && (
        <Pagination
          count={destinations.data.count}
          page={page}
          pageSize={PAGE_SIZE}
          onChange={changePage}
        />
      )}
    </div>
  )
}
