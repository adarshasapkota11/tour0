import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import NepalMap from './NepalMap.jsx'
import { ThemeProvider } from '../context/ThemeContext.jsx'

vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
  },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ eventHandlers, children }) => (
    <div data-testid="marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </div>
  ),
  TileLayer: () => null,
  GeoJSON: ({ pathOptions }) => (
    <div data-testid="nepal-border" data-color={pathOptions.color}>
      boundary
    </div>
  ),
  useMap: () => ({ fitBounds: vi.fn() }),
}))

const destinations = [
  {
    id: 1,
    name: 'Pokhara',
    slug: 'pokhara',
    province: 'Gandaki',
    latitude: '28.2096',
    longitude: '83.9856',
    activity_count: 3,
    is_featured: true,
  },
  {
    id: 2,
    name: 'Mustang',
    slug: 'mustang',
    province: 'Karnali',
    latitude: '28.7804',
    longitude: '83.7230',
    activity_count: 0,
    is_featured: false,
  },
  {
    id: 3,
    name: 'No Coords',
    slug: 'no-coords',
    province: 'Bagmati',
    latitude: null,
    longitude: null,
    activity_count: 1,
    is_featured: false,
  },
]

function renderMap({ onSelect = vi.fn(), selectedSlug = '' } = {}) {
  return render(
    <MemoryRouter>
      <NepalMap destinations={destinations} onSelect={onSelect} selectedSlug={selectedSlug} />
    </MemoryRouter>,
  )
}

describe('NepalMap', () => {
  it('renders a marker only for destinations with coordinates', () => {
    renderMap()
    expect(screen.getAllByTestId('marker').length).toBe(2)
  })

  it('calls onSelect with the destination when a marker is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderMap({ onSelect })
    await user.click(screen.getAllByTestId('marker')[0])
    expect(onSelect).toHaveBeenCalledWith(destinations[0])
  })

  it('renders a reset view control', () => {
    renderMap()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('renders the Nepal boundary with a red outline and white halo', () => {
    renderMap()
    const borders = screen.getAllByTestId('nepal-border')
    expect(borders).toHaveLength(2)
    expect(borders.map((b) => b.getAttribute('data-color'))).toEqual(['#ffffff', '#16a34a'])
  })

  it('drops the white halo in dark mode', () => {
    localStorage.setItem('nt_theme', 'dark')
    render(
      <ThemeProvider>
        <MemoryRouter>
          <NepalMap destinations={destinations} onSelect={vi.fn()} selectedSlug="" />
        </MemoryRouter>
      </ThemeProvider>,
    )
    const borders = screen.getAllByTestId('nepal-border')
    expect(borders).toHaveLength(1)
    expect(borders[0].getAttribute('data-color')).toBe('#16a34a')
    localStorage.removeItem('nt_theme')
  })
})
