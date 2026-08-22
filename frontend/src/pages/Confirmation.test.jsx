import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Confirmation from './Confirmation.jsx'

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

function renderConfirmation(booking) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mocks.get.mockResolvedValue({ data: booking })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/confirmation/9']}>
        <Routes>
          <Route path="/confirmation/:bookingId" element={<Confirmation />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Confirmation', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.delete.mockReset()
  })

  it('renders a confirmed visit-package booking with days', async () => {
    renderConfirmation({
      id: 9,
      item_type: 'visit_package',
      visit_package_name: 'Pokhara Getaway',
      activity_name: 'Pokhara Getaway',
      destination_name: 'Pokhara',
      package_days: 3,
      travel_date: '2026-09-01',
      travelers: 2,
      total_price: '57000.00',
      status: 'confirmed',
    })

    expect(await screen.findByText('Booking confirmed!')).toBeInTheDocument()
    expect(screen.getByText('Booked item')).toBeInTheDocument()
    expect(screen.getByText('Pokhara Getaway')).toBeInTheDocument()
    expect(screen.getByText('3 days')).toBeInTheDocument()
    expect(screen.getByText('Rs 57,000')).toBeInTheDocument()
  })

  it('renders an activity booking without the days row', async () => {
    renderConfirmation({
      id: 10,
      item_type: 'activity',
      visit_package_name: null,
      activity_name: 'Tandem Paragliding',
      destination_name: 'Pokhara',
      package_days: null,
      travel_date: '2026-09-01',
      travelers: 1,
      total_price: '6000.00',
      status: 'confirmed',
    })

    expect(await screen.findByText('Booking confirmed!')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.queryByText('Days')).not.toBeInTheDocument()
  })
})
