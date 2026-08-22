import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookVisit from './BookVisit.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const pkg = {
  id: 5,
  destination: 1,
  destination_name: 'Pokhara',
  destination_slug: 'pokhara',
  destination_image: null,
  name: 'Pokhara Getaway',
  price: '9500.00',
  days: 3,
  description: 'Phewa Lake, sunrise at Sarangkot and a cultural evening in Lakeside.',
  capacity: 8,
}

function renderBookVisit() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/book/visit/5']}>
        <Routes>
          <Route path="/book/visit/:packageId" element={<BookVisit />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BookVisit', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.delete.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url === '/visit-packages/5/') {
        return Promise.resolve({ data: pkg })
      }
      return Promise.resolve({ data: { results: [] } })
    })
  })

  it('renders package details with price and day badge', async () => {
    renderBookVisit()
    expect(await screen.findByText('Pokhara Getaway')).toBeInTheDocument()
    expect(screen.getByText('Pokhara · 3 days')).toBeInTheDocument()
    expect(screen.getByText(/This package covers 3 day\(s\) of visiting\./)).toBeInTheDocument()
    expect(screen.getByText('Rs 9,500')).toBeInTheDocument()
    expect(screen.getByText('Rs 28,500')).toBeInTheDocument()
    expect(screen.getByText(/Phewa Lake, sunrise at Sarangkot/)).toBeInTheDocument()
  })

  it('creates a visit-package booking with the correct payload', async () => {
    mocks.post.mockResolvedValue({ data: { id: 42 } })
    const user = userEvent.setup()
    const { container } = renderBookVisit()
    await screen.findByText('Pokhara Getaway')

    const dateInput = container.querySelector('input[type="date"]')
    fireEvent.change(dateInput, { target: { value: '2030-01-01' } })
    const travelersInput = container.querySelector('input[type="number"]')
    await user.clear(travelersInput)
    await user.type(travelersInput, '2')
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/bookings/', {
        visit_package: 5,
        travel_date: '2030-01-01',
        travelers: 2,
      })
    })
    expect(await screen.findByText('Payment method')).toBeInTheDocument()
  })
})
