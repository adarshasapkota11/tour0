import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import { I18nProvider } from '../i18n/index.jsx'
import Layout from './Layout.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderLayout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<div data-testid="outlet-content">Page Content</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.get.mockReset()
  })

  it('renders the navbar', () => {
    renderLayout()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    renderLayout()
    expect(screen.getAllByText(/Privacy policy/).length).toBeGreaterThan(0)
  })

  it('renders the outlet content', () => {
    renderLayout()
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
  })

  it('renders the logo', () => {
    renderLayout()
    expect(screen.getAllByText('Tour').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Nepal').length).toBeGreaterThan(0)
  })
})
