import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import DestinationDetail from './DestinationDetail.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn() },
}))

vi.mock('../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('leaflet', () => ({
  default: { divIcon: vi.fn(() => ({})) },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  Marker: () => null,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => null,
  GeoJSON: () => null,
  useMap: () => ({ fitBounds: vi.fn() }),
}))

const destination = {
  id: 1,
  name: 'Pokhara',
  slug: 'pokhara',
  province: 'Gandaki',
  description: 'The jewel of the Himalayas.',
  latitude: '28.2096',
  longitude: '83.9856',
  activity_count: 3,
  is_featured: true,
  gallery: [],
  visit_packages: [
    {
      id: 10,
      name: 'Pokhara Weekend',
      days: 2,
      price: 3000,
      description: 'A short getaway to Pokhara.',
    },
  ],
}

const activities = {
  count: 1,
  results: [
    {
      id: 10,
      name: 'Paragliding',
      slug: 'paragliding',
      price: 80,
      duration: '30 min',
      difficulty: 'easy',
      destination_name: 'Pokhara',
      category_name: 'Adventure',
    },
  ],
}

function renderDest(slug = 'pokhara') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/destinations/${slug}`]}>
          <Routes>
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>,
  )
}

describe('DestinationDetail', () => {
  beforeEach(() => {
    mocks.get.mockReset()
  })

  it('shows loading initially', () => {
    mocks.get.mockReturnValue(new Promise(() => {}))
    renderDest()
    expect(screen.getByText(/Loading/)).toBeInTheDocument()
  })

  it('renders destination name, province, and description', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/activities/')) return Promise.resolve({ data: activities })
      return Promise.resolve({ data: destination })
    })
    renderDest()
    expect(await screen.findByText('Pokhara')).toBeInTheDocument()
    expect(screen.getByText('The jewel of the Himalayas.')).toBeInTheDocument()
    expect(screen.getByText('Gandaki')).toBeInTheDocument()
  })

  it('renders visit packages when present', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/activities/')) return Promise.resolve({ data: activities })
      return Promise.resolve({ data: destination })
    })
    renderDest()
    expect(await screen.findByText('Pokhara Weekend')).toBeInTheDocument()
    expect(screen.getByText(/2 days/)).toBeInTheDocument()
  })

  it('shows activities for this destination', async () => {
    mocks.get.mockImplementation((url) => {
      if (url.includes('/activities/')) return Promise.resolve({ data: activities })
      return Promise.resolve({ data: destination })
    })
    renderDest()
    expect(await screen.findByText('Paragliding')).toBeInTheDocument()
  })

  it('shows error state on failure', async () => {
    mocks.get.mockRejectedValue(new Error('Not found'))
    renderDest('bad-slug')
    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })
})
