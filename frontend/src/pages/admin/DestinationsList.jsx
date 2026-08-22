import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useAdminDestinations, useDeleteDestination } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import Pagination from '../../components/Pagination'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { ConfirmDelete, PageHeader, PrimaryLink, tdClass, thClass, tableWrap } from './adminForms'

export default function DestinationsList() {
  usePageTitle('Admin · Destinations')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminDestinations({ page, ...(search ? { search } : {}) })
  const deleteDestination = useDeleteDestination()

  const destinations = data?.results || []

  const handleDelete = (id) =>
    deleteDestination.mutate(id, {
      onSuccess: () => toast.success('Destination deleted.'),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        subtitle="Places featured across the site."
        action={<PrimaryLink to="/admin/destinations/new">+ New destination</PrimaryLink>}
      />

      <input
        type="search"
        placeholder="Search destinations…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="max-w-sm w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
      />

      {isLoading ? (
        <Loading label="Loading destinations…" />
      ) : isError ? (
        <ErrorState message="Could not load destinations." />
      ) : destinations.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No destinations found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>Destination</th>
                <th className={thClass}>Province</th>
                <th className={thClass}>Activities</th>
                <th className={thClass}>Featured</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {destinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-subtle">
                  <td className={`${tdClass} font-medium text-ink`}>
                    <Link to={`/admin/destinations/${dest.id}`} className="hover:text-brand-600">
                      {dest.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{dest.province}</td>
                  <td className={tdClass}>{dest.activity_count}</td>
                  <td className={tdClass}>{dest.is_featured ? '✓' : '—'}</td>
                  <td className={`${tdClass} text-right`}>
                    <span className="inline-flex items-center gap-4">
                      <Link
                        to={`/admin/destinations/${dest.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                      <ConfirmDelete onConfirm={() => handleDelete(dest.id)} busy={deleteDestination.isPending} />
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
