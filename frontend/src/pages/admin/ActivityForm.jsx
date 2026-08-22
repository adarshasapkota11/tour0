import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useAdminActivity,
  useAdminCategories,
  useAdminDestinations,
  useCreateActivity,
  useUpdateActivity,
} from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import {
  CheckboxField,
  ImageField,
  SelectField,
  TextAreaField,
  TextField,
} from './adminForms'

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
]

export default function ActivityForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  usePageTitle(editing ? 'Edit activity' : 'New activity')

  const navigate = useNavigate()
  const { data: activity, isLoading, isError } = useAdminActivity(id)
  const { data: destinations, isLoading: destLoading } = useAdminDestinations({ page_size: 100 })
  const { data: categories, isLoading: catLoading } = useAdminCategories()

  const create = useCreateActivity()
  const update = useUpdateActivity()

  const [form, setForm] = useState({
    destination: '',
    category: '',
    name: '',
    description: '',
    price: '',
    duration: '',
    capacity: 1,
    difficulty: 'easy',
    is_featured: false,
  })
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (activity) {
      setForm({
        destination: activity.destination,
        category: activity.category,
        name: activity.name,
        description: activity.description,
        price: activity.price,
        duration: activity.duration,
        capacity: activity.capacity,
        difficulty: activity.difficulty,
        is_featured: activity.is_featured,
      })
    }
  }, [activity])

  if (editing && isLoading) return <Loading label="Loading activity…" />
  if (editing && isError) return <ErrorState message="Activity not found." />

  const destOptions = destinations?.results || []
  const catOptions = categories?.results || []

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = new FormData()
    payload.append('destination', form.destination)
    payload.append('category', form.category)
    payload.append('name', form.name)
    payload.append('description', form.description)
    payload.append('price', form.price)
    payload.append('duration', form.duration)
    payload.append('capacity', String(form.capacity))
    payload.append('difficulty', form.difficulty)
    payload.append('is_featured', String(form.is_featured))
    if (image) payload.append('image', image)

    const onSuccess = () => {
      toast.success(editing ? 'Activity updated.' : 'Activity created.')
      navigate('/admin/activities')
    }
    const onError = (err) => toast.error(extractError(err))

    if (editing) update.mutate({ id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">
          {editing ? `Edit: ${activity.name}` : 'New activity'}
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

        <div className="grid sm:grid-cols-2 gap-5">
          {destLoading ? (
            <p className="text-sm text-ink-faint py-2">Loading destinations…</p>
          ) : (
            <SelectField label="Destination" id="destination" required value={form.destination} onChange={updateField('destination')}>
              <option value="">Select destination</option>
              {destOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
          )}
          {catLoading ? (
            <p className="text-sm text-ink-faint py-2">Loading categories…</p>
          ) : (
            <SelectField label="Category" id="category" required value={form.category} onChange={updateField('category')}>
              <option value="">Select category</option>
              {catOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          )}
        </div>

        <TextAreaField
          label="Description"
          id="description"
          required
          value={form.description}
          onChange={updateField('description')}
        />

        <div className="grid sm:grid-cols-2 gap-5">
          <TextField
            label="Price (Rs)"
            id="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price}
            onChange={updateField('price')}
          />
          <TextField
            label="Duration"
            id="duration"
            value={form.duration}
            onChange={updateField('duration')}
            placeholder="e.g. 3 days / 2 nights"
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
          <SelectField label="Difficulty" id="difficulty" value={form.difficulty} onChange={updateField('difficulty')}>
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </SelectField>
        </div>

        <ImageField
          label="Image"
          id="image"
          current={activity?.image}
          onChange={setImage}
        />
        <CheckboxField
          label="Featured on homepage"
          checked={form.is_featured}
          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
        />

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={create.isPending || update.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
          >
            {create.isPending || update.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create activity'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/activities')}
            className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
