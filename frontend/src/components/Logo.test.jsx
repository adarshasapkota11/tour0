import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Logo from './Logo.jsx'

vi.mock('../api/client', () => ({
  client: { get: vi.fn(), post: vi.fn() },
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

describe('Logo', () => {
  it('renders the TourNepal text by default', () => {
    render(<Logo />)
    expect(screen.getByText('Tour')).toBeInTheDocument()
    expect(screen.getByText('Nepal')).toBeInTheDocument()
  })

  it('renders the SVG mark', () => {
    render(<Logo />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('hides text when withText is false', () => {
    render(<Logo withText={false} />)
    expect(screen.queryByText('Tour')).not.toBeInTheDocument()
    expect(screen.queryByText('Nepal')).not.toBeInTheDocument()
  })
})
