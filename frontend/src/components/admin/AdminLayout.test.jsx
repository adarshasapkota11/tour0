import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../../i18n/index.jsx'
import AdminLayout from './AdminLayout.jsx'

const { mocks, mockUseAuth } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn() },
  mockUseAuth: vi.fn(),
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('../../context/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: (...args) => mockUseAuth(...args),
}))

vi.mock('../../api/adminHooks', () => ({
  useAdminInquiries: () => ({ data: { count: 0 } }),
}))

vi.mock('../../context/ThemeContext.jsx', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../NotificationBell.jsx', () => ({
  default: () => <div data-testid="notification-bell" />,
}))

vi.mock('../Logo.jsx', () => ({
  default: () => <span data-testid="logo">Logo</span>,
  LogoMark: () => <span data-testid="logo-mark" />,
}))

function renderAdminLayout() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<div data-testid="admin-content">Admin Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('AdminLayout', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.post.mockReset()
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', full_name: 'Admin', phone: '', is_staff: true },
      logout: vi.fn(),
    })
  })

  it('renders the sidebar with nav links', () => {
    renderAdminLayout()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.getByText('Payments')).toBeInTheDocument()
  })

  it('renders the admin heading', () => {
    renderAdminLayout()
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument()
  })

  it('renders the outlet content', () => {
    renderAdminLayout()
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })

  it('renders the user name in the sidebar', () => {
    renderAdminLayout()
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Admin', { selector: 'p.text-sm' })).toBeInTheDocument()
  })

  it('has a view site link', () => {
    renderAdminLayout()
    expect(screen.getByText(/view site/i)).toHaveAttribute('href', '/')
  })

  it('has a logout button', () => {
    renderAdminLayout()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders the logo', () => {
    renderAdminLayout()
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })
})
