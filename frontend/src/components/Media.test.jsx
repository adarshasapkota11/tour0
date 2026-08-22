import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ActivityCard from './ActivityCard'
import Media from './Media'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Media', () => {
  it('renders an image when src is provided', () => {
    render(<Media src="/media/photo.jpg" alt="Pokhara" label="Pokhara" className="h-10" />)
    const img = screen.getByAltText('Pokhara')
    expect(img).toHaveAttribute('src', '/media/photo.jpg')
  })

  it('renders a placeholder with initial when no src', () => {
    render(<Media src={null} label="Pokhara" className="h-10" />)
    expect(screen.getByText('P')).toBeInTheDocument()
  })
})

describe('ActivityCard', () => {
  const activity = {
    id: 1,
    slug: 'tandem-paragliding',
    name: 'Tandem Paragliding',
    price: '7500.00',
    duration: '45 minutes',
    difficulty: 'moderate',
    category_name: 'Adventure',
    destination_name: 'Pokhara',
  }

  it('shows name, price, destination and tags', () => {
    renderWithRouter(<ActivityCard activity={activity} />)
    expect(screen.getByText('Tandem Paragliding')).toBeInTheDocument()
    expect(screen.getByText('Rs 7,500')).toBeInTheDocument()
    expect(screen.getByText('Pokhara · 45 minutes')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
    expect(screen.getByText('moderate')).toBeInTheDocument()
  })
})
