import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useAdminAllVisitPackages, useDeleteVisitPackage } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import Pagination from '../../components/Pagination'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { ConfirmDelete, PageHeader, PrimaryLink, tdClass, thClass, tableWrap } from './adminForms'

export default function VisitPackagesList() {
  usePageTitle('Admin · Visit packages')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const params = {
    page,
    page_size: 12,
    ...(search ? { search } : {}),
    ...(status ? { is_active: status } : {}),
  }
  const { data, isLoading, isError } = useAdminAllVisitPackages(params)
  const deletePackage = useDeleteVisitPackage()

  const packages = data?.results || []

  const resetPage = () => setPage(1)

  const handleDelete = (id) =>
    deletePackage.mutate(id, {
      onSuccess: () => toast.success('Visit package deleted.'),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visit packages"
        subtitle="Destination tour packages to manage."
        action={<PrimaryLink to="/admin/visit-packages/new">+ New visit package</PrimaryLink>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search packages…"
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
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Loading visit packages…" />
      ) : isError ? (
        <ErrorState message="Could not load visit packages." />
      ) : packages.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No visit packages found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>Package</th>
                <th className={thClass}>Destination</th>
                <th className={thClass}>Days</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Capacity</th>
                <th className={thClass}>Active</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-subtle">
                  <td className={`${tdClass} font-medium text-ink`}>
                    <Link to={`/admin/visit-packages/${pkg.id}`} className="hover:text-brand-600">
                      {pkg.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{pkg.destination_name}</td>
                  <td className={tdClass}>{pkg.days}</td>
                  <td className={tdClass}>Rs {Number(pkg.price).toLocaleString()}</td>
                  <td className={tdClass}>{pkg.capacity}</td>
                  <td className={tdClass}>{pkg.is_active ? '✓' : '—'}</td>
                  <td className={`${tdClass} text-right`}>
                    <span className="inline-flex items-center gap-4">
                      <Link
                        to={`/admin/visit-packages/${pkg.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                      <ConfirmDelete
                        onConfirm={() => handleDelete(pkg.id)}
                        busy={deletePackage.isPending}
                      />
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
