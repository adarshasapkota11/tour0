import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookingDetail from './BookingDetail.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
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
  user_phone: '+977-9841000000',
  travel_date: '2026-09-01',
  travelers: 2,
  total_price: 15000,
  status: 'pending',
  payment_status: null,
  created_at: '2026-08-01T10:00:00Z',
}

function renderDetail() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/admin/bookings/7']}>
        <Routes>
          <Route path="/admin/bookings/:id" element={<BookingDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BookingDetail', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: booking })
    mocks.post.mockResolvedValue({ data: { ...booking, status: 'confirmed' } })
  })

  it('renders booking details', async () => {
    renderDetail()
    expect(await screen.findByText('Booking #7')).toBeInTheDocument()
    expect(screen.getByText('Paragliding')).toBeInTheDocument()
    expect(screen.getByText('Pokhara')).toBeInTheDocument()
    expect(screen.getByText('ram@example.com')).toBeInTheDocument()
    expect(screen.getByText('2026-09-01')).toBeInTheDocument()
  })

  it('shows confirm and cancel buttons for pending bookings', async () => {
    renderDetail()
    await screen.findByText('Booking #7')
    expect(screen.getByRole('button', { name: /confirm booking/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel booking/i })).toBeInTheDocument()
  })

  it('confirms a booking', async () => {
    const user = userEvent.setup()
    renderDetail()
    await screen.findByText('Booking #7')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/admin/bookings/7/confirm/')
    })
  })

  it('cancels a booking', async () => {
    const user = userEvent.setup()
    renderDetail()
    await screen.findByText('Booking #7')
    await user.click(screen.getByRole('button', { name: /cancel booking/i }))
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/admin/bookings/7/cancel/')
    })
  })
})
