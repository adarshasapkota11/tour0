import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Navbar from './Navbar.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { NotificationProvider } from '../context/NotificationContext.jsx'

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

function renderNav(authed = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (authed) localStorage.setItem('test_access', 'token')
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
  })

  it('shows main links for guests', () => {
    renderNav(false)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.queryByText('My Bookings')).not.toBeInTheDocument()
  })

  it('opens the mobile menu on small screens', async () => {
    const user = userEvent.setup()
    renderNav(true)

    await screen.findByText('Ram')
    expect(screen.getByText('My Bookings')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Toggle menu' }))

    expect(screen.getAllByText('My Bookings').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Logout').length).toBeGreaterThan(0)
  })

  it('shows the Admin link only for staff users', async () => {
    mocks.get.mockResolvedValue({
      data: { id: 1, email: 'content@example.com', full_name: 'Content', phone: '', is_staff: true },
    })
    renderNav(true)

    await screen.findByText('Content')
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('hides the Admin link for regular users', async () => {
    mocks.get.mockResolvedValue({
      data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '', is_staff: false },
    })
    renderNav(true)

    await screen.findByText('Ram')
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })
})
