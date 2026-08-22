import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MyBookings from './MyBookings.jsx'

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

function renderMyBookings(results) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mocks.get.mockResolvedValue({ data: { results } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyBookings', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.patch.mockReset()
    mocks.delete.mockReset()
  })

  it('shows both visit-package and activity bookings', async () => {
    renderMyBookings([
      {
        id: 1,
        item_type: 'visit_package',
        visit_package_name: 'Pokhara Getaway',
        activity_name: 'Pokhara Getaway',
        destination_name: 'Pokhara',
        package_days: 3,
        travel_date: '2026-09-01',
        travelers: 2,
        total_price: '57000.00',
        status: 'confirmed',
      },
      {
        id: 2,
        item_type: 'activity',
        visit_package_name: null,
        activity_name: 'Tandem Paragliding',
        destination_name: 'Pokhara',
        package_days: null,
        travel_date: '2026-09-02',
        travelers: 1,
        total_price: '6000.00',
        status: 'pending',
      },
    ])

    expect(await screen.findByText('Pokhara Getaway')).toBeInTheDocument()
    expect(screen.getByText('Tandem Paragliding')).toBeInTheDocument()
    expect(screen.getByText(/3 days/)).toBeInTheDocument()
    expect(screen.getByText('Rs 57,000')).toBeInTheDocument()
  })
})
