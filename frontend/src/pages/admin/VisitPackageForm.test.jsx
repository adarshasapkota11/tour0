import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import VisitPackageForm from './VisitPackageForm.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderForm({ route = '/admin/visit-packages/new' } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/visit-packages/new" element={<VisitPackageForm />} />
          <Route path="/admin/visit-packages/:id" element={<VisitPackageForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VisitPackageForm', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/admin/visit-packages/')) {
        return Promise.resolve({
          data: {
            id: 1,
            name: 'Everest Trek',
            destination: 1,
            description: 'A long trek',
            price: 120000,
            days: 14,
            capacity: 10,
            is_active: true,
          },
        })
      }
      if (url.startsWith('/admin/destinations')) {
        return Promise.resolve({ data: { count: 1, results: [{ id: 1, name: 'Pokhara' }] } })
      }
      return Promise.resolve({ data: { results: [] } })
    })
  })

  it('renders new visit package form', async () => {
    renderForm()
    expect(await screen.findByText('New visit package')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('renders edit form with pre-filled data', async () => {
    renderForm({ route: '/admin/visit-packages/1' })
    expect(await screen.findByText('Edit: Everest Trek')).toBeInTheDocument()
  })

  it('submits the create form', async () => {
    mocks.post.mockResolvedValue({ data: { id: 2 } })
    const user = userEvent.setup()
    renderForm()
    await screen.findByText('New visit package')

    await user.type(screen.getByLabelText(/name/i), 'Annapurna Circuit')
    await user.selectOptions(screen.getByLabelText(/destination/i, { selector: 'select' }), '1')
    await user.type(screen.getByLabelText(/price/i), '50000')
    await user.type(screen.getByLabelText(/description/i), 'Beautiful trek')

    await user.click(screen.getByRole('button', { name: /create visit package/i }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalled()
    })
  })
})
