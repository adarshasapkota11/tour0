import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PaymentsList from './PaymentsList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const payments = {
  count: 2,
  results: [
    {
      id: 1,
      activity_name: 'Paragliding',
      user_email: 'ram@example.com',
      gateway: 'esewa',
      amount: 15000,
      status: 'success',
    },
    {
      id: 2,
      activity_name: 'Trekking',
      user_email: 'hari@example.com',
      gateway: 'khalti',
      amount: 50000,
      status: 'pending',
    },
  ],
}

function renderList() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PaymentsList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PaymentsList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: payments })
  })

  it('renders payments in a table', async () => {
    renderList()
    expect(await screen.findByText('Paragliding')).toBeInTheDocument()
    expect(screen.getByText('Trekking')).toBeInTheDocument()
    expect(screen.getByText('ram@example.com')).toBeInTheDocument()
    expect(screen.getByText('hari@example.com')).toBeInTheDocument()
    expect(screen.getAllByText('View').length).toBe(2)
  })

  it('shows empty state when no payments', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    renderList()
    expect(await screen.findByText('No payments found.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.getByText(/loading payments/i)).toBeInTheDocument()
  })
})
