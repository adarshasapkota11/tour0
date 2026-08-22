import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Destinations from './Destinations.jsx'

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

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Destinations />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Destinations', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({
      data: {
        count: 2,
        results: [
          { id: 1, name: 'Pokhara', slug: 'pokhara', province: 'Gandaki', activity_count: 3 },
          { id: 2, name: 'Mustang', slug: 'mustang', province: 'Karnali', activity_count: 0 },
        ],
      },
    })
  })

  it('renders destinations on the grid', async () => {
    renderPage()
    expect(await screen.findByText('Pokhara')).toBeInTheDocument()
    expect(screen.getByText('Mustang')).toBeInTheDocument()
    expect(mocks.get).toHaveBeenCalledWith('/destinations/?page=1&page_size=12')
  })

  it('searches when a term is submitted', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Pokhara')

    await user.type(screen.getByLabelText('Search destinations'), 'koshi')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledWith('/destinations/?search=koshi&page=1&page_size=12')
    })
  })

  it('shows the results line while a search is active', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Pokhara')

    await user.type(screen.getByLabelText('Search destinations'), 'koshi')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('"koshi"')).toBeInTheDocument()
  })
})
