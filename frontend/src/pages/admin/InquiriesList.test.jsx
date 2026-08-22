import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import InquiriesList from './InquiriesList.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const inquiry = {
  id: 7,
  subject: 'Best time to trek Annapurna',
  status: 'open',
  user_email: 'customer@example.com',
  user_full_name: '',
  message_count: 2,
  last_message: 'When should I go?',
  created_at: '2026-08-01T10:00:00Z',
}

function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InquiriesList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('InquiriesList', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { count: 1, results: [inquiry] } })
  })

  it('renders the list of inquiries', async () => {
    renderList()
    expect(await screen.findByText('Best time to trek Annapurna')).toBeInTheDocument()
    expect(screen.getByText(/customer@example.com/)).toBeInTheDocument()
    expect(screen.getByText('open', { selector: 'span' })).toBeInTheDocument()
  })

  it('resolves an open inquiry from the thread header', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.startsWith('/admin/inquiries/7/')) {
        return Promise.resolve({
          data: {
            id: 7,
            subject: 'Best time to trek Annapurna',
            status: 'open',
            user_email: 'customer@example.com',
            created_at: '2026-08-01T10:00:00Z',
            messages: [
              { id: 1, is_from_staff: false, body: 'When should I go?', sender_email: 'customer@example.com' },
            ],
          },
        })
      }
      return Promise.resolve({ data: { count: 1, results: [inquiry] } })
    })
    mocks.post.mockResolvedValue({ data: { ...inquiry, status: 'resolved' } })

    const user = userEvent.setup()
    renderList()
    await user.click(await screen.findByText('Best time to trek Annapurna'))

    const resolveButton = await screen.findByRole('button', { name: 'Resolve' })
    await user.click(resolveButton)

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/admin/inquiries/7/resolve/')
    })
  })
})
