import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import VisitPackagesList from './VisitPackagesList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const packages = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Everest Trek',
      destination_name: 'Pokhara',
      days: 14,
      price: 120000,
      capacity: 10,
      is_active: true,
    },
    {
      id: 2,
      name: 'Lumbini Tour',
      destination_name: 'Lumbini',
      days: 3,
      price: 25000,
      capacity: 20,
      is_active: false,
    },
  ],
}

function renderList() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <VisitPackagesList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VisitPackagesList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: packages })
  })

  it('renders visit packages in a table', async () => {
    renderList()
    expect(await screen.findByText('Everest Trek')).toBeInTheDocument()
    expect(screen.getByText('Lumbini Tour')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getAllByText('Edit').length).toBe(2)
  })

  it('shows empty state when no packages', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    renderList()
    expect(await screen.findByText('No visit packages found.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.getByText(/loading visit packages/i)).toBeInTheDocument()
  })
})
