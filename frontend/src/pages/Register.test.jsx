import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import Register from './Register.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderRegister() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/register']}>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Register', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
  })

  it('renders the registration form with all fields', () => {
    renderRegister()
    expect(screen.getByPlaceholderText('Ram Bahadur')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Min 8 characters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows password mismatch error', async () => {
    mocks.post.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Ram Bahadur'), 'Ram')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'ram@example.com')
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'differentpass')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('calls register and login APIs on valid submit', async () => {
    mocks.post
      .mockResolvedValueOnce({ data: {} }) // register
      .mockResolvedValueOnce({ data: { access: 'a', refresh: 'r' } }) // login
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })

    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Ram Bahadur'), 'Ram')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'ram@example.com')
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/auth/register/', expect.objectContaining({ email: 'ram@example.com' }))
    })
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/auth/login/', { email: 'ram@example.com', password: 'password123' })
    })
  })

  it('displays API error on failed registration', async () => {
    mocks.post.mockRejectedValue({
      response: { data: { email: ['Email already exists'] } },
    })

    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Ram Bahadur'), 'Ram')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'ram@example.com')
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText('Email already exists')).toBeInTheDocument()
  })

  it('links to login page', () => {
    renderRegister()
    const loginLink = screen.getByRole('link', { name: /log in/i })
    expect(loginLink).toHaveAttribute('href', '/login?next=%2F')
  })
})
