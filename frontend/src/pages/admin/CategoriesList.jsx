import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useAdminCategories, useDeleteCategory } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { ConfirmDelete, PageHeader, PrimaryLink, tdClass, thClass, tableWrap } from './adminForms'

export default function CategoriesList() {
  usePageTitle('Admin · Categories')
  const { data, isLoading, isError } = useAdminCategories()
  const deleteCategory = useDeleteCategory()

  const categories = data?.results || []

  const handleDelete = (id) =>
    deleteCategory.mutate(id, {
      onSuccess: () => toast.success('Category deleted.'),
      onError: (err) => toast.error(extractError(err)),
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Groups used to classify activities."
        action={<PrimaryLink to="/admin/categories/new">+ New category</PrimaryLink>}
      />

      {isLoading ? (
        <Loading label="Loading categories…" />
      ) : isError ? (
        <ErrorState message="Could not load categories." />
      ) : categories.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No categories found.
        </div>
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead className="bg-subtle border-b border-line">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Icon</th>
                <th className={thClass}>Activities</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-subtle">
                  <td className={`${tdClass} font-medium text-ink`}>
                    <Link to={`/admin/categories/${cat.id}`} className="hover:text-brand-600">
                      {cat.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{cat.icon || '—'}</td>
                  <td className={tdClass}>{cat.activity_count}</td>
                  <td className={`${tdClass} text-right`}>
                    <span className="inline-flex items-center gap-4">
                      <Link
                        to={`/admin/categories/${cat.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                      <ConfirmDelete onConfirm={() => handleDelete(cat.id)} busy={deleteCategory.isPending} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
