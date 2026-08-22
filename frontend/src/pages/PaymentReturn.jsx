import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { extractError } from '../api/errors'
import { useVerifyPayment } from '../api/hooks'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

export default function PaymentReturn() {
  const { t } = useI18n()
  usePageTitle(t('payment.title'))
  const { bookingId } = useParams()
  const [searchParams] = useSearchParams()
  const verify = useVerifyPayment()
  const [state, setState] = useState('verifying')

  useEffect(() => {
    const refId = searchParams.get('refId') || searchParams.get('ref_id')
    const pidx = searchParams.get('pidx')
    const failed = searchParams.get('status') === 'failed'

    if (failed) {
      setState('failed')
      return
    }
    if (!refId && !pidx) {
      setState('failed')
      return
    }

    verify.mutate(
      { booking_id: bookingId, ref_id: refId, pidx },
      {
        onSuccess: () => {
          setState('success')
          toast.success(t('payment.toastConfirmed'))
        },
        onError: (err) => {
          setState('error')
          toast.error(extractError(err))
          console.error(extractError(err))
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const title = {
    verifying: t('payment.verifying'),
    success: t('payment.success'),
    failed: t('payment.failed'),
    error: t('payment.error'),
  }[state]

  const text = {
    verifying: t('payment.verifyingText'),
    success: t('payment.successText'),
    failed: t('payment.failedText'),
    error: t('payment.errorText'),
  }[state]

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl">
        {state === 'verifying' && '⏳'}
        {state === 'success' && '✅'}
        {state === 'failed' && '❌'}
        {state === 'error' && '⚠️'}
      </p>
      <h1 className="mt-4 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-ink-muted">{text}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={`/confirmation/${bookingId}`}
          className="px-5 py-3 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
        >
          {t('payment.viewBooking')}
        </Link>
        <Link to="/activities" className="px-5 py-3 font-semibold text-brand-600 hover:underline">
          {t('payment.backToActivities')}
        </Link>
      </div>
    </div>
  )
}
