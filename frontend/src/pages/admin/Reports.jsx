import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAdminReport } from '../../api/adminHooks'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

function buildPresets() {
  const now = new Date()
  const today = toISO(now)
  const startOfMonth = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
  const endOfLastMonth = toISO(new Date(now.getFullYear(), now.getMonth(), 0))
  const startOfLastMonth = toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const startOfYear = toISO(new Date(now.getFullYear(), 0, 1))
  const startOfLastYear = toISO(new Date(now.getFullYear() - 1, 0, 1))
  const endOfLastYear = toISO(new Date(now.getFullYear() - 1, 11, 31))
  return {
    thisMonth: { label: 'This month', start: startOfMonth, end: today },
    lastMonth: { label: 'Last month', start: startOfLastMonth, end: endOfLastMonth },
    thisYear: { label: 'This year', start: startOfYear, end: today },
    lastYear: { label: 'Last year', start: startOfLastYear, end: endOfLastYear },
  }
}

const PRESETS = buildPresets()

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <p className="text-sm text-ink-faint">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function Breakdown({ title, data }) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) return null
  const total = entries.reduce((sum, [, v]) => sum + v, 0)
  return (
    <section className="bg-card border border-line rounded-2xl p-5 print:border-0 print:shadow-none">
      <h3 className="font-semibold text-ink mb-4">{title}</h3>
      <ul className="space-y-2">
        {entries.map(([name, value]) => (
          <li key={name} className="flex items-center gap-3">
            <span className="w-32 text-sm text-ink-subtle capitalize">{name.replace('_', ' ')}</span>
            <div className="flex-1 h-2 bg-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: total ? `${(value / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-sm font-medium text-ink w-10 text-right">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ItemList({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <section className="bg-card border border-line rounded-2xl p-5 print:border-0 print:shadow-none">
      <h3 className="font-semibold text-ink mb-4">{title}</h3>
      <ol className="divide-y divide-line">
        {items.map(([name, count]) => (
          <li key={name} className="py-2.5 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink truncate">{name}</span>
            <span className="text-sm text-ink-faint shrink-0">{count}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Reports() {
  usePageTitle('Admin · Reports')
  const [range, setRange] = useState('thisMonth')
  const [customStart, setCustomStart] = useState(PRESETS.thisMonth.start)
  const [customEnd, setCustomEnd] = useState(PRESETS.thisMonth.end)

  const { start, end } = useMemo(() => {
    if (range === 'custom') return { start: customStart, end: customEnd }
    const preset = PRESETS[range]
    return { start: preset.start, end: preset.end }
  }, [range, customStart, customEnd])

  const { data, isLoading, isError } = useAdminReport({ start, end })

  const chartData = (data?.days || []).map((day, i) => ({
    day: day.slice(5),
    bookings: data.bookings_by_day[i],
    revenue: data.revenue_by_day[i],
  }))

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-ink">Reports</h2>
          <p className="mt-1 text-sm text-ink-faint">
            Bookings and revenue over a date range.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-ink text-card text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Print report
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === key
                  ? 'bg-brand-600 text-white'
                  : 'bg-card border border-line text-ink-muted hover:bg-subtle'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRange('custom')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            range === 'custom'
              ? 'bg-brand-600 text-white'
              : 'bg-card border border-line text-ink-muted hover:bg-subtle'
          }`}
        >
          Custom
        </button>
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-line-strong text-sm bg-card"
              aria-label="Start date"
            />
            <span className="text-ink-faint text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-line-strong text-sm bg-card"
              aria-label="End date"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <Loading label="Loading report…" />
      ) : isError ? (
        <ErrorState message="Could not load report." />
      ) : (
        <>
          <p className="text-sm text-ink-faint">
            {data.range.start} → {data.range.end}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Bookings" value={data.totals.bookings} accent="text-ink" />
            <StatCard
              label="Confirmed"
              value={data.totals.confirmed}
              accent="text-emerald-600"
            />
            <StatCard label="Cancelled" value={data.totals.cancelled} accent="text-red-600" />
            <StatCard
              label="Paid revenue"
              value={`Rs ${Number(data.totals.revenue).toLocaleString()}`}
              accent="text-brand-600"
            />
            <StatCard
              label="Avg booking value"
              value={`Rs ${Number(data.totals.avg_booking_value).toLocaleString()}`}
              accent="text-ink"
            />
          </div>

          <section className="bg-card border border-line rounded-2xl p-5 print:border-0 print:shadow-none">
            <h3 className="font-semibold text-ink mb-4">Bookings & revenue per day</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="bookings" name="Bookings" fill="#00A79D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue (Rs)" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <div className="grid lg:grid-cols-2 gap-6 print:gap-3">
            <ItemList title="Top activities" items={data.top_activities} />
            <ItemList title="Top destinations" items={data.top_destinations} />
            <Breakdown title="Payments by status" data={data.payments_by_status} />
            <Breakdown title="Payments by gateway" data={data.payments_by_gateway} />
            <Breakdown title="Bookings by item type" data={data.item_split} />
          </div>
        </>
      )}
    </div>
  )
}
