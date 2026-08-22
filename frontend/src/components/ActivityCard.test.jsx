import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import ActivityCard from './ActivityCard.jsx'

vi.mock('../api/client', () => ({
  client: { get: vi.fn(), post: vi.fn() },
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

const activity = {
  id: 10,
  name: 'Annapurna Circuit',
  slug: 'annapurna-circuit',
  price: 1200,
  duration: '10 days',
  difficulty: 'challenging',
  destination_name: 'Annapurna',
  category_name: 'Trekking',
  images: [],
}

function renderCard(act = activity) {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <ActivityCard activity={act} />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('ActivityCard', () => {
  it('renders the activity name', () => {
    renderCard()
    expect(screen.getByText('Annapurna Circuit')).toBeInTheDocument()
  })

  it('renders the destination and duration', () => {
    renderCard()
    expect(screen.getByText('Annapurna · 10 days')).toBeInTheDocument()
  })

  it('renders the difficulty label', () => {
    renderCard()
    expect(screen.getByText(/challenging/i)).toBeInTheDocument()
  })

  it('renders the category name', () => {
    renderCard()
    expect(screen.getByText('Trekking')).toBeInTheDocument()
  })

  it('links to the activity detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/activities/annapurna-circuit')
  })
})
