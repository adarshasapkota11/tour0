import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import InquiryWidget from './InquiryWidget.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
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

function renderWidget() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InquiryWidget />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('InquiryWidget', () => {
  it('renders a toggle button that starts closed', () => {
    mocks.get.mockResolvedValue({ data: { results: [] } })
    renderWidget()
    const toggle = screen.getByRole('button', { name: 'Chat with us' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a dialog and closes with Escape, restoring focus', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } })
    const user = userEvent.setup()
    renderWidget()

    const toggle = screen.getByRole('button', { name: 'Chat with us' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'inquiry-panel-title')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })

  it('has an accessible close button in the dialog header', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } })
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByRole('button', { name: 'Chat with us' }))
    const close = screen.getByRole('button', { name: 'Close chat' })
    await user.click(close)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
