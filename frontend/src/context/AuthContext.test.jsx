import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, useAuth } from './AuthContext.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function TestConsumer() {
  const { user, loading, isAuthenticated, login, logout, register } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => register({ email: 'x@y.com', password: 'pass' })}>Register</button>
    </div>
  )
}

function renderAuth() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
  })

  it('starts with no user when no token', async () => {
    renderAuth()
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('fetches user on mount when token exists', async () => {
    localStorage.setItem('test_access', 'token')
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
    renderAuth()
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })
    expect(screen.getByTestId('user').textContent).toBe('ram@example.com')
  })

  it('login stores tokens and fetches user', async () => {
    mocks.post.mockResolvedValue({ data: { access: 'access-123', refresh: 'refresh-123' } })
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })

    renderAuth()
    await screen.findByText('Login')
    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(localStorage.getItem('test_access')).toBe('access-123')
      expect(localStorage.getItem('test_refresh')).toBe('refresh-123')
    })
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('ram@example.com')
    })
  })

  it('logout clears tokens and user', async () => {
    localStorage.setItem('test_access', 'token')
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
    renderAuth()
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    act(() => {
      screen.getByText('Logout').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
      expect(localStorage.getItem('test_access')).toBeNull()
    })
  })

  it('register calls the register endpoint', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    renderAuth()
    await screen.findByText('Register')
    await act(async () => {
      screen.getByText('Register').click()
    })
    expect(mocks.post).toHaveBeenCalledWith('/auth/register/', { email: 'x@y.com', password: 'pass' })
  })
})
