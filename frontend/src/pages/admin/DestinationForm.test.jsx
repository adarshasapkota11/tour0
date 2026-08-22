import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DestinationForm from './DestinationForm.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const destination = {
  id: 1,
  name: 'Pokhara',
  slug: 'pokhara',
  province: 'Gandaki',
  description: 'Adventure capital beside Phewa Lake.',
  latitude: '28.2096',
  longitude: '83.9856',
  is_featured: true,
  cover_image: null,
}

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/destinations/1/edit']}>
        <Routes>
          <Route path="/admin/destinations/:id/edit" element={<DestinationForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DestinationForm', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.delete.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url === '/admin/destinations/1/') {
        return Promise.resolve({ data: destination })
      }
      if (url === '/admin/gallery/?destination=1&page_size=100') {
        return Promise.resolve({
          data: { results: [{ id: 10, image: '/media/destinations/g1.png', caption: '' }] },
        })
      }
      if (url === '/admin/visit-packages/?destination=1&page_size=100') {
        return Promise.resolve({
          data: { results: [{ id: 5, name: '2 Days Pass', days: 2, price: '6000.00', capacity: 4 }] },
        })
      }
      return Promise.resolve({ data: { results: [] } })
    })
  })

  it('renders the edit form without crashing', async () => {
    renderForm()
    expect(await screen.findByText('Edit: Pokhara')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Adventure capital beside Phewa Lake.')).toBeInTheDocument()
  })

  it('renders gallery and visit package blocks for an existing destination', async () => {
    renderForm()
    expect(await screen.findByText('Gallery')).toBeInTheDocument()
    expect(await screen.findByText('Visit packages')).toBeInTheDocument()
    expect(await screen.findByText('2 Days Pass')).toBeInTheDocument()
  })

  it('adds a gallery image via the api client', async () => {
    mocks.post.mockResolvedValue({ data: { id: 11 } })
    const user = userEvent.setup()
    renderForm()
    await screen.findByText('Gallery')

    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText(/add image/i), file)

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/admin/gallery/', expect.any(FormData))
    })
  })
})
