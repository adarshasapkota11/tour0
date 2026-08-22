import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { useAdminCategory, useCreateCategory, useUpdateCategory } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { TextField } from './adminForms'

export default function CategoryForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  usePageTitle(editing ? 'Edit category' : 'New category')

  const navigate = useNavigate()
  const { data: category, isLoading, isError } = useAdminCategory(id)
  const create = useCreateCategory()
  const update = useUpdateCategory()

  const [form, setForm] = useState({ name: '', icon: '' })

  useEffect(() => {
    if (category) {
      setForm({ name: category.name, icon: category.icon })
    }
  }, [category])

  if (editing && isLoading) return <Loading label="Loading category…" />
  if (editing && isError) return <ErrorState message="Category not found." />

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const onSuccess = () => {
      toast.success(editing ? 'Category updated.' : 'Category created.')
      navigate('/admin/categories')
    }
    const onError = (err) => toast.error(extractError(err))
    if (editing) update.mutate({ id, payload: form }, { onSuccess, onError })
    else create.mutate(form, { onSuccess, onError })
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">
          {editing ? `Edit: ${category.name}` : 'New category'}
        </h2>
        <p className="mt-1 text-sm text-ink-faint">The slug is generated automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-line rounded-2xl p-6 space-y-5">
        <TextField
          label="Name"
          id="name"
          required
          value={form.name}
          onChange={updateField('name')}
        />
        <TextField
          label="Icon (emoji)"
          id="icon"
          value={form.icon}
          onChange={updateField('icon')}
          placeholder="e.g. 🏔️"
        />

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={create.isPending || update.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
          >
            {create.isPending || update.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
