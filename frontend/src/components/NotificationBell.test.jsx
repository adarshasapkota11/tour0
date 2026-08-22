import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import { I18nProvider } from '../i18n/index.jsx'
import { NotificationProvider } from '../context/NotificationContext.jsx'
import NotificationBell from './NotificationBell.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderBell(authed = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (authed) localStorage.setItem('test_access', 'token')
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter>
          <AuthProvider>
            <NotificationProvider>
              <NotificationBell />
            </NotificationProvider>
          </AuthProvider>
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

describe('NotificationBell', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockImplementation((url) => {
      if (url.includes('/notifications/')) {
        return Promise.resolve({ data: { results: [], unread_count: 0 } })
      }
      return Promise.resolve({ data: { id: 1, email: 'test@example.com', full_name: 'Test', phone: '' } })
    })
  })

  it('renders the bell button', () => {
    renderBell()
    expect(screen.getByRole('button', { name: /notification/i })).toBeInTheDocument()
  })

  it('opens the dropdown on click', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: /notification/i }))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows empty state when no notifications', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: /notification/i }))
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument()
  })

  it('shows notifications in the dropdown when authenticated', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/notifications/')) {
        return Promise.resolve({
          data: {
            results: [{ id: 1, text: 'Booking confirmed!', is_read: false, created_at: new Date().toISOString() }],
            unread_count: 1,
          },
        })
      }
      return Promise.resolve({ data: { id: 1, email: 'test@example.com', full_name: 'Test', phone: '' } })
    })
    const user = userEvent.setup()
    renderBell(true)
    await user.click(screen.getByRole('button', { name: /notification/i }))
    expect(await screen.findByText('Booking confirmed!')).toBeInTheDocument()
  })

  it('displays unread count badge when authenticated', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/notifications/')) {
        return Promise.resolve({ data: { results: [], unread_count: 3 } })
      }
      return Promise.resolve({ data: { id: 1, email: 'test@example.com', full_name: 'Test', phone: '' } })
    })
    renderBell(true)
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('shows mark all read button when unread', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/notifications/')) {
        return Promise.resolve({
          data: {
            results: [{ id: 1, text: 'Hi', is_read: false, created_at: new Date().toISOString() }],
            unread_count: 1,
          },
        })
      }
      return Promise.resolve({ data: { id: 1, email: 'test@example.com', full_name: 'Test', phone: '' } })
    })
    const user = userEvent.setup()
    renderBell(true)
    await user.click(screen.getByRole('button', { name: /notification/i }))
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument()
  })

  it('closes on escape key', async () => {
    const user = userEvent.setup()
    renderBell()
    await user.click(screen.getByRole('button', { name: /notification/i }))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText(/no notifications yet/i)).not.toBeInTheDocument()
    })
  })
})
