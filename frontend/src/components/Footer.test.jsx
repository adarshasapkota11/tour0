import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Footer from './Footer.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { I18nProvider } from '../i18n/index.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderFooter() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <Footer />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('Footer', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
  })

  it('renders quick links and the privacy link', () => {
    renderFooter()
    expect(screen.getByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByText('My Bookings')).toBeInTheDocument()
    expect(screen.getAllByText('Privacy policy').length).toBeGreaterThan(0)
  })

  it('links to the partner site and shows the phone number', () => {
    renderFooter()
    const partner = screen.getByRole('link', { name: 'aPrayogshala.com.np' })
    expect(partner).toHaveAttribute('href', 'https://aPrayogshala.com.np')
    expect(
      screen.getByRole('link', { name: 'Call TourNepal at +977 9848666317' }),
    ).toHaveAttribute('href', 'tel:+9779848666317')
  })

  it('renders the chat widget', () => {
    renderFooter()
    expect(screen.getByRole('button', { name: 'Chat with us' })).toBeInTheDocument()
  })
})
