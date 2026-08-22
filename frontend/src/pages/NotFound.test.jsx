import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import NotFound from './NotFound.jsx'

vi.mock('../api/client', () => ({
  client: { get: vi.fn(), post: vi.fn() },
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function renderNotFound() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('NotFound', () => {
  it('renders the 404 heading', () => {
    renderNotFound()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found')
  })

  it('renders a descriptive message', () => {
    renderNotFound()
    expect(screen.getByText(/page you're looking for/i)).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    renderNotFound()
    const link = screen.getByRole('link', { name: /back home/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders a compass emoji', () => {
    renderNotFound()
    expect(screen.getByText('🧭')).toBeInTheDocument()
  })
})
