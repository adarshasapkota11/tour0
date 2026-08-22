import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Activities from './Activities.jsx'
import { I18nProvider } from '../i18n/index.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderActivities(initialPath = '/activities') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Activities />
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

const categories = {
  count: 2,
  results: [
    { id: 1, slug: 'trekking', name: 'Trekking', icon: '🏔️' },
    { id: 2, slug: 'cultural', name: 'Cultural', icon: '🛕' },
  ],
}

const activities = {
  count: 1,
  results: [
    {
      id: 10,
      name: 'Annapurna Circuit',
      slug: 'annapurna-circuit',
      price: 1200,
      duration: '10 days',
      difficulty: 'challenging',
      destination_name: 'Annapurna',
      category_name: 'Trekking',
    },
  ],
}

describe('Activities', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/categories/')) {
        return Promise.resolve({ data: categories })
      }
      return Promise.resolve({ data: activities })
    })
  })

  it('requests activities with category__slug when a category is selected', async () => {
    const user = userEvent.setup()
    renderActivities()

    await screen.findByText('Trekking')
    await user.click(screen.getByRole('button', { name: '🏔️ Trekking' }))

    await waitFor(() => {
      expect(
        mocks.get.mock.calls.some(([url]) => url.includes('category__slug=trekking')),
      ).toBe(true)
    })
  })

  it('renders matching activity cards', async () => {
    renderActivities()
    expect(await screen.findByText('Annapurna Circuit')).toBeInTheDocument()
    expect(screen.getByText('🏔️ Trekking')).toBeInTheDocument()
  })

  it('shows an empty state when no activities match', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/categories/')) {
        return Promise.resolve({ data: categories })
      }
      return Promise.resolve({ data: { count: 0, results: [] } })
    })
    renderActivities('/activities?category=trekking')
    expect(await screen.findByText('No activities match these filters.')).toBeInTheDocument()
  })
})
