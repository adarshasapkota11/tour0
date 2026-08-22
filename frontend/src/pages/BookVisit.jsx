import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { extractError } from '../api/errors'
import { useCreateBooking, useInitiatePayment, useVerifyPayment, useVisitPackage } from '../api/hooks'
import { placeImage } from '../api/staticImages'
import BsDatePicker from '../components/BsDatePicker'
import Media from '../components/Media'
import { Loading } from '../components/State'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'
import { formatNum, formatPrice, getTodayAdIso } from '../utils/nepaliDate.js'

function submitEsewaForm(url, fields) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  form.hidden = true
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}

export default function BookVisit() {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const { t, lang, isNepali } = useI18n()
  const { data: pkg, isLoading } = useVisitPackage(packageId)
  usePageTitle(pkg ? t('bookVisit.pageTitle', { name: pkg.name }) : t('book.title'))

  const createBooking = useCreateBooking()
  const initiate = useInitiatePayment()
  const verify = useVerifyPayment()

  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [gateway, setGateway] = useState('esewa')
  const [bookingId, setBookingId] = useState(null)
  const [payPayload, setPayPayload] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoading) return <Loading label={t('bookVisit.loading')} />
  if (!pkg) return <p className="py-16 text-center text-ink-muted">{t('bookVisit.notFound')}</p>

  const total = formatPrice(travelers * Number(pkg.price) * pkg.days, lang)
  const today = getTodayAdIso()
  const daysLabel = pkg.days === 1 ? t('cards.dayOne') : t('cards.dayMany', { days: formatNum(pkg.days, lang) })

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const booking = await createBooking.mutateAsync({
        visit_package: pkg.id,
        travel_date: date,
        travelers,
      })
      setBookingId(booking.id)
      toast.success(t('bookVisit.toastCreated', { id: booking.id, amount: total }))
    } catch (err) {
      setError(extractError(err))
      toast.error(extractError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleInitiatePayment = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const origin = window.location.origin
      const payload = await initiate.mutateAsync({
        booking_id: bookingId,
        gateway,
        return_url: `${origin}/payment/return/${bookingId}`,
        failure_url: `${origin}/payment/return/${bookingId}?status=failed`,
      })
      setPayPayload(payload)
      if (payload.dev_mode) {
        toast(t('book.toastDevMode'), { icon: '🧪' })
      }
      if (!payload.dev_mode && payload.url) {
        if (gateway === 'esewa' && payload.fields) {
          submitEsewaForm(payload.url, payload.fields)
        } else {
          window.location.href = payload.url
        }
      }
    } catch (err) {
      setError(extractError(err))
      toast.error(extractError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleSimulatePay = async () => {
    setError('')
    setBusy(true)
    try {
      await verify.mutateAsync({ booking_id: bookingId, ref_id: `dev-${Date.now()}` })
      toast.success(t('book.toastSimulate'))
      navigate(`/confirmation/${bookingId}`)
    } catch (err) {
      setError(extractError(err))
      toast.error(extractError(err))
      setBusy(false)
    }
  }

  const gatewayLabel = gateway === 'esewa' ? t('book.esewa') : t('book.khalti')
  const cover = placeImage({ slug: pkg.destination_slug, cover_image: pkg.destination_image })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-ink-muted">
        <Link to="/destinations" className="hover:text-brand-600">
          {t('bookVisit.breadcrumbDestinations')}
        </Link>
        {' / '}
        <Link to={`/destinations/${pkg.destination_slug}`} className="hover:text-brand-600">
          {pkg.destination_name}
        </Link>
        {' / '}
        <span className="text-ink font-medium">{t('bookVisit.breadcrumbBook')}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold text-ink">{t('bookVisit.heading')}</h1>

      {error && (
        <p className="mt-4 text-sm px-3 py-2 rounded-lg bg-danger-bg text-danger-fg">{error}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <div className="bg-card border border-line rounded-2xl overflow-hidden sticky top-24">
            <Media
              src={cover}
              alt={pkg.name}
              label={pkg.destination_name}
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="p-5">
              <h2 className="font-bold text-ink">{pkg.name}</h2>
              <p className="text-sm text-ink-muted">
                {pkg.destination_name} · {daysLabel}
              </p>
              <p className="mt-2 text-sm text-ink-subtle">{pkg.description}</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide">{t('bookVisit.pricePerPerson')}</p>
                  <p className="text-xl font-bold text-brand-600">
                    {formatPrice(pkg.price, lang)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-muted uppercase tracking-wide">{t('bookVisit.yourTotal')}</p>
                  <p className="text-xl font-bold text-ink">{total}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {!bookingId && (
            <form onSubmit={handleCreateBooking} className="bg-card border border-line rounded-2xl p-6">
              <h3 className="font-semibold text-ink">{t('bookVisit.travelDetails')}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {t('bookVisit.daysNote', { days: formatNum(pkg.days, lang) })}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">{t('bookVisit.travelDate')}</label>
                  {isNepali ? (
                    <BsDatePicker value={date} minIso={today} onChange={setDate} />
                  ) : (
                    <input
                      type="date"
                      required
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="field"
                    />
                  )}
                </div>
                <div>
                  <label className="field-label">{t('bookVisit.travelers')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={pkg.capacity}
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="field"
                  />
                  <p className="mt-1 text-xs text-ink-faint">
                    {t('bookVisit.upToPerDeparture', { count: formatNum(pkg.capacity, lang) })}
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy || !date}
                className="mt-6 w-full px-4 py-3 font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl"
              >
                {busy ? t('bookVisit.creating') : t('bookVisit.continueToPayment')}
              </button>
            </form>
          )}

          {bookingId && !payPayload && (
            <form onSubmit={handleInitiatePayment} className="bg-card border border-line rounded-2xl p-6">
              <h3 className="font-semibold text-ink">{t('book.paymentMethod')}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {t('book.bookingRef', { id: bookingId, total })}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                    gateway === 'esewa' ? 'border-brand-500 bg-brand-tint' : 'border-line'
                  }`}
                >
                  <input
                    type="radio"
                    name="gateway"
                    value="esewa"
                    checked={gateway === 'esewa'}
                    onChange={() => setGateway('esewa')}
                    className="sr-only"
                  />
                  <span className="font-semibold text-ink">{t('book.esewa')}</span>
                  <span className="block text-xs text-ink-muted mt-1">{t('book.esewaDesc')}</span>
                </label>
                <label
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                    gateway === 'khalti' ? 'border-brand-500 bg-brand-tint' : 'border-line'
                  }`}
                >
                  <input
                    type="radio"
                    name="gateway"
                    value="khalti"
                    checked={gateway === 'khalti'}
                    onChange={() => setGateway('khalti')}
                    className="sr-only"
                  />
                  <span className="font-semibold text-ink">{t('book.khalti')}</span>
                  <span className="block text-xs text-ink-muted mt-1">{t('book.khaltiDesc')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 w-full px-4 py-3 font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl"
              >
                {busy ? t('book.contacting') : t('book.payNow')}
              </button>
            </form>
          )}

          {bookingId && payPayload && (
            <div className="bg-card border border-line rounded-2xl p-6 text-center">
              {payPayload.dev_mode ? (
                <>
                  <p className="text-4xl">🧪</p>
                  <h3 className="mt-3 font-semibold text-ink">{t('book.devMode')}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t('book.devModeText', {
                      gateway: gatewayLabel,
                      id: bookingId,
                      amount: formatPrice(payPayload.amount, lang),
                    })}
                  </p>
                  <button
                    onClick={handleSimulatePay}
                    disabled={busy}
                    className="mt-5 px-6 py-3 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl"
                  >
                    {busy ? t('book.verifying') : t('book.simulate')}
                  </button>
                </>
              ) : (
                <p className="text-ink-muted">
                  {t('book.redirecting', { gateway: gatewayLabel })}{' '}
                  <button
                    onClick={handleInitiatePayment}
                    className="text-brand-600 hover:underline font-medium"
                  >
                    {t('book.tryAgain')}
                  </button>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
