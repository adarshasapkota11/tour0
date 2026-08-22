import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminDashboard from './AdminDashboard.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    get: vi.fn(),
  },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('recharts', () => {
  const stub = ({ children, dataKey, data: _data }) => (
    <div data-testid={`recharts-${dataKey || 'container'}`}>{children}</div>
  )
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
    AreaChart: stub,
    BarChart: stub,
    PieChart: stub,
    Area: () => null,
    Bar: () => null,
    Pie: () => null,
    Cell: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
  }
})

const statsPayload = {
  stats: {
    total_bookings: 42,
    pending_bookings: 3,
    today_bookings: 2,
    revenue: 1250000,
    top_activities: [['Everest Base Camp', 5]],
  },
  recent_bookings: [
    {
      id: 1,
      activity_name: 'Annapurna Circuit',
      user_email: 'a@example.com',
      travel_date: '2026-09-01',
      status: 'confirmed',
    },
  ],
  chart: {
    labels: ['Jan'],
    bookings_by_month: [3],
    revenue_by_month: [90000],
    bookings_by_status: { confirmed: 2, pending: 1 },
    top_destinations: [['Pokhara', 4]],
  },
}

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: statsPayload })
  })

  it('renders stat cards with formatted revenue', async () => {
    renderDashboard()
    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(screen.getByText('Rs 1,250,000')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders recent bookings and top activities', async () => {
    renderDashboard()
    expect(await screen.findByText('Annapurna Circuit')).toBeInTheDocument()
    expect(screen.getByText('a@example.com · 2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('Everest Base Camp')).toBeInTheDocument()
    expect(screen.getByText('5 bookings')).toBeInTheDocument()
  })

  it('renders the chart sections', async () => {
    renderDashboard()
    expect(await screen.findByText('Bookings by month')).toBeInTheDocument()
    expect(screen.getByText('Revenue by month (Rs)')).toBeInTheDocument()
    expect(screen.getByText('Bookings by status')).toBeInTheDocument()
    expect(screen.getByText('Top destinations')).toBeInTheDocument()
  })
})
