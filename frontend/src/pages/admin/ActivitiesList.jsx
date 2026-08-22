import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useAdminActivities, useDeleteActivity } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import Pagination from '../../components/Pagination'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { ConfirmDelete, PageHeader, PrimaryLink, tdClass, thClass, tableWrap } from './adminForms'

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  moderate: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  challenging: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function ActivitiesList() {
  usePageTitle('Admin · Activities')
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)
  const params = {
    page,
    ...(search ? { search } : {}),
    ...(difficulty ? { difficulty } : {}),
  }
  const { data, isLoading, isError } = useAdminActivities(params)
  const deleteActivity = useDeleteActivity()

  const activities = data?.results || []

  const resetPage = () => setPage(1)

  const handleDelete = (id) =>
    deleteActivity.mutate(id, {
      onSuccess: () => toast.success('Activity deleted.'),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        subtitle="Tours and adventures to manage."
        action={<PrimaryLink to="/admin/activities/new">+ New activity</PrimaryLink>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search activities…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            resetPage()
          }}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
        />
        <div className="w-40">
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value)
              resetPage()
            }}
            className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
            aria-label="Filter by difficulty"
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Loading activities…" />
      ) : isError ? (
        <ErrorState message="Could not load activities." />
      ) : activities.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No activities found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>Activity</th>
                <th className={thClass}>Destination</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Difficulty</th>
                <th className={thClass}>Featured</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-subtle">
                  <td className={`${tdClass} font-medium text-ink`}>
                    <Link to={`/admin/activities/${act.id}`} className="hover:text-brand-600">
                      {act.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{act.destination_name}</td>
                  <td className={tdClass}>{act.category_name}</td>
                  <td className={tdClass}>Rs {Number(act.price).toLocaleString()}</td>
                  <td className={tdClass}>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        difficultyStyles[act.difficulty] || 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {act.difficulty}
                    </span>
                  </td>
                  <td className={tdClass}>{act.is_featured ? '✓' : '—'}</td>
                  <td className={`${tdClass} text-right`}>
                    <span className="inline-flex items-center gap-4">
                      <Link
                        to={`/admin/activities/${act.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                      <ConfirmDelete onConfirm={() => handleDelete(act.id)} busy={deleteActivity.isPending} />
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
