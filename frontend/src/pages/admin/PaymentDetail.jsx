import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'

import { useAdminPayment, useUpdatePayment } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'

const statusStyles = {
  pending: 'bg-subtle text-ink-muted',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line last:border-0">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm font-medium text-ink text-right">{value}</dd>
    </div>
  )
}

export default function PaymentDetail() {
  const { id } = useParams()
  const { data: payment, isLoading, isError } = useAdminPayment(id)
  const updatePayment = useUpdatePayment()
  const [status, setStatus] = useState('')

  usePageTitle(payment ? `Payment #${payment.id}` : 'Payment')

  useEffect(() => {
    if (payment) setStatus(payment.status)
  }, [payment])

  if (isLoading) return <Loading label="Loading payment…" />
  if (isError || !payment) return <ErrorState message="Payment not found." />

  const handleStatusChange = (e) => {
    const next = e.target.value
    updatePayment.mutate(
      { id: payment.id, payload: { status: next } },
      {
        onSuccess: () => {
          setStatus(next)
          toast.success('Payment status updated.')
        },
        onError: (err) => toast.error(extractError(err)),
      },
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-ink">Payment #{payment.id}</h2>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
            statusStyles[payment.status] || 'bg-subtle text-ink-muted'
          }`}
        >
          {payment.status}
        </span>
      </div>

      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="font-semibold text-ink mb-3">Transaction</h3>
        <dl>
          <Row label="Booking" value={`#${payment.booking_id}`} />
          <Row label="Activity" value={payment.activity_name} />
          <Row label="Customer" value={payment.user_email} />
          <Row label="Gateway" value={payment.gateway} />
          <Row label="Amount" value={`Rs ${Number(payment.amount).toLocaleString()}`} />
          <Row label="Transaction UUID" value={payment.transaction_uuid || '—'} />
          <Row label="Transaction ID" value={payment.transaction_id || '—'} />
          <Row label="Created" value={new Date(payment.created_at).toLocaleString()} />
        </dl>
      </div>

      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="font-semibold text-ink mb-3">Override status</h3>
        <p className="text-sm text-ink-faint mb-3">
          Correct a payment status when an external verification failed or was completed
          out-of-band.
        </p>
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={updatePayment.isPending}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card disabled:opacity-60"
          aria-label="Override payment status"
        >
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        {updatePayment.isPending && (
          <p className="mt-2 text-xs text-ink-faint">Saving…</p>
        )}
      </div>

      <Link
        to="/admin/payments"
        className="inline-block px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
      >
        ← Back to payments
      </Link>
    </div>
  )
}
