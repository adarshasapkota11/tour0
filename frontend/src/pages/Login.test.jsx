import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import Login from './Login.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login?next=/book/tandem-paragliding']}>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
  })

  it('calls the login API and stores the token', async () => {
    mocks.post.mockResolvedValue({ data: { access: 'access-token', refresh: 'refresh-token' } })

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'ram@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/auth/login/', {
        email: 'ram@example.com',
        password: 'password123',
      })
    })
    await waitFor(() => {
      expect(localStorage.getItem('test_access')).toBe('access-token')
    })
  })

  it('shows an error message on invalid credentials', async () => {
    mocks.post.mockRejectedValue({
      response: { data: { detail: 'No active account found with the given credentials' } },
    })

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'ram@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(
      await screen.findByText('No active account found with the given credentials'),
    ).toBeInTheDocument()
  })
})
