import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useBookings, useCancelBooking } from '../api/hooks'
import { extractError } from '../api/errors'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorState, Loading } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatDateBs, formatNum, formatPrice } from '../utils/nepaliDate.js'

const PAGE_SIZE = 10

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

export default function MyBookings() {
  const { t, lang } = useI18n()
  usePageTitle(t('myBookings.title'))
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useBookings({ page, page_size: PAGE_SIZE })
  const cancelBooking = useCancelBooking()

  const [cancelId, setCancelId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const statusLabels = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    cancelled: t('status.cancelled'),
  }

  if (isLoading) return <Loading label={t('myBookings.loading')} />
  if (isError) return <ErrorState message={t('myBookings.error')} />

  const bookings = data?.results || []

  const openCancel = (id) => {
    setCancelId(id)
    setCancelReason('')
  }

  const handleCancel = () => {
    if (!cancelId) return
    cancelBooking.mutate(
      { id: cancelId, reason: cancelReason },
      {
        onSuccess: () => {
          toast.success(t('myBookings.toastCancelled'))
          setCancelId(null)
        },
        onError: (err) => toast.error(extractError(err)),
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('myBookings.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('myBookings.subtitle')}</p>

      {bookings.length === 0 && <EmptyState message={t('myBookings.empty')} />}

      <div className="mt-8 space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-card border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-ink">
                  {booking.visit_package_name || booking.activity_name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    statusStyles[booking.status] || 'bg-subtle text-ink-muted'
                  }`}
                >
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {booking.destination_name}
                {booking.item_type === 'visit_package' &&
                  ` · ${
                    booking.package_days === 1
                      ? t('cards.dayOne')
                      : t('cards.dayMany', { days: formatNum(booking.package_days, lang) })
                  }`}
                {' · '}
                {formatDateBs(booking.travel_date, lang)} · {formatNum(booking.travelers, lang)}{' '}
                {t(booking.travelers > 1 ? 'myBookings.travelerMany' : 'myBookings.travelerOne')}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-600">
                {formatPrice(booking.total_price, lang)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/confirmation/${booking.id}`}
                className="px-4 py-2 text-sm font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-tint"
              >
                {t('myBookings.details')}
              </Link>
              {booking.status === 'pending' && (
                <button
                  onClick={() => openCancel(booking.id)}
                  disabled={cancelBooking.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
                >
                  {t('myBookings.cancel')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && (
        <Pagination count={data.count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      )}

      {cancelId && (
        <ConfirmDialog
          open
          title={t('myBookings.cancelTitle')}
          description={t('myBookings.cancelDesc')}
          confirmLabel={t('myBookings.cancelConfirm')}
          loading={cancelBooking.isPending}
          onCancel={() => setCancelId(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  )
}
