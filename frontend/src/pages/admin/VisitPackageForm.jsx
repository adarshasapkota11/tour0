import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useAdminDestinations,
  useAdminVisitPackage,
  useCreateVisitPackage,
  useUpdateVisitPackage,
} from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { CheckboxField, SelectField, TextAreaField, TextField } from './adminForms'

export default function VisitPackageForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  usePageTitle(editing ? 'Edit visit package' : 'New visit package')

  const navigate = useNavigate()
  const { data: pkg, isLoading, isError } = useAdminVisitPackage(id)
  const { data: destinations, isLoading: destLoading } = useAdminDestinations({ page_size: 100 })

  const create = useCreateVisitPackage()
  const update = useUpdateVisitPackage()

  const [form, setForm] = useState({
    destination: '',
    name: '',
    description: '',
    price: '',
    days: '1',
    capacity: '1',
    is_active: true,
  })

  useEffect(() => {
    if (pkg) {
      setForm({
        destination: pkg.destination,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        days: pkg.days,
        capacity: pkg.capacity,
        is_active: pkg.is_active,
      })
    }
  }, [pkg])

  if (editing && isLoading) return <Loading label="Loading visit package…" />
  if (editing && isError) return <ErrorState message="Visit package not found." />

  const destOptions = destinations?.results || []

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      destination: form.destination,
      name: form.name,
      description: form.description,
      price: form.price,
      days: form.days,
      capacity: form.capacity,
      is_active: form.is_active,
    }

    const onSuccess = () => {
      toast.success(editing ? 'Visit package updated.' : 'Visit package created.')
      navigate('/admin/visit-packages')
    }
    const onError = (err) => toast.error(extractError(err))

    if (editing) update.mutate({ id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">
          {editing ? `Edit: ${pkg.name}` : 'New visit package'}
        </h2>
        <p className="mt-1 text-sm text-ink-faint">A multi-day tour package for a destination.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-line rounded-2xl p-6 space-y-5">
        <TextField
          label="Name"
          id="name"
          required
          value={form.name}
          onChange={updateField('name')}
        />

        {destLoading ? (
          <p className="text-sm text-ink-faint py-2">Loading destinations…</p>
        ) : (
          <SelectField
            label="Destination"
            id="destination"
            required
            value={form.destination}
            onChange={updateField('destination')}
          >
            <option value="">Select destination</option>
            {destOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          <TextField
            label="Price (Rs)"
            id="price"
            type="number"
            min="0"
            required
            value={form.price}
            onChange={updateField('price')}
          />
          <TextField
            label="Days"
            id="days"
            type="number"
            min="1"
            required
            value={form.days}
            onChange={updateField('days')}
          />
          <TextField
            label="Capacity"
            id="capacity"
            type="number"
            min="1"
            required
            value={form.capacity}
            onChange={updateField('capacity')}
          />
        </div>

        <TextAreaField
          label="Description"
          id="description"
          value={form.description}
          onChange={updateField('description')}
        />

        <CheckboxField
          label="Active (bookable on the public site)"
          id="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            {editing ? 'Save changes' : 'Create visit package'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/visit-packages')}
            className="px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-subtle rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
