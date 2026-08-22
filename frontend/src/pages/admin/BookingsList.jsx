import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import {
  useAdminBookings,
  useAdminBookingAction,
  useAdminDestinations,
} from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import Pagination from '../../components/Pagination'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PageHeader, tdClass, thClass, tableWrap } from './adminForms'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

const paymentStyles = {
  pending: 'bg-subtle text-ink-muted',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

export default function BookingsList() {
  usePageTitle('Admin · Bookings')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [destination, setDestination] = useState('')
  const [page, setPage] = useState(1)

  const { data: destinations, isLoading: destLoading } = useAdminDestinations({ page_size: 100 })

  const params = {
    page,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { payment__status: paymentStatus } : {}),
    ...(destination ? { activity__destination: destination } : {}),
  }
  const { data, isLoading, isError } = useAdminBookings(params)

  const confirmBooking = useAdminBookingAction('confirm')
  const cancelBooking = useAdminBookingAction('cancel')

  const bookings = data?.results || []
  const destOptions = destinations?.results || []

  const resetPage = () => setPage(1)

  const handleConfirm = (id) =>
    confirmBooking.mutate(id, {
      onSuccess: () => toast.success('Booking confirmed.'),
      onError: (err) => toast.error(extractError(err)),
    })

  const handleCancel = (id) =>
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success('Booking cancelled.'),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" subtitle="Review and manage customer bookings." />

      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          placeholder="Search customer or activity…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            resetPage()
          }}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
        />
        <div className="w-40">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              resetPage()
            }}
            className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
            aria-label="Filter by booking status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="w-40">
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value)
              resetPage()
            }}
            className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
            aria-label="Filter by payment status"
          >
            <option value="">All payments</option>
            <option value="pending">Payment pending</option>
            <option value="success">Paid</option>
            <option value="failed">Payment failed</option>
          </select>
        </div>
        {destLoading ? null : (
          <div className="w-44">
            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
                resetPage()
              }}
              className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
              aria-label="Filter by destination"
            >
              <option value="">All destinations</option>
              {destOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <Loading label="Loading bookings…" />
      ) : isError ? (
        <ErrorState message="Could not load bookings." />
      ) : bookings.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No bookings found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Activity</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Travelers</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Booking</th>
                <th className={thClass}>Payment</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-subtle">
                  <td className={`${tdClass}`}>
                    <p className="font-medium text-ink">{booking.user_full_name || '—'}</p>
                    <p className="text-xs text-ink-faint">{booking.user_email}</p>
                  </td>
                  <td className={`${tdClass} text-ink`}>
                    <Link to={`/admin/bookings/${booking.id}`} className="hover:text-brand-600">
                      {booking.activity_name}
                    </Link>
                    <p className="text-xs text-ink-faint">{booking.destination_name}</p>
                  </td>
                  <td className={tdClass}>{booking.travel_date}</td>
                  <td className={tdClass}>{booking.travelers}</td>
                  <td className={`${tdClass} font-medium text-ink`}>
                    Rs {Number(booking.total_price).toLocaleString()}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        statusStyles[booking.status] || 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className={tdClass}>
                    {booking.payment_status ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          paymentStyles[booking.payment_status] || 'bg-subtle text-ink-muted'
                        }`}
                      >
                        {booking.payment_status}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-faint">—</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex items-center gap-3">
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        View
                      </Link>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            disabled={confirmBooking.isPending || cancelBooking.isPending}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={confirmBooking.isPending || cancelBooking.isPending}
                            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination count={data.count} page={page} pageSize={12} onChange={setPage} />}
    </div>
  )
}
