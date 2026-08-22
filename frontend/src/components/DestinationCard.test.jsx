import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import DestinationCard from './DestinationCard.jsx'

vi.mock('../api/client', () => ({
  client: { get: vi.fn(), post: vi.fn() },
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const destination = {
  id: 1,
  name: 'Pokhara',
  slug: 'pokhara',
  province: 'Gandaki',
  activity_count: 5,
  is_featured: true,
  images: [],
}

function renderCard(dest = destination) {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <DestinationCard destination={dest} />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('DestinationCard', () => {
  it('renders the destination name', () => {
    renderCard()
    expect(screen.getByText('Pokhara')).toBeInTheDocument()
  })

  it('renders province and activity count', () => {
    renderCard()
    expect(screen.getByText(/Gandaki/)).toBeInTheDocument()
  })

  it('renders the featured badge when is_featured is true', () => {
    renderCard()
    expect(screen.getByText(/featured/i)).toBeInTheDocument()
  })

  it('does not render featured badge when is_featured is false', () => {
    renderCard({ ...destination, is_featured: false })
    expect(screen.queryByText(/featured/i)).not.toBeInTheDocument()
  })

  it('links to the destination detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/destinations/pokhara')
  })
})
