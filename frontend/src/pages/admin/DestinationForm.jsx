import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useAdminDestination,
  useAdminGallery,
  useAdminVisitPackages,
  useCreateDestination,
  useCreateGalleryImage,
  useCreateVisitPackage,
  useDeleteGalleryImage,
  useDeleteVisitPackage,
  useUpdateDestination,
  useUpdateVisitPackage,
} from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatPrice } from '../../utils/nepaliDate.js'
import {
  CheckboxField,
  ConfirmDelete,
  ImageField,
  TextAreaField,
  TextField,
} from './adminForms'

export default function DestinationForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  usePageTitle(editing ? 'Edit destination' : 'New destination')

  const navigate = useNavigate()
  const { data: dest, isLoading, isError } = useAdminDestination(id)

  const create = useCreateDestination()
  const update = useUpdateDestination()

  const { data: gallery, isLoading: galleryLoading } = useAdminGallery(id)
  const createImage = useCreateGalleryImage()
  const deleteImage = useDeleteGalleryImage()

  const { data: packages, isLoading: packagesLoading } = useAdminVisitPackages(id)
  const createPackage = useCreateVisitPackage()
  const updatePackage = useUpdateVisitPackage()
  const deletePackage = useDeleteVisitPackage()

  const [form, setForm] = useState({
    name: '',
    province: '',
    description: '',
    latitude: '',
    longitude: '',
    is_featured: false,
  })
  const [cover, setCover] = useState(null)
  const [pkgForm, setPkgForm] = useState({ name: '', price: '', days: '1', capacity: '1' })
  const [pkgFormOpen, setPkgFormOpen] = useState(false)
  const [editingPkgId, setEditingPkgId] = useState(null)

  useEffect(() => {
    if (dest) {
      setForm({
        name: dest.name,
        province: dest.province,
        description: dest.description,
        latitude: dest.latitude ?? '',
        longitude: dest.longitude ?? '',
        is_featured: dest.is_featured,
      })
    }
  }, [dest])

  if (editing && isLoading) return <Loading label="Loading destination…" />
  if (editing && isError) return <ErrorState message="Destination not found." />

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const images = gallery?.results || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = new FormData()
    payload.append('name', form.name)
    payload.append('province', form.province)
    payload.append('description', form.description)
    if (form.latitude) payload.append('latitude', form.latitude)
    if (form.longitude) payload.append('longitude', form.longitude)
    payload.append('is_featured', String(form.is_featured))
    if (cover) payload.append('cover_image', cover)

    const onSuccess = () => {
      toast.success(editing ? 'Destination updated.' : 'Destination created.')
      navigate('/admin/destinations')
    }
    const onError = (err) => toast.error(extractError(err))

    if (editing) update.mutate({ id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  const handleAddImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const payload = new FormData()
    payload.append('destination', id)
    payload.append('image', file)
    createImage.mutate(payload, {
      onSuccess: () => toast.success('Gallery image added.'),
      onError: (err) => toast.error(extractError(err)),
    })
  }

  const handleDeleteImage = (imageId) =>
    deleteImage.mutate(imageId, {
      onSuccess: () => toast.success('Gallery image removed.'),
      onError: (err) => toast.error(extractError(err)),
    })

  const openPackageForm = () => {
    setPkgForm({ name: '', price: '', days: '1', capacity: '1' })
    setEditingPkgId(null)
    setPkgFormOpen(true)
  }

  const startEditPackage = (pkg) => {
    setPkgForm({
      name: pkg.name,
      price: pkg.price,
      days: String(pkg.days),
      capacity: String(pkg.capacity),
    })
    setEditingPkgId(pkg.id)
    setPkgFormOpen(true)
  }

  const handleSavePackage = () => {
    if (!pkgForm.name || !pkgForm.price || !pkgForm.days) return
    const payload = {
      destination: id,
      name: pkgForm.name,
      price: pkgForm.price,
      days: pkgForm.days,
      capacity: pkgForm.capacity || 1,
    }
    const onSuccess = () => {
      toast.success(editingPkgId ? 'Visit package updated.' : 'Visit package added.')
      setPkgFormOpen(false)
    }
    const onError = (err) => toast.error(extractError(err))

    if (editingPkgId) updatePackage.mutate({ id: editingPkgId, payload }, { onSuccess, onError })
    else createPackage.mutate(payload, { onSuccess, onError })
  }

  const handleDeletePackage = (pkgId) =>
    deletePackage.mutate(pkgId, {
      onSuccess: () => toast.success('Visit package removed.'),
      onError: (err) => toast.error(extractError(err)),
    })

  const pkgList = packages?.results || []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">
          {editing ? `Edit: ${dest.name}` : 'New destination'}
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
          label="Province"
          id="province"
          required
          value={form.province}
          onChange={updateField('province')}
          placeholder="e.g. Gandaki"
        />
        <TextAreaField
          label="Description"
          id="description"
          required
          value={form.description}
          onChange={updateField('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Latitude"
            id="latitude"
            value={form.latitude}
            onChange={updateField('latitude')}
            placeholder="e.g. 27.7172"
          />
          <TextField
            label="Longitude"
            id="longitude"
            value={form.longitude}
            onChange={updateField('longitude')}
            placeholder="e.g. 85.3240"
          />
        </div>
        <p className="text-xs text-ink-faint -mt-3">
          Coordinates place this destination on the homepage map.
        </p>
        <ImageField
          label="Cover image"
          id="cover_image"
          current={dest?.cover_image}
          onChange={setCover}
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
            {create.isPending || update.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create destination'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/destinations')}
            className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>

      {editing && (
        <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Gallery</h3>
            <label className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-2 cursor-pointer">
              + Add image
              <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
            </label>
          </div>

          {galleryLoading ? (
            <Loading label="Loading gallery…" />
          ) : images.length === 0 ? (
            <p className="text-sm text-ink-faint py-6 text-center">No gallery images yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.image}
                    alt={img.caption || 'Gallery image'}
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <ConfirmDelete
                      label="Remove"
                      className="text-white"
                      onConfirm={() => handleDeleteImage(img.id)}
                      busy={deleteImage.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Visit packages</h3>
            <button
              type="button"
              onClick={openPackageForm}
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-2"
            >
              + Add package
            </button>
          </div>
          <p className="text-xs text-ink-faint -mt-2">
            Visitors book a package to visit this destination for a fixed number of days.
          </p>

          {pkgFormOpen && (
            <div className="border border-line rounded-xl p-4 space-y-3">
              <TextField
                label="Package name"
                id="pkg_name"
                required
                value={pkgForm.name}
                onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                placeholder="e.g. 2 Days Pass"
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField
                  label="Price (NPR)"
                  id="pkg_price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={pkgForm.price}
                  onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                />
                <TextField
                  label="Days"
                  id="pkg_days"
                  required
                  type="number"
                  min="1"
                  value={pkgForm.days}
                  onChange={(e) => setPkgForm({ ...pkgForm, days: e.target.value })}
                />
                <TextField
                  label="Capacity"
                  id="pkg_capacity"
                  type="number"
                  min="1"
                  value={pkgForm.capacity}
                  onChange={(e) => setPkgForm({ ...pkgForm, capacity: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSavePackage}
                  disabled={createPackage.isPending || updatePackage.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
                >
                  {createPackage.isPending || updatePackage.isPending
                    ? 'Saving…'
                    : editingPkgId
                      ? 'Save package'
                      : 'Add package'}
                </button>
                <button
                  type="button"
                  onClick={() => setPkgFormOpen(false)}
                  className="text-sm font-medium text-ink-muted hover:text-ink rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {packagesLoading ? (
            <Loading label="Loading packages…" />
          ) : pkgList.length === 0 ? (
            <p className="text-sm text-ink-faint py-4 text-center">No visit packages yet.</p>
          ) : (
            <div className="space-y-2">
              {pkgList.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between border border-line rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{pkg.name}</p>
                    <p className="text-xs text-ink-muted">
                      {pkg.days} day{pkg.days === 1 ? '' : 's'} · {formatPrice(pkg.price, 'en')} ·
                      capacity {pkg.capacity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => startEditPackage(pkg)}
                      className="font-medium text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <ConfirmDelete
                      label="Remove"
                      onConfirm={() => handleDeletePackage(pkg.id)}
                      busy={deletePackage.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
