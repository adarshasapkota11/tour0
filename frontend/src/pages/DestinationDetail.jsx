import { Link, useParams } from 'react-router-dom'

import { useActivities, useDestination } from '../api/hooks'
import { placeImage } from '../api/staticImages'
import ActivityCard from '../components/ActivityCard'
import Media from '../components/Media'
import { ActivityGridSkeleton } from '../components/Skeleton'
import { EmptyState, ErrorState, Loading } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatNum, formatPrice } from '../utils/nepaliDate.js'

export default function DestinationDetail() {
  const { slug } = useParams()
  const { t, lang } = useI18n()
  const destination = useDestination(slug)
  const activities = useActivities({ destination__slug: slug, page_size: 100 })
  usePageTitle(destination.data ? destination.data.name : t('destination.loading'))

  if (destination.isLoading) return <Loading label={t('destination.loading')} />
  if (destination.isError || !destination.data) {
    return <ErrorState message={t('destination.notFound')} />
  }

  const dest = destination.data

  return (
    <div>
      <div className="relative h-72 sm:h-96">
        <Media
          src={placeImage(dest)}
          alt={dest.name}
          label={dest.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 inset-x-0">
          <div className="mx-auto max-w-6xl px-4 pb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{dest.name}</h1>
            <p className="text-white/80 text-sm mt-1 uppercase tracking-wide">
              {t('destination.provinceLine', {
                province: dest.province,
                count: formatNum(dest.activity_count, lang),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-ink">{t('destination.about')}</h2>
            <p className="mt-3 text-ink-subtle leading-relaxed">{dest.description}</p>

            {dest.gallery.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-ink">{t('destination.gallery')}</h2>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dest.gallery.map((g) => (
                    <Media
                      key={g.id}
                      src={g.image}
                      alt={g.caption || dest.name}
                      label={dest.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="bg-card border border-line rounded-2xl p-6 h-fit">
            <h3 className="font-semibold text-ink">{t('destination.quickFacts')}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('destination.province')}</dt>
                <dd className="font-medium text-ink">{dest.province}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('destination.activities')}</dt>
                <dd className="font-medium text-ink">{formatNum(dest.activity_count, lang)}</dd>
              </div>
            </dl>
            <Link
              to={`/activities?destination=${dest.slug}`}
              className="mt-6 block text-center px-4 py-3 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
            >
              {t('destination.browseHere')}
            </Link>
          </aside>
        </div>

        {dest.visit_packages.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-ink">{t('destination.visitTitle')}</h2>
            <p className="text-ink-muted">{t('destination.visitSubtitle')}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dest.visit_packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-card border border-line rounded-2xl p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-ink">{pkg.name}</h3>
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full font-medium bg-brand-tint text-brand-tint-fg">
                      {pkg.days === 1 ? t('cards.dayOne') : t('cards.dayMany', { days: formatNum(pkg.days, lang) })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-subtle flex-1">{pkg.description}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink-muted uppercase tracking-wide">
                        {t('bookVisit.pricePerPerson')}
                      </p>
                      <p className="text-lg font-bold text-brand-600">
                        {formatPrice(pkg.price, lang)}
                      </p>
                    </div>
                    <Link
                      to={`/book/visit/${pkg.id}`}
                      className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
                    >
                      {t('destination.bookVisit')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-ink">{t('destination.thingsToDoIn', { name: dest.name })}</h2>
            <Link
              to={`/activities?destination=${dest.slug}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {t('destination.viewAll')}
            </Link>
          </div>

          {activities.isLoading && <ActivityGridSkeleton count={3} />}
          {activities.data && activities.data.results.length === 0 && (
            <EmptyState message={t('destination.noActivities')} />
          )}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.data?.results.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
