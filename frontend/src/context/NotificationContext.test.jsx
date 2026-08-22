import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from './AuthContext.jsx'
import { NotificationProvider, useNotifications } from './NotificationContext.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), toast: vi.fn() },
}))

function TestConsumer() {
  const { notifications, unreadCount, isLoading, connected, markRead, markAllRead } = useNotifications()
  return (
    <div>
      <span data-testid="count">{notifications.length}</span>
      <span data-testid="unread">{unreadCount}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="connected">{String(connected)}</span>
      <button onClick={() => markRead(1)}>Mark Read</button>
      <button onClick={() => markAllRead()}>Mark All</button>
    </div>
  )
}

function renderNotification(authed = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (authed) localStorage.setItem('test_access', 'token')
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('NotificationContext', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { results: [], unread_count: 0 } })
  })

  it('provides notifications and unread count', async () => {
    mocks.get.mockResolvedValue({
      data: {
        results: [{ id: 1, text: 'Hi', is_read: false, created_at: new Date().toISOString() }],
        unread_count: 1,
      },
    })
    renderNotification(true)
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
    })
    expect(screen.getByTestId('unread').textContent).toBe('1')
  })

  it('starts with zero notifications when unauthenticated', () => {
    renderNotification(false)
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('unread').textContent).toBe('0')
  })

  it('markRead calls the API', async () => {
    mocks.get.mockResolvedValue({
      data: {
        results: [{ id: 1, text: 'Hi', is_read: false, created_at: new Date().toISOString() }],
        unread_count: 1,
      },
    })
    mocks.post.mockResolvedValue({ data: {} })
    renderNotification(true)
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
    })
    act(() => {
      screen.getByText('Mark Read').click()
    })
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/notifications/1/read/')
    })
  })

  it('markAllRead calls the API', async () => {
    mocks.get.mockResolvedValue({
      data: {
        results: [{ id: 1, text: 'Hi', is_read: false, created_at: new Date().toISOString() }],
        unread_count: 1,
      },
    })
    mocks.post.mockResolvedValue({ data: {} })
    renderNotification(true)
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
    })
    act(() => {
      screen.getByText('Mark All').click()
    })
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/notifications/read-all/')
    })
  })
})
