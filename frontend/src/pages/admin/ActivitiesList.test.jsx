import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ActivitiesList from './ActivitiesList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const activities = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Paragliding',
      destination_name: 'Pokhara',
      category_name: 'Adventure',
      price: 15000,
      difficulty: 'moderate',
      is_featured: true,
    },
    {
      id: 2,
      name: 'Mountain Biking',
      destination_name: 'Kathmandu',
      category_name: 'Sports',
      price: 8000,
      difficulty: 'easy',
      is_featured: false,
    },
  ],
}

function renderList() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ActivitiesList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ActivitiesList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: activities })
  })

  it('renders activities in a table', async () => {
    renderList()
    expect(await screen.findByText('Paragliding')).toBeInTheDocument()
    expect(screen.getByText('Mountain Biking')).toBeInTheDocument()
    expect(screen.getByText('Pokhara')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
    expect(screen.getAllByText('Edit').length).toBe(2)
  })

  it('shows loading state', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.getByText(/loading activities/i)).toBeInTheDocument()
  })

  it('shows empty state when no activities', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    renderList()
    expect(await screen.findByText('No activities found.')).toBeInTheDocument()
  })
})
