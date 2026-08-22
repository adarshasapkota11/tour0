import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import PaymentReturn from './PaymentReturn.jsx'

const { mocks, mockVerifyMutate } = vi.hoisted(() => ({
  mocks: { post: vi.fn() },
  mockVerifyMutate: vi.fn(),
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('../api/hooks', () => ({
  useVerifyPayment: () => ({
    mutate: mockVerifyMutate,
  }),
}))

function renderPaymentReturn(search = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/payment/return/42${search}`]}>
          <Routes>
            <Route path="/payment/return/:bookingId" element={<PaymentReturn />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('PaymentReturn', () => {
  beforeEach(() => {
    mocks.post.mockReset()
    mockVerifyMutate.mockReset()
  })

  it('shows verifying state when refId is present', () => {
    renderPaymentReturn('?refId=abc123')
    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })

  it('shows failed state when status=failed', () => {
    renderPaymentReturn('?status=failed')
    expect(screen.getByText(/Payment failed/i)).toBeInTheDocument()
  })

  it('shows failed state when no refId or pidx', () => {
    renderPaymentReturn('')
    expect(screen.getByText(/Payment failed/i)).toBeInTheDocument()
  })

  it('shows success after successful verification', () => {
    mockVerifyMutate.mockImplementation((_payload, { onSuccess }) => {
      onSuccess?.({ status: 'confirmed' })
    })
    renderPaymentReturn('?refId=abc123')
    expect(screen.getByText(/successful/i)).toBeInTheDocument()
  })

  it('shows error on verification failure', () => {
    mockVerifyMutate.mockImplementation((_payload, { onError }) => {
      onError?.(new Error('Verification failed'))
    })
    renderPaymentReturn('?refId=abc123')
    expect(screen.getByText(/couldn't verify/i)).toBeInTheDocument()
  })

  it('links to confirmation page and activities page', () => {
    renderPaymentReturn('?status=failed')
    expect(screen.getByRole('link', { name: /view booking/i })).toHaveAttribute(
      'href',
      '/confirmation/42',
    )
    expect(screen.getByRole('link', { name: /back to activities/i })).toHaveAttribute(
      'href',
      '/activities',
    )
  })
})
