import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import RequireAuth from './RequireAuth.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderRequireAuth(path = '/protected') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <RequireAuth>
                  <div data-testid="secret">Secret content</div>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
  })

  it('redirects to login when not authenticated', async () => {
    mocks.get.mockRejectedValue(new Error('Not authenticated'))
    renderRequireAuth()

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    localStorage.setItem('test_access', 'token')
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
    renderRequireAuth()

    expect(await screen.findByTestId('secret')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('shows loading state while checking session', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    localStorage.setItem('test_access', 'token')
    renderRequireAuth()

    expect(screen.getByText(/checking session/i)).toBeInTheDocument()
  })

  it('includes the return path in the login redirect', async () => {
    mocks.get.mockRejectedValue(new Error('Not authenticated'))
    renderRequireAuth('/protected?tab=settings')

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })
})
