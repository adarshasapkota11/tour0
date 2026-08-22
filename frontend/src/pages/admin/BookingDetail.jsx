import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'

import { useAdminBooking, useAdminBookingAction, useAdminBill } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line last:border-0">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm font-medium text-ink text-right">{value}</dd>
    </div>
  )
}

export default function BookingDetail() {
  const { id } = useParams()
  const { data: booking, isLoading, isError } = useAdminBooking(id)
  usePageTitle(booking ? `Booking #${booking.id}` : 'Booking')

  const confirmBooking = useAdminBookingAction('confirm')
  const cancelBooking = useAdminBookingAction('cancel')
  const bill = useAdminBill()

  if (isLoading) return <Loading label="Loading booking…" />
  if (isError || !booking) return <ErrorState message="Booking not found." />

  const runAction = (action, message) =>
    action.mutate(booking.id, {
      onSuccess: () => toast.success(message),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-ink">Booking #{booking.id}</h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                statusStyles[booking.status] || 'bg-subtle text-ink-muted'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-faint">Created {new Date(booking.created_at).toLocaleString()}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() =>
              bill.mutate(booking.id, {
                onError: (err) => toast.error(extractError(err)),
              })
            }
            disabled={bill.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
          >
            {bill.isPending ? 'Generating…' : 'Print bill'}
          </button>

          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => runAction(confirmBooking, 'Booking confirmed.')}
                disabled={confirmBooking.isPending || cancelBooking.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
              >
                {confirmBooking.isPending ? 'Confirming…' : 'Confirm booking'}
              </button>
              <button
                onClick={() => runAction(cancelBooking, 'Booking cancelled.')}
                disabled={confirmBooking.isPending || cancelBooking.isPending}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
              >
                {cancelBooking.isPending ? 'Cancelling…' : 'Cancel booking'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <section className="bg-card border border-line rounded-2xl p-6">
          <h3 className="font-semibold text-ink mb-3">Tour details</h3>
          <dl>
            <Row label="Activity" value={booking.activity_name} />
            <Row label="Destination" value={booking.destination_name} />
            <Row label="Travel date" value={booking.travel_date} />
            <Row label="Travelers" value={booking.travelers} />
            <Row label="Total" value={`Rs ${Number(booking.total_price).toLocaleString()}`} />
          </dl>
        </section>

        <section className="bg-card border border-line rounded-2xl p-6">
          <h3 className="font-semibold text-ink mb-3">Customer</h3>
          <dl>
            <Row label="Name" value={booking.user_full_name || '—'} />
            <Row label="Email" value={booking.user_email} />
            <Row label="Phone" value={booking.user_phone || '—'} />
            <Row label="Payment" value={booking.payment_status ? booking.payment_status : '—'} />
          </dl>
        </section>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/admin/bookings"
          className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
        >
          ← Back to bookings
        </Link>
        {booking.payment_status && (
          <Link
            to="/admin/payments"
            className="px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 rounded-lg"
          >
            View payments
          </Link>
        )}
      </div>
    </div>
  )
}
