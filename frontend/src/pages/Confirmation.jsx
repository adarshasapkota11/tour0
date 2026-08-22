import { Link, useParams } from 'react-router-dom'

import { useBooking } from '../api/hooks'
import Media from '../components/Media'
import { ErrorState, Loading } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatDateBs, formatNum, formatPrice } from '../utils/nepaliDate.js'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

export default function Confirmation() {
  const { bookingId } = useParams()
  const { t, lang } = useI18n()
  const { data: booking, isLoading, isError } = useBooking(bookingId)
  usePageTitle(booking ? `#${booking.id}` : t('confirmation.loading'))

  const statusLabels = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    cancelled: t('status.cancelled'),
  }

  if (isLoading) return <Loading label={t('confirmation.loading')} />
  if (isError || !booking) return <ErrorState message={t('confirmation.notFound')} />

  const confirmed = booking.status === 'confirmed'

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="bg-card border border-line rounded-2xl p-8">
        <div className="text-center">
          <p className="text-5xl">{confirmed ? '🎉' : '📋'}</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">
            {confirmed ? t('confirmation.confirmed') : t('confirmation.received')}
          </h1>
          <p className="mt-2 text-ink-muted">
            {confirmed ? t('confirmation.confirmedText') : t('confirmation.receivedText')}
          </p>
          <span
            className={`mt-4 inline-block text-sm px-3 py-1 rounded-full font-medium capitalize ${
              statusStyles[booking.status] || 'bg-subtle text-ink-muted'
            }`}
          >
            {statusLabels[booking.status] || booking.status}
          </span>
        </div>

        <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">{t('confirmation.bookingReference')}</dt>
            <dd className="font-medium text-ink">#{booking.id}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">
              {booking.item_type === 'visit_package'
                ? t('confirmation.bookedItem')
                : t('confirmation.activity')}
            </dt>
            <dd className="font-medium text-ink">
              {booking.visit_package_name || booking.activity_name}
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">{t('confirmation.destination')}</dt>
            <dd className="font-medium text-ink">{booking.destination_name}</dd>
          </div>
          {booking.item_type === 'visit_package' && (
            <div className="flex justify-between py-3">
              <dt className="text-ink-muted">{t('confirmation.days')}</dt>
              <dd className="font-medium text-ink">
                {booking.package_days === 1
                  ? t('cards.dayOne')
                  : t('cards.dayMany', { days: formatNum(booking.package_days, lang) })}
              </dd>
            </div>
          )}
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">{t('confirmation.travelDate')}</dt>
            <dd className="font-medium text-ink">{formatDateBs(booking.travel_date, lang)}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">{t('confirmation.travelers')}</dt>
            <dd className="font-medium text-ink">{formatNum(booking.travelers, lang)}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink-muted">{t('confirmation.total')}</dt>
            <dd className="font-bold text-brand-600">{formatPrice(booking.total_price, lang)}</dd>
          </div>
        </dl>

        {booking.activity_image && (
          <Media
            src={booking.activity_image}
            alt={booking.activity_name}
            label={booking.activity_name}
            className="mt-6 w-full h-40 object-cover rounded-xl"
          />
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/my-bookings"
            className="px-5 py-3 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
          >
            {t('confirmation.viewMyBookings')}
          </Link>
          <Link to="/activities" className="px-5 py-3 font-semibold text-brand-600 hover:underline">
            {t('confirmation.bookAnother')}
          </Link>
        </div>
      </div>
    </div>
  )
}
