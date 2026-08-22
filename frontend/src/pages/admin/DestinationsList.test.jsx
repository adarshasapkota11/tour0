import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DestinationsList from './DestinationsList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DestinationsList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DestinationsList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.delete.mockReset()
    mocks.get.mockResolvedValue({
      data: {
        count: 2,
        results: [
          { id: 1, name: 'Pokhara', province: 'Gandaki', activity_count: 3, is_featured: true },
          { id: 2, name: 'Mustang', province: 'Karnali', activity_count: 0, is_featured: false },
        ],
      },
    })
  })

  it('renders destinations in a table', async () => {
    renderList()
    expect(await screen.findByText('Pokhara')).toBeInTheDocument()
    expect(screen.getByText('Mustang')).toBeInTheDocument()
    expect(screen.getByText('Karnali')).toBeInTheDocument()
    expect(screen.getAllByText('Edit').length).toBe(2)
  })

  it('deletes a destination after confirmation', async () => {
    mocks.delete.mockResolvedValue({ data: null })
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Pokhara')
    await user.click(screen.getAllByText('Delete')[0])
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mocks.delete).toHaveBeenCalledWith('/admin/destinations/1/')
    })
  })
})
