import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Home from './Home.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
  },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ eventHandlers }) => (
    <button type="button" data-testid="map-pin" onClick={eventHandlers?.click} />
  ),
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => null,
  GeoJSON: () => null,
  useMap: () => ({ fitBounds: vi.fn() }),
}))

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname + location.search}</span>
}

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Home />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const pokhara = {
  id: 1,
  name: 'Pokhara',
  slug: 'pokhara',
  province: 'Gandaki',
  latitude: '28.2096',
  longitude: '83.9856',
  activity_count: 3,
  is_featured: true,
}

describe('Home hero', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({
      data: { count: 1, results: [pokhara] },
    })
  })

  it('renders the headline, CTAs and map background', () => {
    renderHome()
    expect(screen.getByText('Explore Nepal,')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Activities' })).toHaveAttribute(
      'href',
      '/activities',
    )
    expect(screen.getByRole('link', { name: 'Explore Destinations' })).toHaveAttribute(
      'href',
      '/destinations',
    )
    expect(screen.getByTestId('map')).toBeInTheDocument()
  })

  it('submits a search to /search with the query param', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.type(screen.getByLabelText('Search'), 'pokhara')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe('/search?q=pokhara')
    })
  })

  it('submits an empty search to /search', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe('/search')
    })
  })

  it('does not open the info card until a pin is clicked', async () => {
    renderHome()
    await waitFor(() => expect(mocks.get).toHaveBeenCalled())
    expect(screen.queryByRole('link', { name: 'View destination' })).not.toBeInTheDocument()
  })

  it('opens the info card when a destination pin is clicked', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByTestId('map-pin'))

    const viewLink = await screen.findByRole('link', { name: 'View destination' })
    expect(viewLink).toHaveAttribute('href', '/destinations/pokhara')
    expect(screen.getByText('Gandaki')).toBeInTheDocument()
  })

  it('closes the centered info card via the close button', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByTestId('map-pin'))
    expect(await screen.findByRole('link', { name: 'View destination' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'View destination' })).not.toBeInTheDocument()
    })
  })

  it('closes the info card when clicking outside it', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByTestId('map-pin'))
    expect(await screen.findByRole('link', { name: 'View destination' })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'View destination' })).not.toBeInTheDocument()
    })
  })

  it('closes the info card on Escape', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByTestId('map-pin'))
    expect(await screen.findByRole('link', { name: 'View destination' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'View destination' })).not.toBeInTheDocument()
    })
  })
})
