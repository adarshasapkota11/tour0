import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PaymentDetail from './PaymentDetail.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), patch: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const payment = {
  id: 3,
  booking_id: 7,
  activity_name: 'Paragliding',
  user_email: 'ram@example.com',
  gateway: 'esewa',
  amount: 15000,
  status: 'success',
  transaction_uuid: 'txn-uuid-123',
  transaction_id: 'esewa-id-456',
  created_at: '2026-08-01T12:00:00Z',
}

function renderDetail() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/admin/payments/3']}>
        <Routes>
          <Route path="/admin/payments/:id" element={<PaymentDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PaymentDetail', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.patch.mockReset()
    mocks.get.mockResolvedValue({ data: payment })
    mocks.patch.mockResolvedValue({ data: { ...payment, status: 'failed' } })
  })

  it('renders payment details', async () => {
    renderDetail()
    expect(await screen.findByText('Payment #3')).toBeInTheDocument()
    expect(screen.getByText('Paragliding')).toBeInTheDocument()
    expect(screen.getByText('ram@example.com')).toBeInTheDocument()
    expect(screen.getByText('esewa')).toBeInTheDocument()
    expect(screen.getByText('txn-uuid-123')).toBeInTheDocument()
  })

  it('shows status override select', async () => {
    renderDetail()
    await screen.findByText('Payment #3')
    expect(screen.getByLabelText(/override payment status/i)).toBeInTheDocument()
  })

  it('updates payment status', async () => {
    renderDetail()
    await screen.findByText('Payment #3')
    const select = screen.getByLabelText(/override payment status/i)
    select.value = 'failed'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    await waitFor(() => {
      expect(mocks.patch).toHaveBeenCalledWith('/admin/payments/3/', { status: 'failed' })
    })
  })
})
