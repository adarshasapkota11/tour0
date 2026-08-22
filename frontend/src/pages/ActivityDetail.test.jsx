import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import ActivityDetail from './ActivityDetail.jsx'

const { mocks, mockUseActivity } = vi.hoisted(() => ({
  mocks: { get: vi.fn() },
  mockUseActivity: vi.fn(),
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('../api/hooks', () => ({
  useActivity: (...args) => mockUseActivity(...args),
}))

const activity = {
  id: 1,
  name: 'Annapurna Circuit',
  slug: 'annapurna-circuit',
  price: 1200,
  duration: '10 days',
  difficulty: 'challenging',
  destination_name: 'Annapurna',
  destination_slug: 'annapurna',
  category_name: 'Trekking',
  description: 'A classic trek around the Annapurna massif.',
  capacity: 12,
  images: [],
}

function renderDetail(slug = 'annapurna-circuit') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/activities/${slug}`]}>
          <Routes>
            <Route path="/activities/:slug" element={<ActivityDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('ActivityDetail', () => {
  beforeEach(() => {
    mockUseActivity.mockReset()
  })

  it('shows a loading state initially', () => {
    mockUseActivity.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    renderDetail()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the activity details after loading', () => {
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false, isError: false })
    renderDetail()
    expect(screen.getByRole('heading', { name: 'Annapurna Circuit' })).toBeInTheDocument()
    expect(screen.getByText('A classic trek around the Annapurna massif.')).toBeInTheDocument()
    expect(screen.getByText('Trekking')).toBeInTheDocument()
  })

  it('shows a book now link pointing to the booking page', () => {
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false, isError: false })
    renderDetail()
    const link = screen.getByText(/Book now/i)
    expect(link).toHaveAttribute('href', '/book/annapurna-circuit')
  })

  it('renders the breadcrumb with destination link', () => {
    mockUseActivity.mockReturnValue({ data: activity, isLoading: false, isError: false })
    renderDetail()
    const destLink = screen.getByText('Annapurna')
    expect(destLink).toHaveAttribute('href', '/destinations/annapurna')
  })

  it('shows error state on API failure', () => {
    mockUseActivity.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    renderDetail('bad-slug')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
