import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAdminPayments } from '../../api/adminHooks'
import Pagination from '../../components/Pagination'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PageHeader, tdClass, thClass, tableWrap } from './adminForms'

const statusStyles = {
  pending: 'bg-subtle text-ink-muted',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

export default function PaymentsList() {
  usePageTitle('Admin · Payments')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [gateway, setGateway] = useState('')
  const [page, setPage] = useState(1)

  const params = {
    page,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(gateway ? { gateway } : {}),
  }
  const { data, isLoading, isError } = useAdminPayments(params)

  const payments = data?.results || []

  const resetPage = () => setPage(1)

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="Review transactions and correct statuses." />

      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          placeholder="Search transaction or customer…"
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
            aria-label="Filter by payment status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="w-40">
          <select
            value={gateway}
            onChange={(e) => {
              setGateway(e.target.value)
              resetPage()
            }}
            className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
            aria-label="Filter by gateway"
          >
            <option value="">All gateways</option>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Loading payments…" />
      ) : isError ? (
        <ErrorState message="Could not load payments." />
      ) : payments.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No payments found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>ID</th>
                <th className={thClass}>Activity</th>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Gateway</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-subtle">
                  <td className={`${tdClass} text-ink-faint`}>#{payment.id}</td>
                  <td className={`${tdClass} text-ink`}>{payment.activity_name}</td>
                  <td className={tdClass}>{payment.user_email}</td>
                  <td className={`${tdClass} capitalize`}>{payment.gateway}</td>
                  <td className={`${tdClass} font-medium text-ink`}>
                    Rs {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        statusStyles[payment.status] || 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Link
                      to={`/admin/payments/${payment.id}`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View
                    </Link>
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
