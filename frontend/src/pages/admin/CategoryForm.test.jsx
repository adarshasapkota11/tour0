import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CategoryForm from './CategoryForm.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderForm({ route = '/admin/categories/new' } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/categories/new" element={<CategoryForm />} />
          <Route path="/admin/categories/:id" element={<CategoryForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CategoryForm', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url === '/admin/categories/1/') {
        return Promise.resolve({ data: { id: 1, name: 'Adventure', icon: '\u{1f3d4}\u{fe0f}' } })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it('renders new category form', async () => {
    renderForm()
    expect(await screen.findByText('New category')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/icon/i)).toBeInTheDocument()
  })

  it('renders edit form with pre-filled data', async () => {
    renderForm({ route: '/admin/categories/1' })
    expect(await screen.findByText('Edit: Adventure')).toBeInTheDocument()
  })

  it('submits the create form', async () => {
    mocks.post.mockResolvedValue({ data: { id: 3 } })
    const user = userEvent.setup()
    renderForm()
    await screen.findByText('New category')

    await user.type(screen.getByLabelText(/name/i), 'Trekking')
    await user.click(screen.getByRole('button', { name: /create category/i }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalled()
    })
  })
})
