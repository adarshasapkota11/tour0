import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAdminStats } from '../../api/adminHooks'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#10b981', cancelled: '#ef4444' }

function ChartCard({ title, children }) {
  return (
    <section className="bg-card border border-line rounded-2xl p-5">
      <h3 className="font-semibold text-ink mb-4">{title}</h3>
      {children}
    </section>
  )
}

function Charts({ chart }) {
  const bookingsData = chart.labels.map((label, i) => ({
    label,
    bookings: chart.bookings_by_month[i],
  }))
  const revenueData = chart.labels.map((label, i) => ({
    label,
    revenue: chart.revenue_by_month[i],
  }))
  const statusData = Object.entries(chart.bookings_by_status).map(([name, value]) => ({
    name,
    value,
  }))
  const destData = chart.top_destinations.map(([name, count]) => ({ name, count }))

  const axisStyle = { fontSize: 11, fill: '#64748b' }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <ChartCard title="Bookings by month">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={bookingsData}>
            <defs>
              <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A79D" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00A79D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#00A79D"
              strokeWidth={2}
              fill="url(#bookingsFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue by month (Rs)">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Bookings by status">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              label={(entry) => entry.value}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top destinations">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={destData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#00A79D" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <p className="text-sm text-ink-faint">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  usePageTitle('Admin dashboard')
  const { data, isLoading, isError } = useAdminStats()

  if (isLoading) return <Loading label="Loading dashboard…" />
  if (isError) return <ErrorState message="Could not load dashboard stats." />

  const { stats, recent_bookings: recent, chart } = data

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-ink-faint">A quick overview of tours, bookings and revenue.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bookings" value={stats.total_bookings} accent="text-ink" />
        <StatCard
          label="Pending bookings"
          value={stats.pending_bookings}
          accent="text-amber-600"
        />
        <StatCard label="Today's bookings" value={stats.today_bookings} accent="text-brand-600" />
        <StatCard
          label="Paid revenue"
          value={`Rs ${Number(stats.revenue).toLocaleString()}`}
          accent="text-emerald-600"
        />
      </div>

      {chart && <Charts chart={chart} />}

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-card border border-line rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-4">Recent bookings</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-faint py-6 text-center">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((booking) => (
                <li key={booking.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {booking.activity_name}
                    </p>
                    <p className="text-xs text-ink-faint truncate">
                      {booking.user_email} · {booking.travel_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        statusStyles[booking.status] || 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <Link
                      to={`/admin/bookings/${booking.id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card border border-line rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-4">Top activities</h3>
          {stats.top_activities.length === 0 ? (
            <p className="text-sm text-ink-faint py-6 text-center">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.top_activities.map(([name, count]) => (
                <li key={name} className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink truncate">{name}</span>
                  <span className="text-sm text-ink-faint shrink-0">{count} booking{count > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
