import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import Book from './Book.jsx'

const { mocks, mockUseActivity, mockUseCreateBooking, mockUseInitiatePayment, mockUseVerifyPayment } = vi.hoisted(() => ({
  mocks: { post: vi.fn() },
  mockUseActivity: vi.fn(),
  mockUseCreateBooking: vi.fn(),
  mockUseInitiatePayment: vi.fn(),
  mockUseVerifyPayment: vi.fn(),
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('../api/hooks', () => ({
  useActivity: (...args) => mockUseActivity(...args),
  useCreateBooking: (...args) => mockUseCreateBooking(...args),
  useInitiatePayment: (...args) => mockUseInitiatePayment(...args),
  useVerifyPayment: (...args) => mockUseVerifyPayment(...args),
}))

const activity = {
  id: 10,
  name: 'Paragliding',
  slug: 'paragliding',
  price: 80,
  duration: '30 min',
  difficulty: 'easy',
  destination_name: 'Pokhara',
  destination_slug: 'pokhara',
  category_name: 'Adventure',
  description: 'Fly over the valley.',
  capacity: 2,
  images: [],
}

function renderBook(slug = 'paragliding') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/book/${slug}`]}>
          <Routes>
            <Route path="/book/:slug" element={<Book />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('Book', () => {
  beforeEach(() => {
    mockUseActivity.mockReset()
    mockUseCreateBooking.mockReset()
    mockUseInitiatePayment.mockReset()
    mockUseVerifyPayment.mockReset()
    mocks.post.mockReset()
  })

  it('shows loading while fetching activity', () => {
    mockUseActivity.mockReturnValue({ data: undefined, isLoading: true })
    renderBook()
    expect(screen.getByText('Preparing booking…')).toBeInTheDocument()
  })

  it('renders the booking form with activity details', () => {
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false })
    mockUseCreateBooking.mockReturnValue({ mutateAsync: vi.fn() })
    mockUseInitiatePayment.mockReturnValue({ mutateAsync: vi.fn() })
    mockUseVerifyPayment.mockReturnValue({ mutateAsync: vi.fn() })
    renderBook()
    expect(screen.getByRole('heading', { name: 'Paragliding' })).toBeInTheDocument()
    expect(screen.getByText('Pokhara · 30 min')).toBeInTheDocument()
  })

  it('shows not found when activity does not exist', () => {
    mockUseActivity.mockReturnValue({ data: null, isLoading: false })
    renderBook('nonexistent')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('creates a booking on form submit', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 100 })
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false })
    mockUseCreateBooking.mockReturnValue({ mutateAsync: mockMutateAsync })
    mockUseInitiatePayment.mockReturnValue({ mutateAsync: vi.fn() })
    mockUseVerifyPayment.mockReturnValue({ mutateAsync: vi.fn() })

    renderBook()

    const form = document.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ activity: 10 }))
    })
  })

  it('displays an error message on booking failure', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue({
      response: { data: { detail: 'Not enough capacity' } },
    })
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false })
    mockUseCreateBooking.mockReturnValue({ mutateAsync: mockMutateAsync })
    mockUseInitiatePayment.mockReturnValue({ mutateAsync: vi.fn() })
    mockUseVerifyPayment.mockReturnValue({ mutateAsync: vi.fn() })

    renderBook()

    const form = document.querySelector('form')
    fireEvent.submit(form)

    expect(await screen.findByText('Not enough capacity')).toBeInTheDocument()
  })
})
