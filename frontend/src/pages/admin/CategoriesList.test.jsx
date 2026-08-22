import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CategoriesList from './CategoriesList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const categories = {
  count: 2,
  results: [
    { id: 1, name: 'Adventure', icon: '\u{1f3d4}\u{fe0f}', activity_count: 5 },
    { id: 2, name: 'Cultural', icon: '\u{1f3db}\u{fe0f}', activity_count: 3 },
  ],
}

function renderList() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CategoriesList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CategoriesList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: categories })
  })

  it('renders categories in a table', async () => {
    renderList()
    expect(await screen.findByText('Adventure')).toBeInTheDocument()
    expect(screen.getByText('Cultural')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getAllByText('Edit').length).toBe(2)
  })

  it('shows empty state when no categories', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    renderList()
    expect(await screen.findByText('No categories found.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })
})
