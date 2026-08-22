import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookingsList from './BookingsList.jsx'

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

const booking = {
  id: 7,
  activity_name: 'Paragliding',
  destination_name: 'Pokhara',
  user_full_name: 'Ram',
  user_email: 'ram@example.com',
  travel_date: '2026-09-01',
  travelers: 2,
  total_price: '15000.00',
  status: 'pending',
  payment_status: null,
}

function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BookingsList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BookingsList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/admin/destinations')) {
        return Promise.resolve({ data: { count: 0, results: [] } })
      }
      return Promise.resolve({ data: { count: 1, results: [booking] } })
    })
    mocks.post.mockResolvedValue({ data: { ...booking, status: 'confirmed' } })
  })

  it('renders bookings with customer and activity', async () => {
    renderList()
    expect(await screen.findByText('Paragliding')).toBeInTheDocument()
    expect(screen.getByText('Ram')).toBeInTheDocument()
    expect(screen.getByText('ram@example.com')).toBeInTheDocument()
  })

  it('confirms a pending booking', async () => {
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Paragliding')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/admin/bookings/7/confirm/')
    })
  })
})
