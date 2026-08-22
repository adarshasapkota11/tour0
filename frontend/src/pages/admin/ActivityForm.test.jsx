import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ActivityForm from './ActivityForm.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderForm({ route = '/admin/activities/new' } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/activities/new" element={<ActivityForm />} />
          <Route path="/admin/activities/:id" element={<ActivityForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ActivityForm', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/admin/activities/')) {
        return Promise.resolve({
          data: {
            id: 1,
            name: 'Paragliding',
            destination: 1,
            category: 2,
            description: 'Fly over Pokhara',
            price: 15000,
            duration: '3 hours',
            capacity: 2,
            difficulty: 'moderate',
            is_featured: true,
            image: null,
          },
        })
      }
      if (url.startsWith('/admin/destinations')) {
        return Promise.resolve({ data: { count: 1, results: [{ id: 1, name: 'Pokhara' }] } })
      }
      if (url.startsWith('/admin/categories')) {
        return Promise.resolve({ data: { count: 1, results: [{ id: 2, name: 'Adventure' }] } })
      }
      return Promise.resolve({ data: { results: [] } })
    })
  })

  it('renders new activity form with fields', async () => {
    renderForm()
    expect(await screen.findByText('New activity')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(await screen.findByText('Select destination')).toBeInTheDocument()
    expect(screen.getByText('Select category')).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('renders edit form with pre-filled data', async () => {
    renderForm({ route: '/admin/activities/1' })
    expect(await screen.findByText('Edit: Paragliding')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fly over Pokhara')).toBeInTheDocument()
  })

  it('submits the form via create', async () => {
    mocks.post.mockResolvedValue({ data: { id: 2 } })
    const user = userEvent.setup()
    renderForm()
    await screen.findByText('New activity')

    await user.type(screen.getByLabelText(/name/i), 'Bungee Jumping')
    await user.selectOptions(screen.getByLabelText(/destination/i, { selector: 'select' }), '1')
    await user.selectOptions(screen.getByLabelText(/category/i, { selector: 'select' }), '2')
    await user.type(screen.getByLabelText(/description/i), 'Thrilling bungee jump')
    await user.type(screen.getByLabelText(/price/i), '8000')

    await user.click(screen.getByRole('button', { name: /create activity/i }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalled()
    })
  })
})
