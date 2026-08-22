import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Navbar from './Navbar.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { ThemeProvider } from '../context/ThemeContext.jsx'
import { I18nProvider } from '../i18n/index.jsx'

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

function renderNav() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider>
              <Navbar />
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Navbar theme and language toggles', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.lang = 'en'
    mocks.get.mockReset()
    mocks.post.mockReset()
    mocks.get.mockResolvedValue({ data: { id: 1, email: 'ram@example.com', full_name: 'Ram', phone: '' } })
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.lang = 'en'
  })

  it('toggles dark mode and persists the preference', async () => {
    const user = userEvent.setup()
    renderNav()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('nt_theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('switches between English and Nepali labels', async () => {
    const user = userEvent.setup()
    renderNav()

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch language' }).textContent).toContain('नेपाली')

    await user.click(screen.getByRole('button', { name: 'Switch language' }))
    expect(screen.getByText('गृहपृष्ठ')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('ne')
    expect(localStorage.getItem('nt_lang')).toBe('ne')
    expect(screen.getByRole('button', { name: 'भाषा बदल्नुहोस्' }).textContent).toContain('EN')
  })
})
