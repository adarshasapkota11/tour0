import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Search from './Search.jsx'

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

const destinationsData = {
  count: 1,
  results: [{ id: 1, name: 'Pokhara', slug: 'pokhara', province: 'Gandaki', activity_count: 3 }],
}

const activitiesData = {
  count: 1,
  results: [
    {
      id: 2,
      name: 'Tandem Paragliding',
      slug: 'tandem-paragliding',
      destination_slug: 'pokhara',
      destination_name: 'Pokhara',
      category_slug: 'adventure',
      price: '7500.00',
      duration: '45 minutes',
      difficulty: 'moderate',
    },
  ],
}

function renderPage(initialEntry) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Search />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Search', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.includes('/destinations/')) return Promise.resolve({ data: destinationsData })
      return Promise.resolve({ data: activitiesData })
    })
  })

  it('searches both destinations and activities from the query param', async () => {
    renderPage('/search?q=koshi')
    expect(await screen.findByText('Pokhara')).toBeInTheDocument()
    expect(await screen.findByText('Tandem Paragliding')).toBeInTheDocument()
    expect(mocks.get).toHaveBeenCalledWith('/destinations/?search=koshi&page_size=100')
    expect(mocks.get).toHaveBeenCalledWith('/activities/?search=koshi&page_size=100')
  })

  it('shows section headings and view-all links', async () => {
    renderPage('/search?q=koshi')
    expect(await screen.findByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all destination matches/i })).toHaveAttribute(
      'href',
      '/destinations?q=koshi',
    )
    expect(screen.getByRole('link', { name: /view all activity matches/i })).toHaveAttribute(
      'href',
      '/activities?q=koshi',
    )
  })

  it('prompts for a search when no query is present', () => {
    renderPage('/search')
    expect(screen.getByText('Search Nepal')).toBeInTheDocument()
    expect(screen.queryByText('Tandem Paragliding')).not.toBeInTheDocument()
  })

  it('submits a new search from the input', async () => {
    const user = userEvent.setup()
    renderPage('/search')
    await user.type(screen.getByLabelText('Search'), 'pokhara')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledWith('/destinations/?search=pokhara&page_size=100')
    })
  })
})
