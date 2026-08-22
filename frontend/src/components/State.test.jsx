import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import { EmptyState, ErrorState, Loading } from './State.jsx'

vi.mock('../api/client', () => ({
  client: { get: vi.fn(), post: vi.fn() },
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

function withI18n(ui) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('Loading', () => {
  it('renders with default text', () => {
    withI18n(<Loading />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    withI18n(<Loading label="Please wait…" />)
    expect(screen.getByText('Please wait…')).toBeInTheDocument()
  })

  it('renders a spinner SVG', () => {
    withI18n(<Loading />)
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('renders default error message', () => {
    withI18n(<ErrorState />)
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    withI18n(<ErrorState message="Something broke" />)
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })

  it('renders error emoji', () => {
    withI18n(<ErrorState />)
    expect(screen.getByText('😕')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders the provided message', () => {
    withI18n(<EmptyState message="No results found" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders the map emoji', () => {
    withI18n(<EmptyState message="Empty" />)
    expect(screen.getByText('🗺️')).toBeInTheDocument()
  })
})
