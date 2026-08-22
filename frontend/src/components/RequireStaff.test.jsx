import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import RequireStaff from './RequireStaff.jsx'

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

function LoginProbe() {
  const { search } = useLocation()
  return <div>Login page {search}</div>
}

function renderAt(path) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin"
              element={
                <RequireStaff>
                  <div>Admin panel</div>
                </RequireStaff>
              }
            />
            <Route path="/login" element={<LoginProbe />} />
            <Route path="/" element={<div>Home page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RequireStaff', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'x@example.com', is_staff: false } })
  })

  it('redirects guests to login with the admin path preserved', async () => {
    renderAt('/admin')
    expect(await screen.findByText('Login page ?next=%2Fadmin')).toBeInTheDocument()
  })

  it('redirects non-staff users back home', async () => {
    localStorage.setItem('test_access', 'token')
    renderAt('/admin')
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('renders the admin content for staff users', async () => {
    mocks.get.mockResolvedValue({
      data: { id: 4, email: 'content@example.com', is_staff: true },
    })
    localStorage.setItem('test_access', 'token')
    renderAt('/admin')
    expect(await screen.findByText('Admin panel')).toBeInTheDocument()
  })
})
